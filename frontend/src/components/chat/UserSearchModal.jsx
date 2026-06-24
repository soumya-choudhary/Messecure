import { useState, useEffect } from 'react';
import { X, Search, UserPlus, Check, XCircle, UserCheck, Clock } from 'lucide-react';
import api from '../../lib/api';
import useChatStore from '../../store/chatStore';
import Avatar from './Avatar';
import toast from 'react-hot-toast';

const UserSearchModal = ({ isOpen, onClose }) => {
  const { friends, friendRequests, setFriendRequests } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await api.get(`/friends/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(
        response.data.map((u) => ({
          ...u,
          friendStatus: u.friendStatus || getFriendStatus(u._id),
        }))
      );
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const getFriendStatus = (userId) => {
    if (friends.some((f) => f._id?.toString() === userId.toString())) return 'accepted';
    if (
      friendRequests.some((req) => {
        const senderId = req.senderId?._id || req.senderId;
        return senderId?.toString() === userId.toString();
      })
    ) {
      return 'pending_incoming';
    }
    return 'none';
  };

  const handleSendRequest = async (userId) => {
    setActionLoading((p) => ({ ...p, [userId]: true }));
    try {
      await api.post('/friends/request/send', { recipientId: userId });
      toast.success('Friend request sent!');
      setSearchResults((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, friendStatus: 'pending_outgoing' } : u))
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setActionLoading((p) => ({ ...p, [userId]: false }));
    }
  };

  const handleAcceptRequest = async (userId) => {
    setActionLoading((p) => ({ ...p, [userId]: true }));
    try {
      await api.post('/friends/request/accept', { senderId: userId });
      toast.success('Friend request accepted!');
      const friendsRes = await api.get('/friends/list');
      useChatStore.getState().setFriends(friendsRes.data);
      const reqRes = await api.get('/friends/requests/pending');
      setFriendRequests(reqRes.data);
      setSearchResults((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, friendStatus: 'accepted' } : u))
      );
      window.refreshFriends?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept');
    } finally {
      setActionLoading((p) => ({ ...p, [userId]: false }));
    }
  };

  const handleRejectRequest = async (userId) => {
    setActionLoading((p) => ({ ...p, [userId]: true }));
    try {
      await api.post('/friends/request/reject', { senderId: userId });
      toast.success('Request rejected');
      const res = await api.get('/friends/requests/pending');
      setFriendRequests(res.data);
      setSearchResults((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, friendStatus: 'none' } : u))
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading((p) => ({ ...p, [userId]: false }));
    }
  };

  const handleStartChat = (userData) => {
    useChatStore.getState().setSelectedChat({
      type: 'user',
      id: userData._id,
      name: userData.fullName,
      username: userData.username,
      avatar: userData.profilePic,
    });
    useChatStore.getState().setActiveView('chats');
    onClose();
  };

  const renderAction = (userData) => {
    const status = userData.friendStatus || getFriendStatus(userData._id);
    const isLoading = actionLoading[userData._id];

    if (status === 'accepted') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStartChat(userData)}
            className="px-3 py-1.5 bg-[#00a884] text-white rounded-lg text-sm hover:bg-[#008f6f]"
          >
            Message
          </button>
          <span className="text-xs text-[#008069] flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Friends
          </span>
        </div>
      );
    }
    if (status === 'pending_outgoing') {
      return (
        <span className="text-xs text-amber-600 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Sent
        </span>
      );
    }
    if (status === 'pending_incoming') {
      return (
        <div className="flex gap-1">
          <button
            onClick={() => handleAcceptRequest(userData._id)}
            disabled={isLoading}
            className="p-1.5 bg-[#00a884] text-white rounded-lg disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleRejectRequest(userData._id)}
            disabled={isLoading}
            className="p-1.5 bg-red-100 text-red-600 rounded-lg disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => handleSendRequest(userData._id)}
        disabled={isLoading}
        className="px-3 py-1.5 bg-[#00a884] text-white rounded-lg text-sm hover:bg-[#008f6f] disabled:opacity-50 flex items-center gap-1"
      >
        <UserPlus className="w-3.5 h-3.5" />
        Add
      </button>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-4 py-3 bg-[#00a884] flex items-center gap-3">
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              autoFocus
              placeholder="Search name, username, or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/20 text-white placeholder-white/70 rounded-lg focus:outline-none focus:bg-white/30 text-sm"
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-center py-12 text-[#667781] text-sm">
              {searchQuery.trim() ? 'No users found' : 'Type to search for people'}
            </p>
          ) : (
            searchResults.map((userData) => (
              <div
                key={userData._id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f6f6] border-b border-[#f0f2f5]"
              >
                <Avatar src={userData.profilePic} name={userData.fullName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#111b21] truncate">{userData.fullName}</p>
                  <p className="text-sm text-[#667781] truncate">@{userData.username}</p>
                </div>
                {renderAction(userData)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
