import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { postApi } from '../../api/postApi';
import { Image, Video, Link as LinkIcon, X, Loader } from 'lucide-react';
import LinkPreviewCard from './LinkPreviewCard';

const PostForm = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPreview, setLinkPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);

  const avatar = user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile && !linkPreview) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);

      let postType = 'text';
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

      setContent('');
      clearMedia();
      clearLink();
    } catch (err) {
      alert('Failed to publish post: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-[#e0e3e6] rounded-xl p-4 shadow-sm space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar and Textarea */}
        <div className="flex gap-3">
          <img
            src={avatar}
            alt="User Avatar"
            className="w-10 h-10 rounded-full object-cover border border-gray-100"
          />
          <textarea
            placeholder={`What's on your mind, ${user?.name.split(' ')[0]}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="flex-grow text-sm placeholder-gray-500 text-gray-800 border-none focus:ring-0 resize-none outline-none py-1.5"
          />
        </div>

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
              <span>Photo</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            <label className="flex items-center gap-2 px-3 py-2 hover:bg-[#f0f2f5] rounded-lg cursor-pointer transition-colors text-[#65676B] hover:text-[#F02849] text-xs font-bold">
              <Video size={18} />
              <span>Video</span>
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
              <span>Link</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || (!content.trim() && !mediaFile && !linkPreview)}
            className="bg-[#0866ff] hover:bg-[#0050cd] disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none text-white text-xs font-bold px-6 py-2.5 rounded-lg active:scale-95 transition-all shadow-md shadow-blue-500/10 flex items-center gap-1.5"
          >
            {submitting ? <Loader size={14} className="animate-spin" /> : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
