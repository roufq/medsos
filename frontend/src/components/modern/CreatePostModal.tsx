import { useState, useRef } from 'react';
import { X, ArrowRight, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { User } from '../../types';
import { postApi } from '../../api/postApi';

export interface CreatePostPayload {
  title: string;
  text: string;
  imageUrl: string;
  linkUrl: string;
  hashtags: string[];
  mentions: string[];
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePostPayload) => Promise<void>;
  currentUser: User;
}

const MAX_HASHTAGS = 9;
const MAX_MENTIONS = 10;

function parseTags(raw: string, prefix: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of raw.split(/[\s,]+/)) {
    const value = part.trim().replace(new RegExp(`^\\${prefix}`), '').toLowerCase();
    if (value && !seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
}

export default function CreatePostModal({ isOpen, onClose, onSubmit, currentUser }: CreatePostModalProps) {
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<string>('');
  const [newPostLink, setNewPostLink] = useState('');
  const [newPostHashtags, setNewPostHashtags] = useState('');
  const [newPostMentions, setNewPostMentions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const hashtags = parseTags(newPostHashtags, '#');
  const mentions = parseTags(newPostMentions, '@');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await postApi.uploadMedia(file);
      setNewPostImage(res.url);
    } catch (error) {
      alert('Failed to upload image: ' + error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newPostText.trim() && !newPostTitle.trim()) return;
    setFormError('');
    if (hashtags.length > MAX_HASHTAGS) {
      setFormError(`Use at most ${MAX_HASHTAGS} hashtags (currently ${hashtags.length}).`);
      return;
    }
    if (mentions.length > MAX_MENTIONS) {
      setFormError(`Mention at most ${MAX_MENTIONS} users (currently ${mentions.length}).`);
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: newPostTitle.trim(),
        text: newPostText.trim(),
        imageUrl: newPostImage,
        linkUrl: newPostLink.trim(),
        hashtags,
        mentions,
      });
      setNewPostTitle('');
      setNewPostText('');
      setNewPostImage('');
      setNewPostLink('');
      setNewPostHashtags('');
      setNewPostMentions('');
      setShowLinkInput(false);
      onClose();
    } catch (e: any) {
      setFormError(e?.response?.data?.error || e?.message || 'Failed to post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs select-none animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-border-subtle flex flex-col gap-4 animate-modalSlideUp">
        
        <div className="flex justify-between items-center border-b border-border-subtle/15 pb-3">
          <h3 className="font-bold text-text-primary text-base">Create Post</h3>
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isUploading}
            className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface-container rounded-full cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-bold text-xs text-text-primary">{currentUser.name}</div>
            <div className="text-[10px] text-text-secondary">{currentUser.title} at {currentUser.company}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <input 
            type="text"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            placeholder="Post Title (Optional)"
            className="w-full text-sm font-bold border-0 px-0 focus:ring-0 placeholder:text-outline text-text-primary"
          />
          <textarea 
            rows={4}
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="What professional insight would you like to share today?"
            className="w-full text-sm border-0 px-0 resize-none outline-none focus:ring-0 placeholder:text-outline text-text-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div>
            <input
              type="text"
              value={newPostHashtags}
              onChange={(e) => setNewPostHashtags(e.target.value)}
              placeholder="Hashtags (optional), e.g. #career #tech #hiring"
              className="w-full text-xs bg-surface-container-low px-3 py-2 rounded-lg border border-border-subtle/50 focus:ring-0 focus:border-primary placeholder:text-outline text-text-primary"
            />
            <div className="text-[10px] text-text-secondary mt-1 px-1">
              {hashtags.length}/{MAX_HASHTAGS} hashtags (optional)
            </div>
          </div>
          <div>
            <input
              type="text"
              value={newPostMentions}
              onChange={(e) => setNewPostMentions(e.target.value)}
              placeholder="Mention users (optional), e.g. @jane @john"
              className="w-full text-xs bg-surface-container-low px-3 py-2 rounded-lg border border-border-subtle/50 focus:ring-0 focus:border-primary placeholder:text-outline text-text-primary"
            />
            <div className="text-[10px] text-text-secondary mt-1 px-1">
              {mentions.length}/{MAX_MENTIONS} mentions (optional)
            </div>
          </div>
        </div>

        {formError && (
          <div className="text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
            {formError}
          </div>
        )}

        {showLinkInput && (
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg border border-border-subtle/50">
            <LinkIcon className="w-4 h-4 text-text-secondary" />
            <input 
              type="url"
              value={newPostLink}
              onChange={(e) => setNewPostLink(e.target.value)}
              placeholder="https://example.com"
              className="w-full text-xs border-0 bg-transparent focus:ring-0 p-0 text-text-primary"
            />
            <button onClick={() => { setShowLinkInput(false); setNewPostLink(''); }} className="text-text-secondary hover:text-error">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {newPostImage && (
          <div className="h-40 bg-surface-container overflow-hidden rounded-xl border border-border-subtle/20 relative group">
            <img src={newPostImage} alt="Upload preview" className="w-full h-full object-cover" />
            <button 
              type="button"
              onClick={() => setNewPostImage('')}
              className="absolute top-2 right-2 bg-black/60 text-white hover:bg-black/80 rounded-full p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-border-subtle/20">
          <div className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*,video/*" 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-text-secondary hover:bg-surface-container transition-colors"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              <span>{isUploading ? 'Uploading...' : 'Media'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowLinkInput(!showLinkInput)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${showLinkInput || newPostLink ? 'bg-secondary-container text-primary' : 'text-text-secondary hover:bg-surface-container'}`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Link</span>
            </button>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high font-semibold text-xs rounded-xl cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="button"
              disabled={(!newPostText.trim() && !newPostTitle.trim() && !newPostImage && !newPostLink) || isSubmitting || isUploading}
              onClick={handleSubmit}
              className="px-5 py-2 bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-white hover:brightness-105 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1 shadow-xs"
            >
              <span>{isSubmitting ? 'Publishing...' : 'Publish'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
