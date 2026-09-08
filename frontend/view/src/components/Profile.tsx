import { useState } from 'react';
import { 
  Camera, 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  LayoutGrid, 
  List, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Edit3,
  Globe,
  Settings as SettingsIcon
} from 'lucide-react';
import { User, Post } from '../types';

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onNavigateToMessages: () => void;
  profilePosts: Post[];
  onLikePost: (postId: string) => void;
}

export default function Profile({
  user,
  onUpdateUser,
  onNavigateToMessages,
  profilePosts,
  onLikePost
}: ProfileProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeLayout, setActiveLayout] = useState<'grid' | 'list'>('grid');

  // Edit fields backup inside state
  const [editName, setEditName] = useState(user.name);
  const [editTitle, setEditTitle] = useState(user.title);
  const [editCompany, setEditCompany] = useState(user.company);
  const [editLocation, setEditLocation] = useState(user.location || '');
  const [editBio, setEditBio] = useState(user.bio || '');
  const [editWebsite, setEditWebsite] = useState(user.website || '');

  // Cover photo options list
  const coverUrls = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBNRe7599PvPWjme4G1AfCuqcb7I6UtEfFvUtdGPnRFJECAdNMFPb1kcrd9KwQ_87mYgQbHbQ2ctj_ZHqmtJb_doWqfMrutKHzE7NQNjLUInqnZIHZ4XTX8S7sOChktBxP-tn-PkdoXLSH-k4ukJZ4jLc_2aqQjsALi4S_HCg7wMsqDjgVxO13OFWIvo9OuSY2Qsru3E1aCOcXRmRjxobRIn1NFEHlFaK23OQ43zvup3-6gZZfNtg6PyGcHnDft9Db2izkVaYVWIaQ',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop'
  ];

  const handleEditSave = () => {
    onUpdateUser({
      ...user,
      name: editName,
      title: editTitle,
      company: editCompany,
      location: editLocation,
      bio: editBio,
      website: editWebsite
    });
    setIsEditModalOpen(false);
  };

  const handleCoverChange = (url: string) => {
    onUpdateUser({
      ...user,
      coverImage: url
    });
  };

  return (
    <div className="max-w-[1000px] mx-auto py-8">
      {/* Profile Hero section */}
      <div className="relative mb-8">
        {/* Cover image wrap */}
        <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden relative shadow-sm border border-border-subtle/50 bg-surface-container">
          <img 
            src={user.coverImage} 
            alt="Cover background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Cover editor selector */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            {coverUrls.map((url, idx) => (
              <button
                key={idx}
                onClick={() => handleCoverChange(url)}
                className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-md bg-cover bg-center cursor-pointer hover:scale-110 active:scale-95 transition-all"
                style={{ backgroundImage: `url(${url})` }}
                title={`Change color cover theme ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Profile Info alignment overlap */}
        <div className="px-8 -mt-16 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 select-none">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-background bg-background shadow-md overflow-hidden flex-shrink-0 relative group">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div 
                onClick={() => setIsEditModalOpen(true)}
                className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
              >
                <Camera className="w-6 h-6" />
              </div>
            </div>

            <div className="text-center md:text-left pb-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="font-bold text-2xl md:text-3xl text-text-primary tracking-tight">{user.name}</h2>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-text-secondary hover:text-primary p-1 rounded-full cursor-pointer transition-colors"
                  title="Edit profile information"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <p className="font-semibold text-sm text-text-secondary mb-1">
                {user.title} @ <span className="text-primary font-bold">{user.company}</span>
              </p>
              {user.location && (
                <p className="text-xs text-outline flex items-center justify-center md:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{user.location}</span>
                </p>
              )}
            </div>
          </div>

          {/* Social connections actions button panel */}
          <div className="flex gap-3 pb-2 justify-center">
            <button 
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-6 py-2.5 rounded-full font-bold shadow-sm transition-all text-xs cursor-pointer select-none ${
                isFollowing 
                  ? 'bg-success text-white hover:brightness-105' 
                  : 'bg-primary text-white hover:brightness-110 active:scale-95'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button 
              onClick={onNavigateToMessages}
              className="bg-secondary-container text-on-secondary-container px-6 py-2.5 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer selection:bg-transparent"
            >
              Message
            </button>
          </div>
        </div>
      </div>

      {/* Profile Main Content Layout (Left card column + Featured Work grid column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column info metadata stats */}
        <div className="lg:col-span-1 flex flex-col gap-6 select-none">
          {/* Bio about details block */}
          <div className="bg-white rounded-2xl p-6 border border-border-subtle/50 shadow-sm">
            <h3 className="font-bold text-text-primary text-base mb-4">About</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              {user.bio}
            </p>
            <div className="space-y-3 pt-3 border-t border-border-subtle/20">
              {user.website && (
                <div className="flex items-center gap-3 text-text-secondary">
                  <LinkIcon className="w-4 h-4 text-primary" />
                  <a className="text-xs font-semibold text-primary hover:underline" href={`https://${user.website}`} target="_blank" rel="noreferrer">
                    {user.website}
                  </a>
                </div>
              )}
              {user.joinedDate && (
                <div className="flex items-center gap-3 text-text-secondary">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">{user.joinedDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills expertise badges */}
          <div className="bg-white rounded-2xl p-6 border border-border-subtle/50 shadow-sm">
            <h3 className="font-bold text-text-primary text-base mb-4">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {user.expertise?.map((tag) => (
                <span 
                  key={tag} 
                  className="bg-secondary-fixed text-on-secondary-fixed-variant px-3.5 py-1.5 rounded-full font-semibold text-xs text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Network fast connections preview */}
          <div className="bg-white rounded-2xl p-6 border border-border-subtle/50 shadow-sm animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-text-primary text-base">Network</h3>
              <span className="text-primary font-bold text-xs hover:underline cursor-pointer">
                {user.networkCount} connections
              </span>
            </div>
            
            {/* 4 network grid cells */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { name: 'Marcus Holloway', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvcd5bGYnbFUZ7YtQ3FLVHDwGTj5Cy8kaSNDRHNysfmKbWcl-zEJxBZ73mhLhs-VehP5q5ZORZXzjw9r1zuIeZijsqbMM6SDOniOb7zHleG4VYC0qmEXSl91l8EwVg0023YkUzIBRxVTo3CT0Cal4TjAYmpmadytlltDZOwobBrIZQJXST6nzrXDdB1z_ErFrG39oH_D3k40UsEIaKDHNKe7HhVvy0A-zvhEAhxYn-SstPZpvOZYi05-Wkj63tSFyyrFYui0YnqwI' },
                { name: 'Sarah Chen', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnwasLonkl65aqS1BSliBHMmL7bL-QV8V3Klns2NtVzCi9N2uTVdK-qMvslBLu82IL6vkXb95sh3GY8zddzVHlVAY4_aKMa-ZeSKC7mIIBV2Wqo__tWRHf9h_-SR9EJccTob9dQXsPOuVxQIGtN8BC3kbgX5NtNmEFsMVTiDg-AuamUgtq86WNxmcrgtf83HOmrGtiGd_2X3oU2ZLkGgIQ95QH65bPslsgi5eryTsko87R-hSo2N_Xz7VxPhvA_hPuZHlZAaXKW8c' },
                { name: 'Elena Rodriguez', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAn4yY9AHfgHf5xSDNmE2A_L8DgJV3uWazYrzWuZumv1lrZwSzNTy_txsCyzyjHJwa_RCAMj3-jpkiZDeAQejuQH9-SfGrYGVO20mpRl9bH2mMrmj1j1KJLx1lePrt_iaSi4pehX40r--N232fR7mpquvoZPcdW3BdBpeOcPekx3tLOUzgfyNN9gqcMYpExpiZ5hm73m_hcAslYaQYwfuIKQNchDQ9O-Uor4rYDfKDlVewLOW3KacaJhso7-C43V3Jjrt76AqC1I8' },
                { name: 'David Kim', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCedLssi65pkFtXaIA57YXi66Ok0ZGTRYJd7g98hae6DomlVgcljphZ0b_E0rgP2rTJgvEwD6wLrbFO2TiTN7zvI2H027q3GyneqDLexQlHDddxmqrtJG5sknAbg-ZR4zvrdXMcehkDHSekt5HsDLsoYJ3-kYn7qdA7cIVsExv6B7PxdG0NakMRJZO91vjo1zSzOTUowZWgC-y-_jYPVqYlNNI-J6J3J-7jvoGXGgBJti14Nbdp-fxGbxN1lxFuExwFDoQOCV2IICA' }
              ].map((conn, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-surface-container relative group cursor-pointer" title={conn.name}>
                  <img src={conn.img} alt={conn.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column bento grid + activity posts */}
        <div className="lg:col-span-2">
          
          {/* Header layout controls */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text-primary text-xl tracking-tight">Featured Work</h3>
            <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-border-subtle/50 shadow-sm select-none">
              <button 
                onClick={() => setActiveLayout('grid')}
                className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                  activeLayout === 'grid' 
                    ? 'bg-secondary-container text-primary' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <LayoutGrid className="w-4.5 h-4.5" />
              </button>
              <button 
                onClick={() => setActiveLayout('list')}
                className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                  activeLayout === 'list' 
                    ? 'bg-secondary-container text-primary' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <List className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Bento grid layout screen */}
          {activeLayout === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 select-none">
              
              {/* Bento Item 1: Large dashboard span 2 */}
              <div className="md:col-span-2 md:row-span-2 bg-white rounded-2xl overflow-hidden border border-border-subtle/50 shadow-sm relative group cursor-pointer min-h-[320px]">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX473lmGHuHrg3PiCOqa_BvMwU5CbcPaqsmZms_pwqozXlQZbiVdbc_EFv3U8JTjZ_t6vPcpULgue2ZfrE6QrD4IISTt2fBd6kp2UdNYcvYVkricIdTfl4-WqmuVo4XjFsp98JGssiSQ-86ZTQaC0kQBJgFdw0tT4mpgbjU4-Z48KcHf1ofmPSaE10TfY24C_5kx37cny661v1oF9S_9KHtE2i6GHr1qZQZ1F7nXQtt7BkgTQ9XFNjpQ7L4sUcY36w2S5HHk2RqF8" 
                  alt="UI platform architecture" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-primary-fixed-dim text-xs font-bold uppercase tracking-wider mb-2">Design Suite</span>
                  <h4 className="text-white font-bold text-lg md:text-xl mb-1.5">Connect Modern v2.0 Design System</h4>
                  <p className="text-white/80 text-xs leading-relaxed">
                    Redefining corporate connectivity metrics utilizing spacious typography arrays and subtle tonal layer models.
                  </p>
                </div>
              </div>

              {/* Bento Item 2: Portrait smartphone concept */}
              <div className="bg-white rounded-2xl overflow-hidden border border-border-subtle/50 shadow-sm relative group cursor-pointer min-h-[160px]">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfT_BKJRPs6eI9WVoJPQWWvl7kjzeM-j9SAmGnoOJYq7ms7i22YFbRhnNqM52xTjAdzFGngTwii-LwZRDtH2yyoSOvYBZzp73wznrYIKOP2EdKzAXfffP9SgNrS1EZSZSUxIHbc_1HAFnU8t6yryb8Kmukxe3TFxsJZobIAUmcS3t9aFZ__og-LvYJ29bdtqQDAudyCpn0NAY7m89cjZiiaJlBYLxt990JqnkHS2l0xbPi8BCdsPrH7jUHqeeVx_epVv11oDkoIGc" 
                  alt="Prototype detail" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center transition-all duration-200">
                  <span className="bg-white text-text-primary text-xs font-bold px-4 py-2 rounded-full shadow-md select-none">
                    View Case Study
                  </span>
                </div>
              </div>

              {/* Bento Item 3: purple flow lines */}
              <div className="bg-white rounded-2xl overflow-hidden border border-border-subtle/50 shadow-sm relative group cursor-pointer min-h-[160px] flex flex-col justify-between">
                <div className="h-28 overflow-hidden bg-cover bg-center">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCud8iLEXJbvkaMX2uONjMQC9GNZZfEC61oM-KX6cy8UUyKB8ZS3BvVz1AHRWM5dpeLKnRhY6J1wttmhDeLNDZ9GoM8WIe7cDfcdyjttGHuKYeMCwg7D212ClYoj8dlKTf987-JXIIfCtwwBg_-93j51Wuh_nV-NRCbt3o4kjfFBXIVK7jFtmlLou4mf5D9Zh1659Kf9328LD7YlYo4DCWSCPeYNlYds_FqjK9w3MriE9nEcK-HGOMlnMYV83cI9ihbfo7MsCpvDDc" 
                    alt="Violet design motion" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-3 bg-white border-t border-border-subtle/20">
                  <p className="font-bold text-xs text-text-primary truncate">Motion Explorations</p>
                  <p className="text-[10px] text-text-secondary">Creative fluidity and brand assets</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-8 select-none">
              {[
                { title: 'Connect Modern v2.0 Design Language', type: 'Design System Documentation', desc: 'Unified designer-to-developer mapping across colors and spacing elements.' },
                { title: 'Mobile Navigation UI Flow Specs', type: 'Framer / Smartphone Prototype', desc: 'Interactive visual system showing gestures, smooth spring animations.' },
                { title: 'Motion Brand Guidelines', type: 'Video Exploration', desc: 'Abstract violet dynamics defining loading transitions, state indicators.' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-border-subtle/50 shadow-sm flex flex-col gap-1 cursor-pointer hover:border-primary transition-colors">
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{item.type}</span>
                  <h4 className="font-bold text-text-primary text-sm">{item.title}</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Profile Recent Activity Posts */}
          <div className="mt-8 flex flex-col gap-6">
            <h3 className="font-bold text-text-primary text-lg">Recent Posts</h3>
            
            {profilePosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white p-6 rounded-2xl border border-border-subtle/50 shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-bold text-text-primary text-sm">{post.author.name}</h5>
                    <p className="text-[11px] text-text-secondary">{post.timeAgo}</p>
                  </div>
                </div>

                <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap">{post.content}</p>

                {/* Link Preview standard representation inside post */}
                {post.linkPreview && (
                  <div className="rounded-xl overflow-hidden border border-border-subtle hover:border-primary-container transition-colors">
                    {post.linkPreview.image && (
                      <div className="h-32 overflow-hidden bg-cover img-container">
                        <img src={post.linkPreview.image} alt={post.linkPreview.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4 bg-surface-container-low">
                      <p className="font-medium text-[10px] text-primary uppercase tracking-wider mb-1">
                        {post.linkPreview.url}
                      </p>
                      <h6 className="font-bold text-xs text-text-primary">
                        {post.linkPreview.title}
                      </h6>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-border-subtle/20 select-none">
                  <button 
                    onClick={() => onLikePost(post.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                      post.isLikedByMe ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <ThumbsUp className={`w-4.5 h-4.5 ${post.isLikedByMe ? 'fill-current' : ''}`} />
                    <span>{post.likesCount + (post.isLikedByMe ? 1 : 0)} Likes</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold">
                    <MessageCircle className="w-4.5 h-4.5" />
                    <span>{post.comments?.length || 0} Comments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Edit Profile modal block */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-border-subtle flex flex-col gap-4 animate-modalSlideUp select-none">
            <h3 className="font-bold text-text-primary text-lg">Edit Profile Information</h3>
            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary pl-1">Professional Fullname</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-border-subtle px-4 py-2 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary pl-1">Current Role Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-border-subtle px-4 py-2 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary pl-1">Company</label>
                <input 
                  type="text" 
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full border border-border-subtle px-4 py-2 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary pl-1">Location</label>
                <input 
                  type="text" 
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full border border-border-subtle px-4 py-2 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary pl-1">Short Bio Statement</label>
                <textarea 
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full border border-border-subtle px-4 py-2 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-secondary pl-1">Personal Portfolio / Website</label>
                <input 
                  type="text" 
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full border border-border-subtle px-4 py-2 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle/20">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high transition-colors font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSave}
                className="px-5 py-2 bg-primary text-white hover:brightness-105 transition-colors font-bold text-xs rounded-xl cursor-pointer"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
