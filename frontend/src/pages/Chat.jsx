import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../lib/api';
import useChatStore from '../store/chatStore';
import Sidebar from '../components/chat/Sidebar';
import ChatList from '../components/chat/ChatList';
import ChatArea from '../components/chat/ChatArea';
import StoriesPanel from '../components/chat/StoriesPanel';
import AuraAIPanel from '../components/chat/AuraAIPanel';
import ProfileUpdateModal from '../components/chat/ProfileUpdateModal';
import ProfileCompletion from '../components/chat/ProfileCompletion';
import UserSearchModal from '../components/chat/UserSearchModal';
import SettingsModal from '../components/chat/SettingsModal';
import GroupCreateModal from '../components/chat/GroupCreateModal';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const Chat = () => {
  const navigate = useNavigate();
  const {
    user,
    setUser,
    setFriends,
    setFriendRequests,
    setGroups,
    setChatPartners,
    selectedChat,
    activeView,
    sidebarOpen,
    setSidebarOpen,
    profileCompletion,
    setProfileCompletion,
    addMessage,
    reset,
  } = useChatStore();

  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/check');
        if (response.data) {
          setUser(response.data);
          calculateProfileCompletion(response.data);
        } else {
          navigate('/login');
        }
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate, setUser]);

  const calculateProfileCompletion = (userData) => {
    const fields = ['fullName', 'username', 'email', 'profilePic', 'bio'];
    const completed = fields.filter((f) => userData[f]).length;
    setProfileCompletion(Math.round((completed / fields.length) * 100));
  };

  useEffect(() => {
    if (!user) return;

    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001', {
      withCredentials: true,
    });

    newSocket.on('newMessage', (message) => {
      const myId = useChatStore.getState().user?._id?.toString();
      const senderId = message.senderId?._id?.toString() || message.senderId?.toString();
      const receiverId = message.receiverId?.toString?.() || message.receiverId?.toString();

      const chatPartnerId = senderId === myId ? receiverId : senderId;
      if (chatPartnerId) {
        addMessage(chatPartnerId, message);
      }
    });

    newSocket.on('newGroupMessage', ({ groupId, message }) => {
      addMessage(groupId, message);
    });

    newSocket.on('friendRequestReceived', (data) => {
      toast.success(`Friend request from ${data.senderName}`);
      fetchFriendRequests();
    });

    newSocket.on('friendRequestAccepted', (data) => {
      toast.success(`${data.userName} accepted your friend request`);
      fetchFriends();
    });

    newSocket.on('newStory', () => {
      if (useChatStore.getState().activeView === 'stories') {
        api.get('/stories/friends').then((res) => useChatStore.getState().setStories(res.data));
      }
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchFriendRequests();
      fetchGroups();
      fetchChatPartners();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends/list');
      setFriends(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const res = await api.get('/friends/requests/pending');
      setFriendRequests(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups/my-groups');
      setGroups(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChatPartners = async () => {
    try {
      const res = await api.get('/messages/chats');
      setChatPartners(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    window.refreshFriends = fetchFriends;
    window.refreshFriendRequests = fetchFriendRequests;
    return () => {
      delete window.refreshFriends;
      delete window.refreshFriendRequests;
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      reset();
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#111b21]">
        <div className="w-12 h-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const showChatList = activeView === 'chats' || activeView === 'groups';
  const showChatArea = activeView === 'chats' || activeView === 'groups';

  return (
    <div className="flex h-screen bg-[#d1d7db] overflow-hidden">
      <Sidebar
        user={user}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onProfileClick={() => setShowProfileModal(true)}
        onLogout={handleLogout}
        onSettingsClick={() => setShowSettingsModal(true)}
      />

      {showChatList && (
        <ChatList
          onSearchUsers={() => setShowSearchModal(true)}
          onCreateGroup={() => setShowGroupModal(true)}
          showOnMobile={!selectedChat}
        />
      )}

      {activeView === 'stories' && <StoriesPanel />}
      {activeView === 'aura' && <AuraAIPanel />}
      {showChatArea && (
        <ChatArea
          socket={socket}
          onRefreshGroups={fetchGroups}
          onRefreshChatPartners={fetchChatPartners}
        />
      )}

      {showProfileModal && (
        <ProfileUpdateModal
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            api.get('/auth/check').then((res) => {
              if (res.data) {
                setUser(res.data);
                calculateProfileCompletion(res.data);
              }
            });
          }}
          user={user}
        />
      )}

      {showSearchModal && (
        <UserSearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
      )}

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          user={user}
        />
      )}

      {showGroupModal && (
        <GroupCreateModal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} />
      )}

      {profileCompletion < 100 && (
        <ProfileCompletion
          completion={profileCompletion}
          onUpdateClick={() => setShowProfileModal(true)}
        />
      )}
    </div>
  );
};

export default Chat;
