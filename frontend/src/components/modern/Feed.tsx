import { Image as ImageIcon, Video, ShoppingBag, Loader2 } from 'lucide-react';
import PostCard from './PostCard';

interface FeedProps {
  posts: any[];
  currentUser: { name: string; avatar: string };
  onRequestCreatePost: () => void;
  onNavigate: (tab: string) => void;
  onPostDeleted: (postId: number) => void;
  onPostUpdated: (post: any) => void;
  onPostCreated: (post: any) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export default function Feed({ posts, currentUser, onRequestCreatePost, onNavigate, onPostDeleted, onPostUpdated, onPostCreated, onLoadMore, hasMore, loadingMore }: FeedProps) {
  return (
    <div className="flex-1 max-w-[680px] w-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-border-subtle/30 flex flex-col gap-4">
        <div className="flex gap-4">
          <button type="button" onClick={() => onNavigate('profile')} className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </button>
          <button type="button" onClick={onRequestCreatePost} className="flex-grow bg-surface-container-low hover:bg-surface-container text-left px-6 py-3 rounded-full text-text-secondary text-sm font-medium">
            Apa yang ingin Anda bagikan?
          </button>
        </div>
        <div className="flex gap-4 px-2 pt-2 border-t border-border-subtle/20 text-sm font-semibold text-text-secondary">
          <button type="button" onClick={onRequestCreatePost} className="flex items-center gap-2 hover:text-primary"><ImageIcon className="w-5 h-5 text-primary" />Foto</button>
          <button type="button" onClick={onRequestCreatePost} className="flex items-center gap-2 hover:text-primary"><Video className="w-5 h-5 text-error" />Video</button>
          <button type="button" onClick={onRequestCreatePost} className="flex items-center gap-2 hover:text-primary"><ShoppingBag className="w-5 h-5 text-success" />Jual</button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-border-subtle/30 text-center shadow-sm">
          <p className="text-text-secondary font-medium mb-1">Belum ada postingan.</p>
          <p className="text-xs text-outline">Ikuti akun lain atau buat postingan pertama Anda.</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onDeleted={onPostDeleted} onUpdated={onPostUpdated} onReposted={onPostCreated} />
        ))
      )}

      {hasMore && onLoadMore && (
        <button type="button" onClick={onLoadMore} disabled={loadingMore} className="self-center rounded-full border border-border-subtle bg-white px-6 py-2 text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
          {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}Muat lebih banyak
        </button>
      )}
    </div>
  );
}
