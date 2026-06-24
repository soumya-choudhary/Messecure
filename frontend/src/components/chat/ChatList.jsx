import { useEffect, useState } from 'react';
import { Search, Plus, MessageCircle, Users } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import api from '../../lib/api';
import Avatar from './Avatar';

const ChatList = ({ onSearchUsers, onCreateGroup, showOnMobile }) => {
  const {
    chatPartners,
    groups,
    selectedChat,
    setSelectedChat,
    unreadByChat,
    setUnreadByChat,
    activeView,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');

  const fetchUnread = async () => {
    try {
      const res = await api.get('/messages/unread/by-chat');
      setUnreadByChat(res.data.counts || {});
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [chatPartners]);

  useEffect(() => {
    if (selectedChat?.type === 'user') {
      fetchUnread();
    }
  }, [selectedChat?.id]);

  const allChats = [
    ...chatPartners.map((partner) => ({
      type: 'user',
      id: partner._id,
      name: partner.fullName,
      username: partner.username,
      avatar: partner.profilePic,
      lastMessage: 'Tap to chat',
      timestamp: partner.updatedAt || new Date(),
      unread: unreadByChat[partner._id] || 0,
    })),
    ...groups.map((group) => ({
      type: 'group',
      id: group._id,
      name: group.name,
      avatar: group.groupPic,
      members: group.members,
      lastMessage: group.lastMessage?.text || 'No messages yet',
      timestamp: group.updatedAt || new Date(),
      unread: 0,
    })),
  ];

  const filteredChats = allChats
    .filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const displayList = activeView === 'groups' ? filteredChats.filter((c) => c.type === 'group') : filteredChats;

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    if (chat.type === 'user' && chat.unread > 0) {
      useChatStore.getState().clearUnreadForChat(chat.id);
    }
  };

  return (
    <div
      className={`w-full md:w-[360px] lg:w-[400px] bg-white border-r border-[#e9edef] flex flex-col flex-shrink-0 ${
        showOnMobile ? 'flex' : selectedChat ? 'hidden md:flex' : 'flex'
      }`}
    >
      <div className="h-[60px] px-4 flex items-center justify-between bg-[#f0f2f5] border-b border-[#e9edef]">
        <h2 className="text-lg font-medium text-[#111b21]">
          {activeView === 'groups' ? 'Groups' : 'Chats'}
        </h2>
        <div className="flex items-center gap-1">
          {activeView === 'groups' ? (
            <button
              onClick={onCreateGroup}
              className="p-2 hover:bg-[#e9edef] rounded-full"
              title="Create group"
            >
              <Plus className="w-5 h-5 text-[#54656f]" />
            </button>
          ) : (
            <button
              onClick={onSearchUsers}
              className="p-2 hover:bg-[#e9edef] rounded-full"
              title="Find users"
            >
              <Users className="w-5 h-5 text-[#54656f]" />
            </button>
          )}
        </div>
      </div>

      <div className="px-3 py-2 bg-white border-b border-[#e9edef]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696a0]" />
          <input
            type="text"
            placeholder={activeView === 'groups' ? 'Search groups...' : 'Search or start new chat'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => activeView !== 'groups' && searchQuery.length === 0 && onSearchUsers?.()}
            className="w-full pl-10 pr-4 py-2 bg-[#f0f2f5] rounded-lg text-sm text-[#111b21] placeholder-[#8696a0] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {displayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#667781] p-8">
            <MessageCircle className="w-14 h-14 mb-3 opacity-40" />
            <p className="text-center text-sm">
              {searchQuery
                ? 'No results found'
                : activeView === 'groups'
                  ? 'No groups yet. Create one!'
                  : 'No chats yet. Search for users to start.'}
            </p>
          </div>
        ) : (
          displayList.map((chat) => (
            <button
              key={`${chat.type}-${chat.id}`}
              onClick={() => handleChatClick(chat)}
              className={`w-full px-3 py-3 flex items-center gap-3 hover:bg-[#f5f6f6] transition-colors text-left ${
                selectedChat?.id === chat.id && selectedChat?.type === chat.type
                  ? 'bg-[#f0f2f5]'
                  : ''
              }`}
            >
              <Avatar src={chat.avatar} name={chat.name} size="lg" />
              <div className="flex-1 min-w-0 border-b border-[#f0f2f5] pb-3">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-[15px] font-normal text-[#111b21] truncate">{chat.name}</h3>
                  <span className="text-[11px] text-[#667781] flex-shrink-0 ml-2">
                    {new Date(chat.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#667781] truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="ml-2 flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-[#25d366] text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {chat.unread > 99 ? '99+' : chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
