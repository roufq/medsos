import { useState, useRef, useEffect } from 'react';
import { Send, CheckCheck, MessageSquare, ArrowLeft } from 'lucide-react';
import { mockUsers, initialConversations } from '../data';
import { Conversation, ChatMessage, User } from '../types';

interface MessagesProps {
  currentUser: User;
}

export default function Messages({ currentUser }: MessagesProps) {
  const [conversations, setConversations] = useState<Conversation[]>(() => 
    initialConversations(currentUser.id)
  );
  const [selectedConvId, setSelectedConvId] = useState<string>('sarah');
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selectedConv = conversations.find(c => c.otherUser.id === setSelectedConvId || c.otherUser.id === selectedConvId) 
    || conversations[0];

  // Auto scroll down to bottom of messages thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConv?.messages?.length]);

  const handleSendMessage = () => {
    const text = messageText.trim();
    if (!text) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      receiverId: selectedConv.otherUser.id,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Append user message
    setConversations(prev => prev.map(conv => {
      if (conv.otherUser.id === selectedConv.otherUser.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage]
        };
      }
      return conv;
    }));
    setMessageText('');

    // Trigger auto automated reply simulation
    setTimeout(() => {
      let automatedResponseText = "Thanks for your thoughts! Let me check the specifications with our systems engineers and loop back shortly.";
      
      if (selectedConv.otherUser.id === 'sarah') {
        automatedResponseText = "Solid point! Let's schedule a brief sync tomorrow to go over the distributed database latencies. The current cloud infrastructure is looking great!";
      } else if (selectedConv.otherUser.id === 'elena') {
        automatedResponseText = "Sounds good! I am finalizing the marketing asset design matrices based on the Connect Modern v2.0 design token guidelines.";
      } else if (selectedConv.otherUser.id === 'david') {
        automatedResponseText = "Yes, absolutely! The multi-cloud fallback checks were completed successfully. I will submit the visual report shortly.";
      }

      const replyMessage: ChatMessage = {
        id: `reply_${Date.now()}`,
        senderId: selectedConv.otherUser.id,
        receiverId: currentUser.id,
        content: automatedResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setConversations(prev => prev.map(conv => {
        if (conv.otherUser.id === selectedConv.otherUser.id) {
          return {
            ...conv,
            messages: [...conv.messages, replyMessage],
            unread: false
          };
        }
        return conv;
      }));
    }, 1200);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto py-4 select-none">
      <div className="bg-white rounded-2xl border border-border-subtle/50 shadow-sm overflow-hidden flex h-[620px]">
        
        {/* Left Side: Conversations list */}
        <div className="w-full md:w-80 border-r border-border-subtle/30 flex flex-col">
          <div className="p-4 border-b border-border-subtle/10 flex items-center justify-between">
            <h3 className="font-bold text-text-primary text-base select-none">Inbox Messages</h3>
            <MessageSquare className="w-5 h-5 text-outline" />
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-border-subtle/10">
            {conversations.map((conv) => {
              const lastMsg = conv.messages[conv.messages.length - 1];
              const isSelected = selectedConv.otherUser.id === conv.otherUser.id;
              
              return (
                <div 
                  key={conv.otherUser.id}
                  onClick={() => {
                    setSelectedConvId(conv.otherUser.id);
                    // Clear unread state
                    setConversations(prev => prev.map(c => 
                      c.otherUser.id === conv.otherUser.id ? { ...c, unread: false } : c
                    ));
                  }}
                  className={`p-4 flex gap-3 items-center cursor-pointer transition-all ${
                    isSelected ? 'bg-secondary-container/50 border-l-4 border-primary' : 'hover:bg-surface-container-low'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 relative">
                    <img src={conv.otherUser.avatar} alt={conv.otherUser.name} className="w-full h-full object-cover" />
                    {conv.unread && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-primary border-2 border-white rounded-full animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-text-primary text-xs truncate">{conv.otherUser.name}</span>
                      {lastMsg && (
                        <span className="text-[10px] text-outline">{lastMsg.timestamp}</span>
                      )}
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
          {/* Header other user metadata */}
          <div className="p-4 bg-white border-b border-border-subtle/20 flex gap-3 items-center justify-between">
            <div className="flex gap-3 items-center min-w-0">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img src={selectedConv.otherUser.avatar} alt={selectedConv.otherUser.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-text-primary text-sm truncate">{selectedConv.otherUser.name}</div>
                <div className="text-[11px] text-text-secondary truncate">{selectedConv.otherUser.title} at {selectedConv.otherUser.company}</div>
              </div>
            </div>
          </div>

          {/* Conversation stream display */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {selectedConv.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageSquare className="w-12 h-12 text-outline mb-2" />
                <p className="text-sm font-semibold text-text-secondary">No messages yet.</p>
                <p className="text-xs text-outline mt-1">Send a message to start conversation with {selectedConv.otherUser.name}!</p>
              </div>
            ) : (
              selectedConv.messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
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
                      <span>{msg.timestamp}</span>
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

        </div>

      </div>
    </div>
  );
}
