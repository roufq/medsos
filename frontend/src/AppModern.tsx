import { useState } from 'react';
import { 
  Plus, 
  X, 
  Image as ImageIcon, 
  Users, 
  BarChart3, 
  LayoutGrid, 
  Send, 
  Briefcase, 
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

import { User, Post } from './types';
import { mockUsers, initialPosts } from './data';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import RightSidebar from './components/RightSidebar';
import Profile from './components/Profile';
import Network from './components/Network';
import Jobs from './components/Jobs';
import Messages from './components/Messages';
import Login from './components/Login';
import Signup from './components/Signup';

export default function App() {
  const [screen, setScreen] = useState<'login' | 'signup' | 'app'>('login');
  const [currentUser, setCurrentUser] = useState<User>(mockUsers.adrian);
  const [currentTab, setCurrentTab] = useState<'home' | 'network' | 'jobs' | 'messages' | 'profile' | 'admin' | 'analytics'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic posts state
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  
  // Followed suggestions ids tracking
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  
  // Global modal state
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<string>('');

  // Mobile navigation overlay state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Available image attachments options for post builder
  const sampleImages = [
    { title: 'Cloud Data Visualization', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7prdOqFad0jXwnstK80LnblExFmQ5ge8ZOEV7G8YsUo00CGRzeO9oGpCt-bUD8pMVsxWtVf_CePmWg_Jtu3dOZ281-Z4wjzZtj1kxppnXyWc4eeBoH5oFnH5myoioLppa922GyMhfwa7Aj6-ILD_vuzy76w51OZL-jHuD9YCGzUCGgvm3zEfsYt_8YRKKIz-Odskuc8KolqHa8rBxH6_XcduKpoAHdu4CGvLTRCwlp8NYtgJfi48ML7k0Pqeb4I_a5fWZSzevMmU' },
    { title: 'Interactive Analytics UI Dashboard', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDX473lmGHuHrg3PiCOqa_BvMwU5CbcPaqsmZms_pwqozXlQZbiVdbc_EFv3U8JTjZ_t6vPcpULgue2ZfrE6QrD4IISTt2fBd6kp2UdNYcvYVkricIdTfl4-WqmuVo4XjFsp98JGssiSQ-86ZTQaC0kQBJgFdw0tT4mpgbjU4-Z48KcHf1ofmPSaE10TfY24C_5kx37cny661v1oF9S_9KHtE2i6GHr1qZQZ1F7nXQtt7BkgTQ9XFNjpQ7L4sUcY36w2S5HHk2RqF8' },
    { title: 'Unified Design Token Typography Scales', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPkY786iNyzU66CJd4gB1KdM0O58nVe4E7wEyibO5DhiYflHC9zNvemSZMuEavfqqUGnWdB6CSOecH5PQ-_aCHyAge79m8jcU9wvfE2lT4JxqfUPAL2OaXeza6hp75_JhrwBwk06Euw-nh4_r3mM41NfGl1M5xQsDY4QF4XuxI_YYQbJS4NKELsB586QTDWGPyKz6Y3UQttMh-P_AmFp9pcJnizr_NkKaB-7c1lajOpRAzaheVvwr2zxj66QM5B6LTPAM4yxGtScM' }
  ];

  const handleLogin = (email: string) => {
    // If logging in as primary sample user or any custom user
    if (email.toLowerCase().includes('adrian')) {
      setCurrentUser(mockUsers.adrian);
    } else {
      // Craft custom personalized profile
      setCurrentUser({
        id: 'new_user',
        name: email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        title: 'Senior Creative Executive',
        company: 'Connect Modern Suite',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXXivnxn1FP869Ta25uCA13AX-IXdoWJWbmn1VrQuxka63qvxwDuCGh3x3EXC1hTfmbnEnj6ss9bQllAhNYT-aIsVi4a67fyOrFsY0Pl_EI-Ws1_Q9sZIsDrLwwlH0gwIWF4-xOmOPmpDVK6RMlgQA5vnypVHVzg1xhQwz2DB6wbugv6q7eYH32od3s_X3h1Mj-dgZ71P9JNuJeX16rQ76oRTlV3i19rV769qXDtK03LBWCNPKwyqVbNnYhbBVwNeuLbL28Z5vznI',
        coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNRe7599PvPWjme4G1AfCuqcb7I6UtEfFvUtdGPnRFJECAdNMFPb1kcrd9KwQ_87mYgQbHbQ2ctj_ZHqmtJb_doWqfMrutKHzE7NQNjLUInqnZIHZ4XTX8S7sOChktBxP-tn-PkdoXLSH-k4ukJZ4jLc_2aqQjsALi4S_HCg7wMsqDjgVxO13OFWIvo9OuSY2Qsru3E1aCOcXRmRjxobRIn1NFEHlFaK23OQ43zvup3-6gZZfNtg6PyGcHnDft9Db2izkVaYVWIaQ',
        bio: 'Dedicated software designer aiming to maximize scalable network alliances inside professional ecosystems.',
        location: 'California, US',
        website: 'connectmodern.com',
        joinedDate: 'Joined June 2026',
        expertise: ['Digital Design', 'Systems Architecture', 'M&A Strategy'],
        networkCount: 120,
        email: email
      });
    }
    setScreen('app');
    setCurrentTab('home');
  };

  const handleRegister = (email: string, fullName: string) => {
    setCurrentUser({
      id: 'new_registered',
      name: fullName,
      title: 'Strategic Alliance Architect',
      company: 'Connect Modern',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXXivnxn1FP869Ta25uCA13AX-IXdoWJWbmn1VrQuxka63qvxwDuCGh3x3EXC1hTfmbnEnj6ss9bQllAhNYT-aIsVi4a67fyOrFsY0Pl_EI-Ws1_Q9sZIsDrLwwlH0gwIWF4-xOmOPmpDVK6RMlgQA5vnypVHVzg1xhQwz2DB6wbugv6q7eYH32od3s_X3h1Mj-dgZ71P9JNuJeX16rQ76oRTlV3i19rV769qXDtK03LBWCNPKwyqVbNnYhbBVwNeuLbL28Z5vznI',
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNRe7599PvPWjme4G1AfCuqcb7I6UtEfFvUtdGPnRFJECAdNMFPb1kcrd9KwQ_87mYgQbHbQ2ctj_ZHqmtJb_doWqfMrutKHzE7NQNjLUInqnZIHZ4XTX8S7sOChktBxP-tn-PkdoXLSH-k4ukJZ4jLc_2aqQjsALi4S_HCg7wMsqDjgVxO13OFWIvo9OuSY2Qsru3E1aCOcXRmRjxobRIn1NFEHlFaK23OQ43zvup3-6gZZfNtg6PyGcHnDft9Db2izkVaYVWIaQ',
      bio: 'Ready to curate creative trajectories and engage high-end professional connections.',
      location: 'SF Bay Area',
      website: 'mybrand.design',
      joinedDate: 'Joined June 2026',
      expertise: ['Growth Marketing', 'Product Led Growth', 'Executive Matchmaking'],
      networkCount: 1,
      email: email
    });
    setScreen('app');
    setCurrentTab('home');
  };

  const handleCreatePostSubmit = () => {
    const text = newPostText.trim();
    if (!text) return;

    const newPostItem: Post = {
      id: `custom_post_${Date.now()}`,
      author: currentUser,
      timeAgo: 'Just now',
      content: text,
      image: newPostImage || undefined,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      comments: []
    };

    setPosts(prev => [newPostItem, ...prev]);
    setNewPostText('');
    setNewPostImage('');
    setIsCreatePostOpen(false);
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const liked = !post.isLikedByMe;
        return {
          ...post,
          isLikedByMe: liked
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: string, commentText: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...(post.comments || []),
            {
              id: `c_${Date.now()}`,
              authorName: currentUser.name,
              authorAvatar: currentUser.avatar,
              content: commentText,
              timeAgo: 'Just now'
            }
          ]
        };
      }
      return post;
    }));
  };

  const handleFollowSuggestion = (userId: string) => {
    if (followedUsers.includes(userId)) {
      setFollowedUsers(prev => prev.filter(id => id !== userId));
    } else {
      setFollowedUsers(prev => [...prev, userId]);
    }
  };

  if (screen === 'login') {
    return (
      <Login 
        onLogin={handleLogin} 
        onNavigateToSignup={() => setScreen('signup')} 
      />
    );
  }

  if (screen === 'signup') {
    return (
      <Signup 
        onRegister={handleRegister} 
        onNavigateToLogin={() => setScreen('login')} 
      />
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen font-sans">
      {/* Search and Navigation top header bar */}
      <Header 
        currentUser={currentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          setMobileSidebarOpen(false);
        }}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main dashboard flow block */}
      <main className="max-w-7xl mx-auto flex gap-6 px-6 py-6 min-h-[calc(100vh-80px)]">
        
        {/* Left column navigation panel */}
        <Sidebar 
          currentTab={currentTab}
          onNavigate={(tab) => {
            setCurrentTab(tab);
            setMobileSidebarOpen(false);
          }}
          onRequestCreatePost={() => setIsCreatePostOpen(true)}
          onLogout={() => {
            setScreen('login');
            setCurrentTab('home');
          }}
        />

        {/* Mobile slide-in Sidebar drawer overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-xs">
            <div className="w-64 bg-white h-full p-4 flex flex-col gap-4 animate-slideInLeft relative shadow-xl">
              <button 
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-1 text-text-secondary hover:text-text-primary hover:bg-surface-container rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-4 pt-6 px-2 select-none">
                <div className="font-headline-md text-headline-md font-black text-primary">Connect Modern</div>
                <div className="font-label-sm text-label-sm text-text-secondary">Professional Suite</div>
              </div>

              <nav className="flex flex-col gap-1 flex-1">
                {[
                  { id: 'home' as const, label: 'Home' },
                  { id: 'network' as const, label: 'Network' },
                  { id: 'jobs' as const, label: 'Jobs' },
                  { id: 'messages' as const, label: 'Messages' },
                  { id: 'profile' as const, label: 'Profile' },
                  { id: 'admin' as const, label: 'Admin Dashboard' },
                  { id: 'analytics' as const, label: 'Analytics' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs transition-all ${
                      currentTab === item.id 
                        ? 'bg-secondary-container text-primary font-bold' 
                        : 'text-text-secondary hover:bg-surface-container-low hover:text-text-primary'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                
                <button
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    setIsCreatePostOpen(true);
                  }}
                  className="mt-6 w-full py-3 bg-primary text-white font-bold rounded-xl text-xs"
                >
                  Create Post
                </button>
              </nav>

              <button
                onClick={() => {
                  setScreen('login');
                  setMobileSidebarOpen(false);
                }}
                className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high transition-colors text-text-secondary font-bold text-xs rounded-xl mt-auto"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Dynamic primary stage views routing */}
        <div className="flex-grow min-w-0">
          
          {currentTab === 'home' && (
            <div className="flex gap-6 items-start">
              <Feed 
                posts={posts}
                currentUser={currentUser}
                searchQuery={searchQuery}
                onLikePost={handleLikePost}
                onAddComment={handleAddComment}
                onRequestCreatePost={() => setIsCreatePostOpen(true)}
                onNavigate={setCurrentTab}
                onFollowSuggestion={handleFollowSuggestion}
                followedUsers={followedUsers}
              />
              <RightSidebar 
                followedUsers={followedUsers}
                onFollowSuggestion={handleFollowSuggestion}
                onNavigate={setCurrentTab}
              />
            </div>
          )}

          {currentTab === 'profile' && (
            <Profile 
              user={currentUser}
              onUpdateUser={setCurrentUser}
              onNavigateToMessages={() => setCurrentTab('messages')}
              profilePosts={posts.filter(p => p.author.id === currentUser.id)}
              onLikePost={handleLikePost}
            />
          )}

          {currentTab === 'network' && (
            <Network 
              onNavigateToMessages={() => setCurrentTab('messages')}
            />
          )}

          {currentTab === 'jobs' && (
            <Jobs />
          )}

          {currentTab === 'messages' && (
            <Messages currentUser={currentUser} />
          )}

          {/* Special Custom Admin Dashboard View */}
          {currentTab === 'admin' && (
            <div className="bg-white p-8 rounded-2xl border border-border-subtle/50 shadow-sm flex flex-col gap-6 animate-fadeIn select-none">
              <div className="border-b border-border-subtle/15 pb-4">
                <h3 className="font-bold text-text-primary text-xl">Admin Suite Management</h3>
                <p className="text-xs text-text-secondary">Track live configuration metrics, SSO identities, and network telemetry states.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-surface-container-low rounded-2xl border border-border-subtle/10">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-outline">System Gateway</span>
                  <div className="text-xl font-bold text-primary mt-1 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-success rounded-full animate-ping" />
                    <span>Live Gateway</span>
                  </div>
                </div>
                <div className="p-4 bg-surface-container-low rounded-2xl border border-border-subtle/10">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-outline">Total Seed Posts</span>
                  <div className="text-xl font-bold text-text-primary mt-1">{posts.length} Insights</div>
                </div>
                <div className="p-4 bg-surface-container-low rounded-2xl border border-border-subtle/10">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-outline">Identity Mode</span>
                  <div className="text-xl font-bold text-[#cb4400] mt-1">Enterprise SSO</div>
                </div>
              </div>

              <div className="bg-surface-container-low p-5 rounded-2xl border border-border-subtle/20 mt-2">
                <h4 className="font-bold text-xs text-text-primary mb-3">Recent System Events Telemetry</h4>
                <div className="flex flex-col gap-2.5 text-[11px] font-semibold text-text-secondary">
                  <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg">
                    <span className="text-[#0050cd] flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> SECURE_GATEWAY_BOOTED</span>
                    <span>100% Ok</span>
                  </div>
                  <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg">
                    <span className="text-success flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> PROFILE_METADATA_SYNCED</span>
                    <span>Just now</span>
                  </div>
                  <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg">
                    <span className="text-[#cb4400] flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> FEED_LIKES_COUNTER_UPDATE</span>
                    <span>Acknowledged</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Special Custom Analytics Metric Graphics View */}
          {currentTab === 'analytics' && (
            <div className="bg-white p-8 rounded-2xl border border-border-subtle/50 shadow-sm flex flex-col gap-6 animate-fadeIn select-none">
              <div className="border-b border-border-subtle/15 pb-4">
                <h3 className="font-bold text-text-primary text-xl">My Reach & Analytics</h3>
                <p className="text-xs text-text-secondary">Performance and follower indicators updated in real-time.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-border-subtle/50 p-5 rounded-2xl">
                  <h4 className="font-bold text-xs text-text-secondary mb-3">Weekly Profile Visitors</h4>
                  {/* Clean SVG visual bars */}
                  <div className="flex items-end justify-between h-32 pt-4 px-2">
                    {[
                      { l: 'Mon', h: '30%' },
                      { l: 'Tue', h: '45%' },
                      { l: 'Wed', h: '20%' },
                      { l: 'Thu', h: '60%' },
                      { l: 'Fri', h: '80%' },
                      { l: 'Sat', h: '40%' },
                      { l: 'Sun', h: '95%' }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                        <div className="w-6 bg-primary rounded-t-lg transition-all duration-500 hover:brightness-110" style={{ height: bar.h }} />
                        <span className="text-[10px] text-outline font-bold">{bar.l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-border-subtle/50 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Estimated conversion speed</span>
                    <div className="text-3xl font-black text-primary mt-1 tracking-tight">84.2%</div>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      Your strategic matchmaking relevance is significantly higher than other standard profiles inside SF Bay Area!
                    </p>
                  </div>
                  <div className="bg-[#31A24C]/10 p-3 rounded-xl border border-[#31A24C]/10 text-success text-[11px] font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-[#31A24C]" />
                    <span>Optimal conversion profile integrity reached</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* Primary Create Post Modal */}
      {isCreatePostOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs select-none animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-border-subtle flex flex-col gap-4 animate-modalSlideUp">
            
            <div className="flex justify-between items-center border-b border-border-subtle/15 pb-3">
              <h3 className="font-bold text-text-primary text-base">Create Post</h3>
              <button 
                type="button"
                onClick={() => setIsCreatePostOpen(false)}
                className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface-container rounded-full cursor-pointer"
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

            <textarea 
              rows={4}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="What professional insight would you like to share today?"
              className="w-full text-sm border-0 pr-2 resize-none outline-none focus:ring-0 placeholder:text-outline text-text-primary"
            />

            {/* Select illustration image to showcase */}
            <div className="space-y-2 pt-2 border-t border-border-subtle/20">
              <span className="text-[10px] uppercase font-bold tracking-widest text-outline block pl-1">Attach sample media design:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setNewPostImage('')}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors border ${
                    !newPostImage 
                      ? 'bg-secondary-container text-primary border-primary' 
                      : 'bg-white text-text-secondary border-border-subtle'
                  }`}
                >
                  None
                </button>
                {sampleImages.map((img, idx) => {
                  const isSelected = newPostImage === img.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewPostImage(img.url)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors border max-w-xs truncate ${
                        isSelected 
                          ? 'bg-secondary-container text-primary border-primary' 
                          : 'bg-white text-text-secondary border-border-subtle'
                      }`}
                      title={img.title}
                    >
                      {idx === 0 ? 'Cloud Post Image' : idx === 1 ? 'Design Dashboard' : 'Design Tokens Map'}
                    </button>
                  );
                })}
              </div>
            </div>

            {newPostImage && (
              <div className="h-32 bg-surface-container overflow-hidden rounded-xl border border-border-subtle/20 relative group">
                <img src={newPostImage} alt="Selection preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setNewPostImage('')}
                  className="absolute top-2 right-2 bg-black/60 text-white hover:bg-black/80 rounded-full p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle/10">
              <button 
                type="button"
                onClick={() => setIsCreatePostOpen(false)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                disabled={!newPostText.trim()}
                onClick={handleCreatePostSubmit}
                className="px-5 py-2 bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-white hover:brightness-105 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <span>Publish Post</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
