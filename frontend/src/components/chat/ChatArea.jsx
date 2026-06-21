import { useEffect, useState, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import api from '../../lib/api';
import { format } from 'date-fns';

const ChatArea = ({ socket }) => {
  const { selectedChat, user, messages, setMessages, addMessage } = useChatStore();
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat && selectedChat.type === 'user') {
      fetchMessages(selectedChat.id);
    }
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (
        (message.senderId._id === selectedChat?.id || message.receiverId === selectedChat?.id) &&
        selectedChat?.type === 'user'
      ) {
        addMessage(selectedChat.id, message);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, selectedChat, addMessage]);

  const fetchMessages = async (chatId) => {
    try {
      const response = await api.get(`/messages/${chatId}`);
      setMessages(chatId, response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat) return;

    setLoading(true);
    try {
      const response = await api.post(`/messages/send/${selectedChat.id}`, {
        text: messageText,
      });

      addMessage(selectedChat.id, response.data);
      setMessageText('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
            <Send className="w-12 h-12 text-white" />
          </div>
          <p className="text-gray-500 text-lg">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  const chatMessages = messages[selectedChat.id] || [];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
            {selectedChat.avatar ? (
              <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
            ) : (
              selectedChat.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
            {selectedChat.type === 'user' && (
              <p className="text-xs text-gray-500">@{selectedChat.username || 'username'}</p>
            )}
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chatMessages.map((message, index) => {
            const isOwn = message.senderId._id === user?._id || message.senderId === user?._id;
            const senderName =
              typeof message.senderId === 'object' ? message.senderId.fullName : 'User';

            return (
              <div
                key={message._id || index}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  {!isOwn && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {typeof message.senderId === 'object' && message.senderId.profilePic ? (
                        <img
                          src={message.senderId.profilePic}
                          alt={senderName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        senderName.charAt(0).toUpperCase()
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-2 ${isOwn ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
                    {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
                    {message.image && (
                      <img src={message.image} alt="Shared" className="mt-2 rounded-lg max-w-full" />
                    )}
                    <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                      {format(new Date(message.createdAt), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </button>
          <button
            type="submit"
            disabled={loading || !messageText.trim()}
            className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatArea;

