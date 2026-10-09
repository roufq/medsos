import { useEffect, useState } from 'react';
import { Send, Pencil, Trash2, CornerDownRight } from 'lucide-react';
import { postApi } from '../../api/postApi';
import { useAuth } from '../../context/AuthContext';
import { RichText, timeAgo } from '../../utils/postFormat';

interface CommentThreadProps {
  postId: number | string;
  postOwnerId: number | string;
  onCountChange?: (delta: number) => void;
}

const errorText = (error: any, fallback: string) => error?.response?.data?.error || fallback;

export default function CommentThread({ postId, postOwnerId, onCountChange }: CommentThreadProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [editing, setEditing] = useState<{ id: number; text: string } | null>(null);
  const [error, setError] = useState('');

  const load = async (beforeId?: number) => {
    setLoading(true);
    try {
      const data = await postApi.getComments(postId, beforeId || null);
      const items = data.comments || [];
      setComments((current) => (beforeId ? [...items, ...current] : items));
      setHasMore(Boolean(data.has_more));
    } catch (err) {
      setError(errorText(err, 'Gagal memuat komentar'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [postId]);

  const submit = async () => {
    const text = draft.trim();
    if (!text) return;
    setError('');
    try {
      if (replyTo) {
        const reply = await postApi.replyComment(postId, replyTo.id, text);
        setComments((current) => current.map((c) => (c.id === replyTo.id ? { ...c, replies: [...(c.replies || []), reply] } : c)));
      } else {
        const comment = await postApi.addComment(postId, text);
        setComments((current) => [...current, { ...comment, replies: [] }]);
      }
      onCountChange?.(1);
      setDraft('');
      setReplyTo(null);
    } catch (err) {
      setError(errorText(err, 'Gagal mengirim komentar'));
    }
  };

  const saveEdit = async () => {
    if (!editing || !editing.text.trim()) return;
    try {
      await postApi.editComment(editing.id, editing.text.trim());
      const apply = (c: any) => (c.id === editing.id ? { ...c, content: editing.text.trim() } : c);
      setComments((current) => current.map((c) => ({ ...apply(c), replies: (c.replies || []).map(apply) })));
      setEditing(null);
    } catch (err) {
      setError(errorText(err, 'Gagal mengubah komentar'));
    }
  };

  const remove = async (comment: any) => {
    if (!window.confirm('Hapus komentar ini?')) return;
    try {
      await postApi.deleteComment(comment.id);
      const removedReplies = comment.replies?.length || 0;
      setComments((current) => current
        .filter((c) => c.id !== comment.id)
        .map((c) => ({ ...c, replies: (c.replies || []).filter((r: any) => r.id !== comment.id) })));
      onCountChange?.(-(1 + removedReplies));
    } catch (err) {
      setError(errorText(err, 'Gagal menghapus komentar'));
    }
  };

  const renderComment = (comment: any, parent?: any) => {
    const mine = comment.user_id === user?.id;
    const canDelete = mine || postOwnerId === user?.id;
    const isEditing = editing?.id === comment.id;
    return (
      <div key={comment.id} className={`flex gap-2 items-start ${parent ? 'ml-10' : ''}`}>
        <img src={comment.user?.avatar_url || '/favicon.svg'} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="bg-surface-container-low rounded-2xl px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-text-primary">{comment.user?.name || 'Pengguna'}</span>
              <span className="text-[10px] text-outline">{timeAgo(comment.created_at)}</span>
            </div>
            {isEditing ? (
              <div className="mt-1 flex gap-2">
                <input value={editing.text} onChange={(e) => setEditing({ id: comment.id, text: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && saveEdit()} className="flex-1 rounded-lg border border-border-subtle px-2 py-1 text-xs" autoFocus />
                <button type="button" onClick={saveEdit} className="text-xs font-bold text-primary">Simpan</button>
                <button type="button" onClick={() => setEditing(null)} className="text-xs text-text-secondary">Batal</button>
              </div>
            ) : (
              <p className="text-xs text-text-primary whitespace-pre-wrap break-words"><RichText text={comment.content} /></p>
            )}
          </div>
          <div className="flex gap-3 mt-1 pl-2 text-[11px] font-semibold text-text-secondary">
            <button type="button" onClick={() => { setReplyTo(parent || comment); setDraft(`@${comment.user?.username || ''} `); }} className="hover:text-primary flex items-center gap-1"><CornerDownRight className="w-3 h-3" />Balas</button>
            {mine && !isEditing && <button type="button" onClick={() => setEditing({ id: comment.id, text: comment.content })} className="hover:text-primary flex items-center gap-1"><Pencil className="w-3 h-3" />Edit</button>}
            {canDelete && <button type="button" onClick={() => remove(comment)} className="hover:text-error flex items-center gap-1"><Trash2 className="w-3 h-3" />Hapus</button>}
          </div>
          {!parent && (comment.replies || []).length > 0 && <div className="mt-2 flex flex-col gap-2">{comment.replies.map((reply: any) => renderComment(reply, comment))}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 pt-4 border-t border-border-subtle/20 flex flex-col gap-3">
      {hasMore && (
        <button type="button" disabled={loading} onClick={() => load(comments[0]?.id)} className="text-xs font-semibold text-primary hover:underline self-start disabled:opacity-50">
          {loading ? 'Memuat…' : 'Lihat komentar sebelumnya'}
        </button>
      )}
      {comments.map((comment) => renderComment(comment))}
      {!loading && comments.length === 0 && <p className="text-xs text-text-secondary">Belum ada komentar.</p>}
      {error && <p className="text-xs text-error">{error}</p>}
      {replyTo && (
        <div className="text-[11px] text-text-secondary flex items-center gap-2">
          Membalas <strong>{replyTo.user?.name}</strong>
          <button type="button" onClick={() => { setReplyTo(null); setDraft(''); }} className="text-primary">batal</button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          maxLength={5000}
          placeholder={replyTo ? 'Tulis balasan… (@username untuk mention)' : 'Tulis komentar… (@username untuk mention)'}
          className="flex-1 rounded-full border border-border-subtle bg-surface-container-low px-4 py-2 text-xs outline-none focus:border-primary"
        />
        <button type="button" onClick={submit} className="rounded-full bg-primary p-2 text-white" aria-label="Kirim komentar"><Send className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
