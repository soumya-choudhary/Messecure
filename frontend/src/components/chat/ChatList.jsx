import { useEffect, useState } from 'react';
import { Search, Edit3, Plus, MessageCircle } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import api from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';

const ChatList = ({ onEditFolders, onSearchUsers }) => {
  const { chatPartners, groups, selectedChat, setSelectedChat, folders } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('all');
  const [unreadCounts, setUnreadCounts] = useState({});

  // Fetch unread counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const response = await api.get('/messages/unread/count');
        setUnreadCounts({ total: response.data.unreadCount });
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };
    fetchUnreadCounts();
  }, []);

  // Combine chats for display
  const allChats = [
    ...chatPartners.map((partner) => ({
      type: 'user',
      id: partner._id,
      name: partner.fullName,
      username: partner.username,
      avatar: partner.profilePic,
      lastMessage: 'Tap to start chatting',
      timestamp: new Date(),
      unread: 0,
    })),
    ...groups.map((group) => ({
      type: 'group',
      id: group._id,
      name: group.name,
      avatar: group.groupPic,
      lastMessage: group.lastMessage?.text || 'No messages yet',
      timestamp: group.updatedAt || new Date(),
      unread: 0,
    })),
  ];

  // Filter chats based on search
  const filteredChats = allChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by timestamp
  const sortedChats = [...filteredChats].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Chats</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEditFolders}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit Folders"
            >
              <Edit3 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Search Users Button */}
        <button
          onClick={onSearchUsers}
          className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium flex items-center justify-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>Search Users</span>
        </button>

        {/* Folders */}
        <div className="flex space-x-2 mt-4 overflow-x-auto">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeFolder === folder.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{folder.icon}</span>
              {folder.name}
              {folder.id === 'unread' && unreadCounts.total > 0 && (
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {unreadCounts.total}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {sortedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-center">
              {searchQuery ? 'No chats found' : 'No chats yet. Start a new conversation!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedChats.map((chat) => (
              <div
                key={`${chat.type}-${chat.id}`}
                onClick={() => handleChatClick(chat)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedChat?.id === chat.id && selectedChat?.type === chat.type
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                      {chat.avatar ? (
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        chat.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {chat.type === 'user' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {chat.name}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                  </div>

                  {/* Unread Badge */}
                  {chat.unread > 0 && (
                    <div className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                      {chat.unread > 9 ? '9+' : chat.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;

