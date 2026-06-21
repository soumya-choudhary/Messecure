import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  // User data
  user: null,
  setUser: (user) => set({ user }),

  // Chat state
  selectedChat: null, // { type: 'user' | 'group', id: string, data: object }
  setSelectedChat: (chat) => set({ selectedChat: chat }),

  // Messages
  messages: {},
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
    })),
  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),

  // Friends
  friends: [],
  setFriends: (friends) => set({ friends }),

  // Friend requests
  friendRequests: [],
  setFriendRequests: (requests) => set({ friendRequests: requests }),

  // Groups
  groups: [],
  setGroups: (groups) => set({ groups }),

  // Stories
  stories: [],
  setStories: (stories) => set({ stories }),

  // Chat partners (people you've messaged)
  chatPartners: [],
  setChatPartners: (partners) => set({ chatPartners: partners }),

  // Folders
  folders: [
    { id: 'all', name: 'All Chats', icon: '💬', chats: [] },
    { id: 'unread', name: 'Unread', icon: '📩', chats: [] },
  ],
  setFolders: (folders) => set({ folders }),
  addFolder: (folder) =>
    set((state) => ({
      folders: [...state.folders, folder],
    })),
  updateFolder: (folderId, updates) =>
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === folderId ? { ...f, ...updates } : f
      ),
    })),
  deleteFolder: (folderId) =>
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== folderId),
    })),

  // UI state
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Profile completion
  profileCompletion: 0,
  setProfileCompletion: (completion) => set({ profileCompletion: completion }),

  // Reset
  reset: () =>
    set({
      user: null,
      selectedChat: null,
      messages: {},
      friends: [],
      friendRequests: [],
      groups: [],
      stories: [],
      chatPartners: [],
      folders: [
        { id: 'all', name: 'All Chats', icon: '💬', chats: [] },
        { id: 'unread', name: 'Unread', icon: '📩', chats: [] },
      ],
      sidebarOpen: false,
      profileCompletion: 0,
    }),
}));

export default useChatStore;

