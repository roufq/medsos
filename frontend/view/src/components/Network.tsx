import { useState } from 'react';
import { Users, UserCheck, MessageSquare, ShieldAlert, Check, X, Search } from 'lucide-react';
import { mockUsers } from '../data';
import { User } from '../types';

interface NetworkProps {
  onNavigateToMessages: () => void;
}

export default function Network({ onNavigateToMessages }: NetworkProps) {
  const [connections, setConnections] = useState<User[]>([
    mockUsers.sarah,
    mockUsers.marcus
  ]);
  const [pendingRequests, setPendingRequests] = useState<User[]>([
    mockUsers.elena,
    mockUsers.david
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAccept = (user: User) => {
    setConnections(prev => [...prev, user]);
    setPendingRequests(prev => prev.filter(req => req.id !== user.id));
  };

  const handleDecline = (userId: string) => {
    setPendingRequests(prev => prev.filter(req => req.id !== userId));
  };

  const filteredConnections = connections.filter(conn => 
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 max-w-4xl mx-auto py-4 select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column Stats card */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-border-subtle/50 shadow-sm flex flex-col gap-5">
            <h3 className="font-bold text-text-primary text-base border-b border-border-subtle/10 pb-3">My Network</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary font-medium">Connections</span>
              <span className="font-bold text-primary bg-secondary-container px-2.5 py-1 rounded-lg text-xs">
                {connections.length}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary font-medium">Pending Requests</span>
              <span className="font-bold text-[#cb4400] bg-[#cb4400]/10 px-2.5 py-1 rounded-lg text-xs animate-pulse">
                {pendingRequests.length}
              </span>
            </div>
          </div>
        </div>

        {/* Central column list requests & existing contacts */}
        <div className="md:col-span-2 flex flex-col gap-6 animate-fadeIn">
          
          {/* Pending Invitations block if any exists */}
          {pendingRequests.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-border-subtle/50 shadow-sm">
              <h3 className="font-bold text-text-primary text-sm mb-4">Pending Invitations ({pendingRequests.length})</h3>
              <div className="flex flex-col gap-4">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="flex gap-4 items-center justify-between p-3.5 bg-surface-container-low rounded-2xl border border-border-subtle/20">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <img src={req.avatar} alt={req.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-text-primary text-xs truncate">{req.name}</div>
                        <div className="text-[11px] text-text-secondary truncate">{req.title} @ {req.company}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDecline(req.id)}
                        className="p-2 border border-border-subtle hover:bg-surface-container hover:text-error transition-all rounded-full cursor-pointer"
                        title="Ignore Request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleAccept(req)}
                        className="bg-primary text-white p-2 hover:brightness-110 transition-all rounded-full flex items-center justify-center cursor-pointer"
                        title="Accept Connection"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Existing Connections Search & List */}
          <div className="bg-white rounded-2xl p-6 border border-border-subtle/50 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h3 className="font-bold text-text-primary text-sm select-none">All Connections</h3>
              
              {/* Search inside connections */}
              <div className="flex items-center bg-surface-container-low rounded-xl px-3 py-1.5 border border-transparent focus-within:border-primary focus-within:bg-white transition-all w-full md:max-w-xs">
                <Search className="w-4 h-4 text-outline" />
                <input 
                  type="text" 
                  placeholder="Search connections..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none focus:ring-0 text-xs ml-2 w-full text-text-primary"
                />
              </div>
            </div>

            {filteredConnections.length === 0 ? (
              <p className="text-xs text-outline text-center py-8">No connections match your search query.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredConnections.map((conn) => (
                  <div key={conn.id} className="border border-border-subtle/30 rounded-2xl p-4 flex flex-col gap-3 hover:border-primary hover:shadow-xs transition-all bg-white relative">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface-container">
                        <img src={conn.avatar} alt={conn.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-text-primary text-xs truncate">{conn.name}</div>
                        <div className="text-[10px] text-text-secondary truncate">{conn.title}</div>
                        <div className="text-[10px] text-outline truncate">{conn.company}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 pt-2 border-t border-border-subtle/10">
                      <button 
                        onClick={onNavigateToMessages}
                        className="w-full py-1.5 bg-secondary-container hover:bg-secondary-container/80 text-primary transition-colors font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
