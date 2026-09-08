import React from 'react';
import PostCard from '../post/PostCard';

const ProfilePostList = ({ posts, onDeletePost }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white border border-[#e0e3e6] rounded-xl p-8 text-center text-gray-500 shadow-sm">
        <p className="font-semibold text-sm">No posts to display.</p>
        <p className="text-xs text-gray-400">Publish updates to populate the user timeline.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={onDeletePost} />
      ))}
    </div>
  );
};

export default ProfilePostList;
