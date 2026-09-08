import { useState, useRef, useEffect } from 'react';
import { Send, CheckCheck, MessageSquare, ArrowLeft } from 'lucide-react';
import { messageApi } from '../../api/messageApi';
import { User } from '../../types';

interface MessagesProps {
  currentUser: User;
}

export default function Messages({ currentUser }: MessagesProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const data = await messageApi.getConversations();
        if (!data) return;
        const mapped = data.map((c: any) => ({
          id: c.id,
          otherUser: c.user1_id == currentUser.id ? c.user2 : c.user1,
          lastMsg: (c.messages && c.messages.length > 0) ? c.messages[0] : null,
          unread: false
        }));
        setConversations(mapped);
        if (mapped.length > 0 && !selectedConvId) {
          setSelectedConvId(mapped[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchConvs();
  }, []);

  useEffect(() => {
    if (!selectedConvId) return;
    const fetchMsgs = async () => {
      try {
        const data = await messageApi.getMessages(selectedConvId);
        setMessages(data || []);
      } catch (err) {}
    };
    fetchMsgs();
  }, [selectedConvId]);

  const selectedConv = conversations.find(c => c.id === selectedConvId) || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSendMessage = async () => {
    const text = messageText.trim();
    if (!text || !selectedConv) return;

    setMessageText('');
    try {
      const sentMsg = await messageApi.sendMessage(selectedConv.otherUser.id, text);
      setMessages(prev => [...prev, sentMsg]);
      
      // Update local lastMsg in conversations
      setConversations(prev => prev.map(c => 
        c.id === selectedConvId ? { ...c, lastMsg: sentMsg } : c
      ));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 w-full h-[calc(100vh-120px)] mx-auto select-none">
      <div className="bg-white rounded-2xl border border-border-subtle/50 shadow-sm overflow-hidden flex h-full">
        
        {/* Left Side: Conversations list */}
        <div className="w-full md:w-80 border-r border-border-subtle/30 flex flex-col">
          <div className="p-4 border-b border-border-subtle/10 flex items-center justify-between">
            <h3 className="font-bold text-text-primary text-base select-none">Inbox Messages</h3>
            <MessageSquare className="w-5 h-5 text-outline" />
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/10">
            {conversations.map((conv) => {
              const lastMsg = conv.lastMsg;
              const isSelected = selectedConv?.id === conv.id;
              
              return (
                <div 
                  key={conv.id}
                  onClick={() => {
                    setSelectedConvId(conv.id);
                    setConversations(prev => prev.map(c => 
                      c.id === conv.id ? { ...c, unread: false } : c
                    ));
                  }}
                  className={`p-4 flex gap-3 items-center cursor-pointer transition-all ${
                    isSelected ? 'bg-secondary-container/50 border-l-4 border-primary' : 'hover:bg-surface-container-low'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 relative">
                    <img src={conv.otherUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} alt={conv.otherUser.name} className="w-full h-full object-cover" />
                    {conv.unread && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-primary border-2 border-white rounded-full animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-text-primary text-xs truncate">{conv.otherUser.name}</span>
                    </div>
                    <p className={`text-xs truncate ${conv.unread ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                      {lastMsg ? lastMsg.content : 'Start a new conversation'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Conversation stream thread */}
        <div className="hidden md:flex flex-1 flex-col bg-surface-container-low/40">
          {selectedConv ? (
            <>
              {/* Header other user metadata */}
              <div className="p-4 bg-white border-b border-border-subtle/20 flex gap-3 items-center justify-between">
                <div className="flex gap-3 items-center min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img src={selectedConv.otherUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} alt={selectedConv.otherUser.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-text-primary text-sm truncate">{selectedConv.otherUser.name}</div>
                    <div className="text-[11px] text-text-secondary truncate">{selectedConv.otherUser.title || 'Professional'} at {selectedConv.otherUser.company || 'Company'}</div>
                  </div>
                </div>
              </div>

              {/* Conversation stream display */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <MessageSquare className="w-12 h-12 text-outline mb-2" />
                    <p className="text-sm font-semibold text-text-secondary">No messages yet.</p>
                    <p className="text-xs text-outline mt-1">Send a message to start conversation with {selectedConv.otherUser.name}!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id == currentUser.id;
                    return (
                      <div 
                        key={msg.id}
                        className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'} animate-fadeIn`}
                      >
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
                          isMe 
                            ? 'bg-primary text-white border-primary rounded-tr-none' 
                            : 'bg-white text-text-primary border-border-subtle/20 rounded-tl-none shadow-xs'
                        }`}>
                          <p>{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 font-medium text-[10px] text-outline pl-1 pr-1">
                          {isMe && <CheckCheck className="w-3 h-3 text-primary" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Type Message input card */}
              <div className="p-4 bg-white border-t border-border-subtle/20 flex gap-2 items-center">
                <input 
                  type="text"
                  placeholder={`Send message to ${selectedConv.otherUser.name}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  className="w-full border border-border-subtle/50 px-4 py-2.5 rounded-xl text-xs bg-surface-container-low focus:bg-white focus:border-primary focus:ring-0 outline-none transition-all text-text-primary"
                />
                <button 
                  type="button"
                  onClick={handleSendMessage}
                  className="p-2.5 bg-primary text-white rounded-xl shadow-xs hover:brightness-115 active:scale-95 transition-all text-xs cursor-pointer"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare className="w-12 h-12 text-outline mb-2 opacity-50" />
              <p className="text-sm font-semibold text-text-secondary">Select a conversation to start messaging</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
