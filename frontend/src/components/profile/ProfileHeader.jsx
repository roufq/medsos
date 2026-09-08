import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';
import { postApi } from '../../api/postApi';
import { Camera, Edit2, Check, X, Loader } from 'lucide-react';

const ProfileHeader = ({ profileUser, isOwnProfile, onProfileUpdated }) => {
  const { updateProfileState } = useAuth();
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState(profileUser.bio || '');
  const [updating, setUpdating] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';
  const defaultCover = 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?auto=format&fit=crop&q=80&w=1000';

  const avatar = profileUser.avatar_url || defaultAvatar;
  const cover = profileUser.cover_url || defaultCover;

  const handleBioSave = async () => {
    setUpdating(true);
    try {
      const updated = await userApi.updateProfile({ bio: bioText });
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      updateProfileState(updated);
      setEditingBio(false);
    } catch (e) {
      alert('Failed to update bio: ' + e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUpdating(true);
    try {
      const uploadRes = await postApi.uploadMedia(file);
      const updateData = {};
      if (type === 'avatar') {
        updateData.avatar_url = uploadRes.url;
      } else {
        updateData.cover_url = uploadRes.url;
      }

      const updated = await userApi.updateProfile(updateData);
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      updateProfileState(updated);
    } catch (e) {
      alert('Failed to upload photo: ' + e.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white border-b border-[#e0e3e6]">
      {/* Cover Image container */}
      <div className="relative h-48 md:h-72 w-full bg-gray-100 group">
        <img src={cover} alt="Cover" className="w-full h-full object-cover" />
        {isOwnProfile && (
          <>
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all active:scale-95"
            >
              <Camera size={16} /> Edit Cover Photo
            </button>
            <input
              type="file"
              ref={coverInputRef}
              onChange={(e) => handlePhotoUpload(e, 'cover')}
              accept="image/*"
              className="hidden"
            />
          </>
        )}
      </div>

      {/* Profile details container */}
      <div className="max-w-[940px] mx-auto px-4 pb-6 relative">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-24 mb-4">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-md bg-white group">
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            {isOwnProfile && (
              <>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Camera size={24} />
                </button>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={(e) => handlePhotoUpload(e, 'avatar')}
                  accept="image/*"
                  className="hidden"
                />
              </>
            )}
          </div>

          <div className="text-center md:text-left flex-grow space-y-1 py-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1C1E21] flex items-center justify-center md:justify-start gap-3">
              {profileUser.name}
              {updating && <Loader size={20} className="animate-spin text-blue-600" />}
            </h2>
            <p className="text-[#65676B] text-xs font-bold uppercase tracking-wider">
              {profileUser.role} Member
            </p>
          </div>
        </div>

        {/* Bio info area */}
        <div className="border-t border-gray-100 pt-4 flex flex-col items-center md:items-start max-w-xl">
          {editingBio ? (
            <div className="w-full space-y-2">
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                maxLength={200}
                rows={2}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-[#0866ff] focus:ring-0 outline-none resize-none"
                placeholder="Describe yourself..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingBio(false)}
                  className="px-3 py-1.5 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 flex items-center gap-1"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={handleBioSave}
                  disabled={updating}
                  className="px-4 py-1.5 bg-[#0866ff] hover:bg-[#0050cd] text-white rounded-lg text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Check size={14} /> Save
                </button>
              </div>
            </div>
          ) : (
            <div className="group flex items-start gap-3 text-center md:text-left">
              <p className="text-[#1c1e21] text-sm leading-relaxed italic">
                {profileUser.bio || 'No bio added yet.'}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => {
                    setBioText(profileUser.bio || '');
                    setEditingBio(true);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit Bio"
                >
                  <Edit2 size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
