import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Heart, MessageCircle, Share2, Globe } from 'lucide-react';
import LinkPreviewCard from './LinkPreviewCard';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const avatar = post.user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';

  const isOwner = user?.id === post.user_id;

  return (
    <div className="bg-white border border-[#e0e3e6] rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      {/* Post Owner Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.user_id}`}>
            <img
              src={avatar}
              alt="Author"
              className="w-10 h-10 rounded-full object-cover border border-gray-100"
            />
          </Link>
          <div>
            <Link
              to={`/profile/${post.user_id}`}
              className="font-bold text-sm text-[#1C1E21] hover:underline block"
            >
              {post.user?.name}
            </Link>
            <div className="flex items-center gap-1 text-[11px] text-[#65676B] font-semibold">
              <span>
                {new Date(post.created_at).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span>•</span>
              <Globe size={12} className="text-[#65676B]" />
            </div>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => onDelete(post.id)}
            className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors"
            title="Delete Post"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Post Text Description */}
      {post.content && (
        <div className="px-4 pb-3 text-[14px] text-[#1C1E21] whitespace-pre-wrap leading-relaxed break-words font-normal">
          {post.content}
        </div>
      )}

      {/* Gallery Media (Image/Video) */}
      {post.media && post.media.length > 0 && (
        <div className="border-y border-gray-100 bg-[#f7f9fc] flex flex-col gap-1">
          {post.media.map((item) => (
            <div key={item.id} className="relative w-full max-h-[420px] overflow-hidden flex items-center justify-center">
              {item.media_type === 'image' ? (
                <img
                  src={item.media_url}
                  alt="Attachment"
                  className="w-full object-cover max-h-[420px]"
                />
              ) : (
                <video
                  src={item.media_url}
                  controls
                  className="w-full max-h-[420px] bg-black"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Shared Web Hyperlink Preview */}
      {post.post_type === 'link' && post.link && (
        <div className="px-4 pb-3 pt-1">
          <LinkPreviewCard link={post.link} />
        </div>
      )}

      {/* Reaction Action buttons */}
      <div className="border-t border-gray-100/80 px-4 py-1 flex items-center justify-between text-xs font-semibold text-[#65676B]">
        <button className="flex-1 py-2 hover:bg-[#f0f2f5] rounded-lg flex items-center justify-center gap-2 transition-colors hover:text-red-500">
          <Heart size={18} /> Like
        </button>
        <button className="flex-1 py-2 hover:bg-[#f0f2f5] rounded-lg flex items-center justify-center gap-2 transition-colors hover:text-blue-500">
          <MessageCircle size={18} /> Comment
        </button>
        <button className="flex-1 py-2 hover:bg-[#f0f2f5] rounded-lg flex items-center justify-center gap-2 transition-colors hover:text-indigo-500">
          <Share2 size={18} /> Share
        </button>
      </div>
    </div>
  );
};

export default PostCard;
