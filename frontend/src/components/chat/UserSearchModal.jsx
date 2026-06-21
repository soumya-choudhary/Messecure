import { useState, useEffect } from 'react';
import { X, Search, UserPlus, Check, XCircle, UserCheck, Clock } from 'lucide-react';
import api from '../../lib/api';
import useChatStore from '../../store/chatStore';
import toast from 'react-hot-toast';

const UserSearchModal = ({ isOpen, onClose }) => {
  const { user, friends, friendRequests, setFriendRequests } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Debounce search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await api.get(`/friends/search?query=${encodeURIComponent(searchQuery)}`);
      // Results already have friendStatus from backend, but let's ensure it's set
      const enrichedResults = response.data.map((searchedUser) => {
        const friendStatus = searchedUser.friendStatus || getFriendStatus(searchedUser._id);
        return { ...searchedUser, friendStatus };
      });
      setSearchResults(enrichedResults);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  // Get friend status for a user
  const getFriendStatus = (userId) => {
    // Check if already friends
    const isFriend = friends.some((friend) => friend._id === userId || friend._id?.toString() === userId);
    if (isFriend) return 'accepted';

    // Check if there's a pending request (incoming - they sent us)
    const pendingRequest = friendRequests.find((req) => {
      const senderId = req.senderId?._id || req.senderId;
      return senderId?.toString() === userId.toString();
    });

    if (pendingRequest) {
      return 'pending_incoming'; // They sent us a request
    }

    return 'none'; // No relationship
  };

  const handleSendRequest = async (userId) => {
    setActionLoading({ ...actionLoading, [userId]: true });
    try {
      await api.post('/friends/request/send', { recipientId: userId });
      toast.success('Friend request sent!');
      // Refresh friend requests
      const response = await api.get('/friends/requests/pending');
      setFriendRequests(response.data);
      // Update the search results
      setSearchResults((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, friendStatus: 'pending_outgoing' } : u))
      );
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send friend request';
      toast.error(message);
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false });
    }
  };

  const handleAcceptRequest = async (userId) => {
    setActionLoading({ ...actionLoading, [userId]: true });
    try {
      await api.post('/friends/request/accept', { senderId: userId });
      toast.success('Friend request accepted!');
      // Refresh friends and requests
      const friendsResponse = await api.get('/friends/list');
      useChatStore.getState().setFriends(friendsResponse.data);
      const requestsResponse = await api.get('/friends/requests/pending');
      setFriendRequests(requestsResponse.data);
      // Update the search results
      setSearchResults((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, friendStatus: 'accepted' } : u))
      );
      // Trigger friends refresh in parent
      if (window.refreshFriends) {
        window.refreshFriends();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to accept friend request';
      toast.error(message);
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false });
    }
  };

  const handleRejectRequest = async (userId) => {
    setActionLoading({ ...actionLoading, [userId]: true });
    try {
      await api.post('/friends/request/reject', { senderId: userId });
      toast.success('Friend request rejected');
      // Refresh requests
      const response = await api.get('/friends/requests/pending');
      setFriendRequests(response.data);
      // Update the search results
      setSearchResults((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, friendStatus: 'none' } : u))
      );
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject friend request';
      toast.error(message);
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false });
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Search Users</h2>
            <p className="text-sm text-gray-500 mt-1">
              Search for users by name, username, or email
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : searchResults.length === 0 && searchQuery.trim() ? (
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Start typing to search for users</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((userData) => {
                const status = userData.friendStatus || getFriendStatus(userData._id);
                const isLoading = actionLoading[userData._id];

                return (
                  <div
                    key={userData._id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
                        {userData.profilePic ? (
                          <img
                            src={userData.profilePic}
                            alt={userData.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          userData.fullName?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {userData.fullName}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">@{userData.username}</p>
                        {userData.bio && (
                          <p className="text-xs text-gray-400 mt-1 truncate">{userData.bio}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      {status === 'accepted' ? (
                        <>
                          <button
                            onClick={() => handleStartChat(userData)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                          >
                            Message
                          </button>
                          <div className="px-3 py-2 bg-green-100 text-green-700 rounded-lg flex items-center space-x-1 text-sm font-medium">
                            <UserCheck className="w-4 h-4" />
                            <span>Friends</span>
                          </div>
                        </>
                      ) : status === 'pending_outgoing' ? (
                        <div className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg flex items-center space-x-2 text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          <span>Request Sent</span>
                        </div>
                      ) : status === 'pending_incoming' ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAcceptRequest(userData._id)}
                            disabled={isLoading}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50 flex items-center space-x-1"
                          >
                            <Check className="w-4 h-4" />
                            <span>{isLoading ? 'Accepting...' : 'Accept'}</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(userData._id)}
                            disabled={isLoading}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50 flex items-center space-x-1"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(userData._id)}
                          disabled={isLoading}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium disabled:opacity-50 flex items-center space-x-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>{isLoading ? 'Sending...' : 'Add Friend'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;

