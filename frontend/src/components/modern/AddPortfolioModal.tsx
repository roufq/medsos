import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Briefcase, Link as LinkIcon, Type } from 'lucide-react';
import { postApi } from '../../api/postApi';

interface AddPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPortfolio: any) => void;
}

export default function AddPortfolioModal({ isOpen, onClose, onSuccess }: AddPortfolioModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('Design');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedFile) {
      alert('Title and Image are required!');
      return;
    }

    try {
      setIsSubmitting(true);
      // 1. Upload the image first
      const uploadRes = await postApi.uploadMedia(selectedFile);
      const imageUrl = uploadRes.url;

      // 2. Call onSuccess which will create the portfolio via userApi
      onSuccess({
        title,
        description,
        project_type: projectType,
        image_url: imageUrl,
        link_url: linkUrl
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setProjectType('Design');
      setLinkUrl('');
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      alert('Failed to save portfolio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-modalSlideUp flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle/50">
          <h2 className="text-lg font-bold text-text-primary">Add Featured Work</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-container transition-colors text-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          
          {/* Image Upload Area */}
          <div>
            <label className="text-xs font-semibold text-text-secondary pl-1 mb-1 block">Project Image *</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container/50 transition-colors relative overflow-hidden group"
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">Change Image</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-text-secondary">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm font-medium">Click to upload image</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileSelect} 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary pl-1">Project Title *</label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. E-Commerce Redesign"
                className="w-full border border-border-subtle pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary pl-1">Project Type</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <select 
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full border border-border-subtle pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-transparent"
              >
                <option value="Design">Design / UI UX</option>
                <option value="Development">Development</option>
                <option value="Case Study">Case Study</option>
                <option value="Illustration">Illustration</option>
                <option value="Photography">Photography</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary pl-1">External Link (Optional)</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input 
                type="url" 
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://behance.net/..."
                className="w-full border border-border-subtle pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-secondary pl-1">Short Description</label>
            <textarea 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this project is about..."
              className="w-full border border-border-subtle px-4 py-2.5 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Footer inside form to submit */}
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border-subtle/50">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high transition-colors font-semibold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !title || !selectedFile}
              className="px-5 py-2 bg-primary text-white hover:brightness-105 transition-colors font-bold text-xs rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? 'Saving...' : 'Save Portfolio'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
