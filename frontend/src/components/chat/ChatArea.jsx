import { useEffect, useState, useRef } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  ArrowLeft,
  X,
  UserMinus,
  ImageIcon,
  Sparkles, // Added for the Summarize icon
} from 'lucide-react';
import useChatStore from '../../store/chatStore';
import api from '../../lib/api';
import Avatar from './Avatar';
import toast from 'react-hot-toast';

const DEFAULT_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const INPUT_EMOJIS = ['😀', '😂', '😍', '🥰', '😊', '👍', '❤️', '🔥', '🎉', '✨', '🙏', '😢'];

const getTargetLanguage = () => {
  const stored = localStorage.getItem('chat_translate_language');
  if (stored) return stored;
  const code = (navigator.language || 'en').split('-')[0];
  const map = { en: 'English', es: 'Spanish', hi: 'Hindi', fr: 'French', de: 'German', pt: 'Portuguese', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese' };
  return map[code] || 'English';
};

const isAutoTranslateEnabled = () => localStorage.getItem('chat_auto_translate') === 'true';

const ChatArea = ({ socket, onRefreshGroups, onRefreshChatPartners }) => {
  const {
    selectedChat,
    setSelectedChat,
    user,
    messages,
    setMessages,
    addMessage,
    updateMessage,
    clearUnreadForChat,
  } = useChatStore();

  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [reactingTo, setReactingTo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // --- NEW AI FEATURE STATES ---
  const [smartReplies, setSmartReplies] = useState([]);
  const [translations, setTranslations] = useState({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  // -----------------------------

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  const chatId = selectedChat?.id;
  const isGroup = selectedChat?.type === 'group';
  const chatMessages = messages[chatId] || [];

  const getSenderId = (msg) => msg.senderId?._id?.toString() || msg.senderId?.toString();

  useEffect(() => {
    if (!selectedChat) return;

    setSmartReplies([]);
    setTranslations({});

    if (selectedChat.type === 'user') {
      fetchMessages(selectedChat.id);
      markChatRead(selectedChat.id);
    } else if (selectedChat.type === 'group') {
      fetchGroupMessages(selectedChat.id);
    }
  }, [selectedChat?.id, selectedChat?.type]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleNewMessage = (message) => {
      const partnerId =
        message.senderId?._id?.toString() === user?._id?.toString()
          ? message.receiverId?.toString?.() || message.receiverId
          : message.senderId?._id?.toString() || message.senderId?.toString();

      if (selectedChat.type === 'user' && partnerId === selectedChat.id) {
        addMessage(selectedChat.id, message);
        markChatRead(selectedChat.id);
      }
    };

    const handleGroupMessage = ({ groupId, message }) => {
      if (selectedChat.type === 'group' && groupId === selectedChat.id) {
        addMessage(selectedChat.id, message);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('newGroupMessage', handleGroupMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('newGroupMessage', handleGroupMessage);
    };
  }, [socket, selectedChat, user, addMessage]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch smart replies when partner sends the last message
  const lastMessage = chatMessages[chatMessages.length - 1];
  const lastMessageId = lastMessage?._id;

  useEffect(() => {
    if (!selectedChat || !lastMessageId || chatMessages.length === 0) {
      setSmartReplies([]);
      return;
    }

    if (getSenderId(lastMessage) === user?._id?.toString()) {
      setSmartReplies([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const url = isGroup
          ? `/groups/${selectedChat.id}/smart-replies`
          : `/messages/${selectedChat.id}/smart-replies`;
        const res = await api.get(url);
        if (!cancelled) setSmartReplies(res.data.replies || []);
      } catch {
        if (!cancelled) setSmartReplies([]);
      }
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedChat?.id, selectedChat?.type, lastMessageId, user?._id, isGroup]);

  // Auto-translate incoming messages when enabled
  useEffect(() => {
    if (!isAutoTranslateEnabled() || !lastMessage?.text) return;
    if (getSenderId(lastMessage) === user?._id?.toString()) return;
    if (translations[lastMessageId]) return;

    const autoTranslate = async () => {
      try {
        const res = await api.post(`/messages/${lastMessageId}/translate`, {
          targetLanguage: getTargetLanguage(),
        });
        setTranslations((prev) => ({
          ...prev,
          [lastMessageId]: { text: res.data.translatedText, original: lastMessage.text },
        }));
      } catch {
        // silent fail for auto-translate
      }
    };
    autoTranslate();
  }, [lastMessageId]);

  const fetchMessages = async (id) => {
    try {
      const res = await api.get(`/messages/${id}`);
      setMessages(id, res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGroupMessages = async (id) => {
    try {
      const res = await api.get(`/groups/${id}/messages`);
      setMessages(id, res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const markChatRead = async (partnerId) => {
    try {
      await api.post(`/messages/read-chat/${partnerId}`);
      clearUnreadForChat(partnerId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!messageText.trim() && !imagePreview) || !selectedChat) return;

    setLoading(true);
    try {
      let textToSend = messageText.trim() || undefined;

      // Translate outgoing message for recipient when enabled (DM only)
      if (
        textToSend &&
        !isGroup &&
        localStorage.getItem('chat_translate_outgoing') === 'true'
      ) {
        try {
          const tr = await api.post('/messages/translate-text', {
            text: textToSend,
            targetLanguage: 'English',
          });
          textToSend = tr.data.translatedText;
        } catch {
          // send original if translation fails
        }
      }

      const payload = {
        text: textToSend,
        image: imagePreview || undefined,
      };

      let response;
      if (isGroup) {
        response = await api.post(`/groups/${selectedChat.id}/send-message`, payload);
      } else {
        response = await api.post(`/messages/send/${selectedChat.id}`, payload);
      }

      addMessage(selectedChat.id, response.data);
      setMessageText('');
      setImagePreview(null);
      setSmartReplies([]); // Clear smart replies after sending
      onRefreshGroups?.();
      onRefreshChatPartners?.();
    } catch (e) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const res = await api.post(`/messages/${messageId}/react`, { emoji });
      updateMessage(chatId, messageId, { reactions: res.data.reactions });
      setReactingTo(null);
    } catch (e) {
      toast.error('Failed to react');
    }
  };

  const handleRemoveFriend = async () => {
    if (!selectedChat || isGroup) return;
    try {
      await api.post('/friends/remove', { friendId: selectedChat.id });
      toast.success('Friend removed');
      setSelectedChat(null);
      setShowMenu(false);
      onRefreshChatPartners?.();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to remove friend');
    }
  };

  const handleCloseChat = () => setSelectedChat(null);

  // --- NEW AI HANDLERS: Summarize & Translate ---
  const handleSummarize = async () => {
    setIsSummarizing(true);
    setShowMenu(false);
    const loadingToast = toast.loading('Summarizing chat...');

    try {
      const url = isGroup
        ? `/groups/${selectedChat.id}/summarize`
        : `/messages/${selectedChat.id}/summarize`;
      const res = await api.get(url);
      toast.success(res.data.summary, { id: loadingToast, duration: 10000 });
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to summarize chat';
      toast.error(msg, { id: loadingToast });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTranslate = async (messageId, originalText) => {
    if (translations[messageId]) {
      setTranslations((prev) => {
        const next = { ...prev };
        delete next[messageId];
        return next;
      });
      return;
    }

    const loadingToast = toast.loading('Translating...');
    try {
      const res = await api.post(`/messages/${messageId}/translate`, {
        targetLanguage: getTargetLanguage(),
      });
      setTranslations((prev) => ({
        ...prev,
        [messageId]: { text: res.data.translatedText, original: originalText },
      }));
      toast.dismiss(loadingToast);
    } catch (e) {
      const msg = e.response?.data?.message || 'Translation failed';
      toast.error(msg, { id: loadingToast });
    }
  };
  // ----------------------------------------------

  if (!selectedChat) {
    return (
      <div className="flex-1 hidden md:flex items-center justify-center bg-[#f0f2f5] border-b border-[#e9edef]">
        <div className="text-center max-w-sm px-6">
          <div className="w-24 h-24 bg-[#dfe5e7] rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-10 h-10 text-[#8696a0]" />
          </div>
          <h2 className="text-2xl font-light text-[#41525d] mb-2">Realtime Chat</h2>
          <p className="text-[#667781]">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#efeae2] min-w-0">
      {/* Header */}
      <div className="h-[60px] px-2 md:px-4 flex items-center justify-between bg-[#f0f2f5] border-b border-[#e9edef] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={handleCloseChat}
            className="md:hidden p-2 hover:bg-[#e9edef] rounded-full"
            aria-label="Back to chats"
          >
            <ArrowLeft className="w-5 h-5 text-[#54656f]" />
          </button>
          <Avatar src={selectedChat.avatar} name={selectedChat.name} size="md" />
          <div className="min-w-0">
            <h3 className="font-medium text-[#111b21] truncate">{selectedChat.name}</h3>
            {selectedChat.type === 'user' && (
              <p className="text-xs text-[#667781] truncate">@{selectedChat.username || 'user'}</p>
            )}
            {isGroup && (
              <p className="text-xs text-[#667781]">{selectedChat.members?.length || ''} members</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 relative" ref={menuRef}>
          <button
            onClick={handleCloseChat}
            className="hidden md:flex p-2 hover:bg-[#e9edef] rounded-full"
            title="Close chat"
          >
            <X className="w-5 h-5 text-[#54656f]" />
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-[#e9edef] rounded-full"
          >
            <MoreVertical className="w-5 h-5 text-[#54656f]" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-[#e9edef] py-1 z-20">
              <button
                onClick={() => {
                  setShowPhotoModal(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-[#111b21] hover:bg-[#f0f2f5] flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" /> View profile photo
              </button>

              {/* NEW AI FEATURE: Summarize Chat Button */}
              <button
                onClick={handleSummarize}
                disabled={isSummarizing || chatMessages.length === 0}
                className="w-full px-4 py-2.5 text-left text-sm text-[#111b21] hover:bg-[#f0f2f5] flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#00a884]" />
                {isSummarizing ? 'Summarizing...' : 'Summarize Chat'}
              </button>

              {!isGroup && (
                <button
                  onClick={handleRemoveFriend}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <UserMinus className="w-4 h-4" /> Remove friend
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1d7db' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#667781] bg-white/80 px-4 py-2 rounded-lg text-sm">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          chatMessages.map((message) => {
            const isOwn = getSenderId(message) === user?._id?.toString();
            const senderName =
              typeof message.senderId === 'object' ? message.senderId.fullName : 'User';
            const senderPic =
              typeof message.senderId === 'object' ? message.senderId.profilePic : null;

            return (
              <div
                key={message._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative`}
                onMouseEnter={() => setReactingTo(message._id)}
                onMouseLeave={() => setReactingTo(null)}
              >
                <div
                  className={`flex gap-2 max-w-[85%] md:max-w-[65%] ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  {!isOwn && (
                    <Avatar src={senderPic} name={senderName} size="sm" className="self-end mb-1" />
                  )}
                  <div>
                    {isGroup && !isOwn && (
                      <p className="text-xs text-[#667781] mb-0.5 ml-1">{senderName}</p>
                    )}
                    <div
                      className={`rounded-lg px-3 py-1.5 shadow-sm ${isOwn
                        ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                        : 'bg-white text-[#111b21] rounded-tl-none'
                        }`}
                    >
                      {/* NEW AI FEATURE: Translation Display */}
                      {message.text && (
                        <div className="group/text relative">
                          {translations[message._id] ? (
                            <>
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {translations[message._id].text}
                              </p>
                              <p className="text-[10px] text-[#667781] mt-1 italic opacity-80">
                                {translations[message._id].original}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                          )}

                          {!isOwn && message.text && (
                            <button
                              onClick={() => handleTranslate(message._id, message.text)}
                              className="text-[10px] text-[#00a884] mt-1 font-medium hover:underline block"
                            >
                              {translations[message._id] ? 'Show original' : `Translate to ${getTargetLanguage()}`}
                            </button>
                          )}
                        </div>
                      )}

                      {message.image && (
                        <img
                          src={message.image}
                          alt="Shared"
                          className="mt-1 rounded-md max-w-full max-h-64 object-cover cursor-pointer"
                          onClick={() => window.open(message.image, '_blank')}
                        />
                      )}
                      <p className="text-[10px] text-[#667781] text-right mt-0.5">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {message.reactions?.length > 0 && (
                      <div className={`flex flex-wrap gap-1 mt-0.5 ${isOwn ? 'justify-end' : ''}`}>
                        {[...new Set(message.reactions.map((r) => r.emoji))].map((emoji) => {
                          const count = message.reactions.filter((r) => r.emoji === emoji).length;
                          return (
                            <span
                              key={emoji}
                              className="text-xs bg-white border border-[#e9edef] rounded-full px-1.5 py-0.5 cursor-pointer hover:bg-[#f0f2f5]"
                              onClick={() => handleReaction(message._id, emoji)}
                            >
                              {emoji} {count > 1 && count}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {reactingTo === message._id && (
                      <div
                        className={`absolute ${isOwn ? 'right-0' : 'left-8'} -top-8 flex gap-0.5 bg-white rounded-full shadow-lg border border-[#e9edef] px-1 py-0.5 z-10`}
                      >
                        {DEFAULT_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(message._id, emoji)}
                            className="text-base hover:scale-125 transition-transform p-0.5"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 py-2 bg-[#f0f2f5] border-t border-[#e9edef] flex items-center gap-2">
          <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
          <button
            onClick={() => setImagePreview(null)}
            className="text-sm text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      )}

      {/* NEW AI FEATURE: Smart Replies UI */}
      {smartReplies.length > 0 && (
        <div className="px-3 pt-2 pb-1 bg-[#f0f2f5] flex gap-2 overflow-x-auto no-scrollbar border-t border-[#e9edef]">
          <Sparkles className="w-5 h-5 text-[#00a884] flex-shrink-0 self-center ml-1" />
          {smartReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMessageText(reply);
                setSmartReplies([]); // clear after clicking
              }}
              className="px-4 py-1.5 bg-white border border-[#e9edef] rounded-full text-sm text-[#54656f] hover:bg-gray-50 whitespace-nowrap shadow-sm transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="px-3 py-2 bg-[#f0f2f5] border-t border-[#e9edef] flex-shrink-0"
      >
        <div className="flex items-end gap-2 relative">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 hover:bg-[#e9edef] rounded-full transition-colors flex-shrink-0"
            title="Attach photo"
          >
            <Paperclip className="w-5 h-5 text-[#54656f]" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="flex-1 relative">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message"
              className="w-full px-4 py-2.5 bg-white rounded-lg border border-[#e9edef] focus:outline-none focus:border-[#00a884] text-[#111b21] text-sm"
            />
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-[#e9edef] p-2 grid grid-cols-6 gap-1 z-20">
                {INPUT_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setMessageText((t) => t + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-xl p-1 hover:bg-[#f0f2f5] rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2.5 hover:bg-[#e9edef] rounded-full transition-colors flex-shrink-0"
          >
            <Smile className="w-5 h-5 text-[#54656f]" />
          </button>

          <button
            type="submit"
            disabled={loading || (!messageText.trim() && !imagePreview)}
            className="p-2.5 bg-[#00a884] text-white rounded-full hover:bg-[#008f6f] disabled:opacity-40 transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Profile photo modal */}
      {showPhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            {selectedChat.avatar ? (
              <img
                src={selectedChat.avatar}
                alt={selectedChat.name}
                className="w-full rounded-2xl object-cover max-h-[80vh]"
              />
            ) : (
              <div className="w-48 h-48 mx-auto bg-[#dfe5e7] rounded-full flex items-center justify-center text-6xl text-[#54656f]">
                {selectedChat.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-white text-center mt-4 text-lg font-medium">{selectedChat.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;