import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { postApi } from '../../api/postApi';
import { Image, Video, Link as LinkIcon, X, Loader, MapPin, Globe, Lock, ShoppingBag, Store } from 'lucide-react';
import LinkPreviewCard from './LinkPreviewCard';

const PostForm = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPreview, setLinkPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isShopMode, setIsShopMode] = useState(false);
  const [shopData, setShopData] = useState({
    price_minor: '',
    currency: 'IDR',
    category: '',
    condition: 'new',
    stock: '',
    brand: '',
    fulfillment: [],
    payment_method: '',
  });


  const avatar = user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';

  // Word counter
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const isDescriptionValid = isShopMode ? (wordCount > 0 && wordCount <= 6000) : (wordCount >= 160 && wordCount <= 6000);
  const isTitleValid = title.trim().length >= 5 && title.trim().length <= 100;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const isVideo = file.type.startsWith('video/');
      setMediaType(isVideo ? 'video' : 'image');

      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear link configurations
      setLinkUrl('');
      setLinkPreview(null);
      setShowLinkInput(false);
    }
  };

  const handleLinkFetch = async () => {
    if (!linkUrl) return;
    setLoadingPreview(true);
    setLinkPreview(null);
    try {
      const data = await postApi.getLinkPreview(linkUrl);
      setLinkPreview(data);
    } catch (e) {
      setLinkPreview({
        url: linkUrl,
        title: 'Shared Link',
        description: linkUrl,
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const clearLink = () => {
    setLinkUrl('');
    setLinkPreview(null);
    setShowLinkInput(false);
  };

  const extractTagsAndMentions = (text) => {
    const hashtags = [];
    const mentions = [];
    const words = text.split(/\s+/);
    words.forEach(word => {
      if (word.startsWith('#') && word.length > 1) hashtags.push(word.substring(1));
      if (word.startsWith('@') && word.length > 1) mentions.push(word.substring(1));
    });
    return { hashtags, mentions };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isTitleValid || !isDescriptionValid) {
       alert('Pastikan Judul (5-100 karakter) dan Deskripsi (160-6000 kata) sudah sesuai syarat.');
       return;
    }

    setSubmitting(true);
    try {
      const { hashtags, mentions } = extractTagsAndMentions(content);
      
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content);
      formData.append('visibility', visibility);
      if (location.trim()) formData.append('location', location.trim());
      if (hashtags.length) formData.append('hashtags', JSON.stringify(hashtags));
      if (mentions.length) formData.append('mentions', JSON.stringify(mentions));

      
      if (isShopMode) {
        postType = 'shop';
        formData.append('price_minor', shopData.price_minor);
        formData.append('currency', shopData.currency);
        formData.append('category', shopData.category);
        formData.append('condition', shopData.condition);
        if (shopData.stock) formData.append('stock', shopData.stock);
        if (shopData.brand) formData.append('brand', shopData.brand);
        if (shopData.fulfillment.length) formData.append('fulfillment', shopData.fulfillment.join(','));
        if (shopData.payment_method) formData.append('payment_method', shopData.payment_method);
      }

      let postType = isShopMode ? 'shop' : 'text';
      if (mediaFile) {
        formData.append('media', mediaFile);
        postType = mediaType;
      } else if (linkPreview) {
        formData.append('link_url', linkPreview.url);
        postType = 'link';
      }
      formData.append('post_type', postType);

      const newPost = await postApi.createPost(formData);
      onPostCreated(newPost);

      setTitle('');
      setContent('');
      setLocation('');
      setVisibility('public');
      clearMedia();
      clearLink();
      setShowSettings(false);
      setIsShopMode(false);
      setShopData({ price_minor: '', currency: 'IDR', category: '', condition: 'new', stock: '', brand: '', fulfillment: [], payment_method: '' });
    } catch (err) {
      alert('Gagal membuat postingan: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-[#e0e3e6] rounded-xl p-4 shadow-sm space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Header Input */}
        <div className="flex flex-col gap-2 border-b border-gray-100 pb-2">
          <input
            type="text"
            placeholder={isShopMode ? "Nama Produk (5 - 100 karakter)" : "Judul Postingan (5 - 100 karakter)"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-md font-semibold placeholder-gray-400 text-gray-800 border-none focus:ring-0 outline-none w-full bg-transparent"
          />
          <div className="text-xs text-right text-gray-400">
            {title.length}/100
          </div>
        </div>

        {/* Avatar and Textarea */}
        <div className="flex gap-3">
          <img
            src={avatar}
            alt="User Avatar"
            className="w-10 h-10 rounded-full object-cover border border-gray-100"
          />
          <div className="flex-grow flex flex-col">
            <textarea
              placeholder={isShopMode ? `Deskripsi produk Anda secara lengkap...` : `Deskripsi postingan Anda (minimal 160 kata), gunakan #hashtag atau @mention...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="text-sm placeholder-gray-500 text-gray-800 border-none focus:ring-0 resize-none outline-none py-1.5 w-full bg-transparent"
            />
            <div className={`text-xs text-right mt-1 font-medium ${isDescriptionValid ? 'text-green-500' : 'text-red-400'}`}>
              {wordCount} / 6000 kata {isShopMode ? "" : "(Min. 160 kata)"}
            </div>
          </div>
        </div>

        
        {/* Shop Mode Inputs */}
        {isShopMode && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100 mb-2">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 font-semibold mb-1 block">Harga & Mata Uang *</label>
              <div className="flex gap-2">
                <select 
                  value={shopData.currency} 
                  onChange={(e) => setShopData({...shopData, currency: e.target.value})}
                  className="text-xs border border-gray-200 rounded-md outline-none bg-white p-1.5 w-24"
                >
                  <option value="IDR">IDR (Rp)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Harga (Misal: 150000)" 
                  value={shopData.price_minor}
                  onChange={(e) => setShopData({...shopData, price_minor: e.target.value})}
                  className="text-xs border border-gray-200 rounded-md outline-none bg-white p-1.5 flex-1"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">Kategori Produk *</label>
              <select 
                value={shopData.category} 
                onChange={(e) => setShopData({...shopData, category: e.target.value})}
                className="text-xs border border-gray-200 rounded-md outline-none bg-white p-1.5 w-full"
              >
                <option value="">Pilih Kategori</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Fashion">Fashion</option>
                <option value="Kecantikan">Kecantikan</option>
                <option value="Otomotif">Otomotif</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">Kondisi Barang *</label>
              <select 
                value={shopData.condition} 
                onChange={(e) => setShopData({...shopData, condition: e.target.value})}
                className="text-xs border border-gray-200 rounded-md outline-none bg-white p-1.5 w-full"
              >
                <option value="new">Baru</option>
                <option value="used">Bekas</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">Stok (Opsional)</label>
              <input 
                type="number" 
                placeholder="Jumlah unit" 
                value={shopData.stock}
                onChange={(e) => setShopData({...shopData, stock: e.target.value})}
                className="text-xs border border-gray-200 rounded-md outline-none bg-white p-1.5 w-full"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">Merek (Opsional)</label>
              <input 
                type="text" 
                placeholder="Merek produk" 
                value={shopData.brand}
                onChange={(e) => setShopData({...shopData, brand: e.target.value})}
                className="text-xs border border-gray-200 rounded-md outline-none bg-white p-1.5 w-full"
              />
            </div>
          </div>
        )}

        {/* Optional Settings Drawer */}
        {showSettings && (
          <div className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 mt-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-semibold mb-1 block">Lokasi</label>
              <div className="flex items-center bg-white border border-gray-200 rounded-md px-2 py-1">
                <MapPin size={14} className="text-gray-400 mr-1" />
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="Tambah Lokasi" 
                  className="text-xs border-none outline-none w-full"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-semibold mb-1 block">Siapa yang bisa melihat?</label>
              <div className="flex items-center bg-white border border-gray-200 rounded-md px-2 py-1">
                {visibility === 'public' ? <Globe size={14} className="text-gray-400 mr-1" /> : <Lock size={14} className="text-gray-400 mr-1" />}
                <select 
                  value={visibility} 
                  onChange={(e) => setVisibility(e.target.value)}
                  className="text-xs border-none outline-none w-full bg-transparent cursor-pointer"
                >
                  <option value="public">Publik</option>
                  <option value="followers">Hanya Pengikut</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Attachment Image/Video Preview */}
        {mediaPreview && (
          <div className="relative border border-gray-100 rounded-xl overflow-hidden bg-black max-h-[300px] flex items-center justify-center">
            {mediaType === 'image' ? (
              <img
                src={mediaPreview}
                alt="Preview"
                className="max-h-[300px] object-contain w-full"
              />
            ) : (
              <video
                src={mediaPreview}
                controls
                className="max-h-[300px] object-contain w-full"
              />
            )}
            <button
              type="button"
              onClick={clearMedia}
              className="absolute top-2.5 right-2.5 p-1.5 bg-gray-900/60 hover:bg-gray-900/80 rounded-full text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Link Input Tray */}
        {showLinkInput && !mediaFile && (
          <div className="border border-gray-200 p-3 rounded-xl space-y-2 bg-[#f7f9fc]">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste URL link here (e.g. https://google.com)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="flex-grow border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:border-[#0866ff] focus:ring-0 outline-none bg-white"
              />
              <button
                type="button"
                onClick={handleLinkFetch}
                disabled={loadingPreview}
                className="bg-[#0866ff] hover:bg-[#0050cd] text-white text-xs font-semibold px-4 py-1.5 rounded-lg active:scale-95 transition-all flex items-center gap-1"
              >
                {loadingPreview ? <Loader size={12} className="animate-spin" /> : 'Fetch'}
              </button>
              <button
                type="button"
                onClick={clearLink}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Scraped Link Card Preview */}
        {linkPreview && (
          <div className="relative">
            <LinkPreviewCard link={linkPreview} />
            <button
              type="button"
              onClick={clearLink}
              className="absolute top-2.5 right-2.5 p-1.5 bg-gray-900/60 hover:bg-gray-900/80 rounded-full text-white transition-colors animate-fade-in"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t border-[#e0e3e6] pt-3 flex items-center justify-between">
          <div className="flex gap-1">
            <label className="flex items-center gap-2 px-3 py-2 hover:bg-[#f0f2f5] rounded-lg cursor-pointer transition-colors text-[#65676B] hover:text-[#31A24C] text-xs font-bold">
              <Image size={18} />
              <span className="hidden sm:inline">Photo</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            <label className="flex items-center gap-2 px-3 py-2 hover:bg-[#f0f2f5] rounded-lg cursor-pointer transition-colors text-[#65676B] hover:text-[#F02849] text-xs font-bold">
              <Video size={18} />
              <span className="hidden sm:inline">Video</span>
              <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
            </label>
            <button
              type="button"
              onClick={() => setShowLinkInput(!showLinkInput)}
              disabled={!!mediaFile}
              className={`flex items-center gap-2 px-3 py-2 hover:bg-[#f0f2f5] rounded-lg transition-colors text-[#65676B] hover:text-blue-600 text-xs font-bold ${
                !!mediaFile ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <LinkIcon size={18} />
              <span className="hidden sm:inline">Link</span>
            </button>
            
            <button
              type="button"
              onClick={() => setIsShopMode(!isShopMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-xs font-bold ${isShopMode ? 'bg-blue-50 text-[#0866ff]' : 'hover:bg-[#f0f2f5] text-[#65676B]'}`}
            >
              <Store size={18} />
              <span className="hidden sm:inline">Jual</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-[#f0f2f5] rounded-lg transition-colors text-[#65676B] text-xs font-bold"
            >
              <MapPin size={18} />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || !isTitleValid || !isDescriptionValid}
            className="bg-[#0866ff] hover:bg-[#0050cd] disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none text-white text-xs font-bold px-6 py-2.5 rounded-lg active:scale-95 transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            {submitting ? <Loader size={14} className="animate-spin" /> : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;

