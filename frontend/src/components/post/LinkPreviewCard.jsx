import React from 'react';
import { ExternalLink } from 'lucide-react';

const LinkPreviewCard = ({ link }) => {
  if (!link) return null;

  const title = link.title || 'Shared Link';
  const description = link.description || 'Click to visit page and read more details.';
  const imageUrl = link.image_url;
  const siteName = link.site_name;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200/60 rounded-xl overflow-hidden hover:bg-gray-50/50 transition-all duration-300 group shadow-sm bg-white"
    >
      {imageUrl && (
        <div className="relative overflow-hidden aspect-[1.91/1] border-b border-gray-100">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-4 space-y-1">
        {siteName && (
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
            {siteName}
          </span>
        )}
        <h3 className="font-bold text-sm text-[#1C1E21] group-hover:text-blue-600 transition-colors line-clamp-1 flex items-center gap-1">
          {title} <ExternalLink size={12} className="text-gray-400 group-hover:text-blue-600" />
        </h3>
        <p className="text-xs text-[#65676B] line-clamp-2 leading-relaxed">
          {description}
        </p>
        <span className="text-[10px] text-gray-400 block pt-1 truncate">
          {link.url}
        </span>
      </div>
    </a>
  );
};

export default LinkPreviewCard;
