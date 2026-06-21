import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../lib/api';
import useChatStore from '../store/chatStore';
import Sidebar from '../components/chat/Sidebar';
import ChatList from '../components/chat/ChatList';
import ChatArea from '../components/chat/ChatArea';
import ProfileUpdateModal from '../components/chat/ProfileUpdateModal';
import FolderModal from '../components/chat/FolderModal';
import ProfileCompletion from '../components/chat/ProfileCompletion';
import UserSearchModal from '../components/chat/UserSearchModal';
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
        sidebarOpen,
        setSidebarOpen,
        profileCompletion,
        setProfileCompletion,
        reset,
    } = useChatStore();

    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);

    // Check authentication and load user data
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
                console.error('Auth check failed:', error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [navigate, setUser]);

    // Calculate profile completion percentage
    const calculateProfileCompletion = (userData) => {
        const fields = {
            fullName: userData.fullName ? 1 : 0,
            username: userData.username ? 1 : 0,
            email: userData.email ? 1 : 0,
            profilePic: userData.profilePic ? 1 : 0,
            bio: userData.bio ? 1 : 0,
        };
        const total = Object.keys(fields).length;
        const completed = Object.values(fields).reduce((a, b) => a + b, 0);
        const percentage = Math.round((completed / total) * 100);
        setProfileCompletion(percentage);
    };

    // Initialize socket connection
    useEffect(() => {
        if (user) {
            const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001', {
                withCredentials: true,
            });

            newSocket.on('connect', () => {
                console.log('Connected to server');
            });

            newSocket.on('newMessage', (message) => {
                // Handle new message
                useChatStore.getState().addMessage(
                    message.receiverId || message.senderId,
                    message
                );
            });

            newSocket.on('friendRequestReceived', (data) => {
                toast.success(`Friend request from ${data.senderName}`);
                fetchFriendRequests();
            });

            newSocket.on('friendRequestAccepted', (data) => {
                toast.success(`${data.userName} accepted your friend request`);
                fetchFriends();
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user]);

    // Load initial data
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
            const response = await api.get('/friends/list');
            setFriends(response.data);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const fetchFriendRequests = async () => {
        try {
            const response = await api.get('/friends/requests/pending');
            setFriendRequests(response.data);
        } catch (error) {
            console.error('Error fetching friend requests:', error);
        }
    };

    // Expose fetchFriends for UserSearchModal to refresh after accepting requests
    useEffect(() => {
        if (user) {
            window.refreshFriends = fetchFriends;
            window.refreshFriendRequests = fetchFriendRequests;
            return () => {
                delete window.refreshFriends;
                delete window.refreshFriendRequests;
            };
        }
    }, [user]);

    const fetchGroups = async () => {
        try {
            const response = await api.get('/groups/my-groups');
            setGroups(response.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const fetchChatPartners = async () => {
        try {
            const response = await api.get('/messages/chats');
            setChatPartners(response.data);
        } catch (error) {
            console.error('Error fetching chat partners:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            reset();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar Navigation */}
            <Sidebar
                user={user}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                sidebarOpen={sidebarOpen}
                onProfileClick={() => setShowProfileModal(true)}
                onLogout={handleLogout}
            />

            {/* Chat List */}
            <ChatList
                onEditFolders={() => setShowFolderModal(true)}
                onSearchUsers={() => setShowSearchModal(true)}
                user={user}
            />

            {/* Chat Area */}
            <ChatArea socket={socket} />

            {/* Profile Update Modal */}
            {showProfileModal && (
                <ProfileUpdateModal
                    isOpen={showProfileModal}
                    onClose={() => {
                        setShowProfileModal(false);
                        // Refresh user data
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

            {/* Folder Management Modal */}
            {showFolderModal && (
                <FolderModal
                    isOpen={showFolderModal}
                    onClose={() => setShowFolderModal(false)}
                />
            )}

            {/* User Search Modal */}
            {showSearchModal && (
                <UserSearchModal
                    isOpen={showSearchModal}
                    onClose={() => setShowSearchModal(false)}
                />
            )}

            {/* Profile Completion Banner - Show if less than 100% */}
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

