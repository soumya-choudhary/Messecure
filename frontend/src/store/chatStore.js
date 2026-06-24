import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  selectedChat: null,
  setSelectedChat: (chat) => set({ selectedChat: chat }),

  activeView: 'chats',
  setActiveView: (view) => set({ activeView: view }),

  messages: {},
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
    })),
  addMessage: (chatId, message) =>
    set((state) => {
      const existing = state.messages[chatId] || [];
      if (existing.some((m) => m._id === message._id)) return state;
      return {
        messages: {
          ...state.messages,
          [chatId]: [...existing, message],
        },
      };
    }),
  updateMessage: (chatId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) =>
          m._id === messageId ? { ...m, ...updates } : m
        ),
      },
    })),

  friends: [],
  setFriends: (friends) => set({ friends }),

  friendRequests: [],
  setFriendRequests: (requests) => set({ friendRequests: requests }),

  groups: [],
  setGroups: (groups) => set({ groups }),

  stories: [],
  setStories: (stories) => set({ stories }),

  chatPartners: [],
  setChatPartners: (partners) => set({ chatPartners: partners }),

  unreadByChat: {},
  setUnreadByChat: (counts) => set({ unreadByChat: counts }),
  clearUnreadForChat: (chatId) =>
    set((state) => {
      const next = { ...state.unreadByChat };
      delete next[chatId];
      return { unreadByChat: next };
    }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  profileCompletion: 0,
  setProfileCompletion: (completion) => set({ profileCompletion: completion }),

  reset: () =>
    set({
      user: null,
      selectedChat: null,
      activeView: 'chats',
      messages: {},
      friends: [],
      friendRequests: [],
      groups: [],
      stories: [],
      chatPartners: [],
      unreadByChat: {},
      sidebarOpen: false,
      profileCompletion: 0,
    }),
}));

export default useChatStore;
