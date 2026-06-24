import { useEffect, useRef, useState } from 'react';
import { Send, Paperclip, Sparkles, Plus, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../../lib/api';
import Avatar from './Avatar';
import useChatStore from '../../store/chatStore';
import toast from 'react-hot-toast';

const AuraAIPanel = () => {
  const { user } = useChatStore();
  const [messages, setMessages] = useState([]);
  const [usage, setUsage] = useState({ limit: 5, used: 0, remaining: 5 });
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const limitReached = usage.remaining <= 0;

  const fetchChat = async () => {
    try {
      const res = await api.get('/aura');
      setMessages(res.data.messages || []);
      setUsage(res.data.usage || { limit: 5, used: 0, remaining: 5 });
    } catch (e) {
      toast.error('Failed to load Aura AI');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (limitReached || sending) return;
    if (!text.trim() && !imagePreview) return;

    setSending(true);
    setTyping(true);

    const optimisticUser = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      imageUrl: imagePreview,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    const sentText = text;
    const sentImage = imagePreview;
    setText('');
    setImagePreview(null);

    try {
      const res = await api.post('/aura/message', {
        text: sentText,
        image: sentImage || undefined,
      });

      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m._id !== optimisticUser._id);
        return [...withoutOptimistic, res.data.userMessage, res.data.assistantMessage];
      });
      setUsage(res.data.usage);
      if (res.data.warning) toast.error(res.data.warning);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== optimisticUser._id));
      const msg = err.response?.data?.message || 'Failed to send message';
      toast.error(msg);
      if (err.response?.status === 429) {
        setUsage((u) => ({ ...u, remaining: 0, used: u.limit }));
      }
    } finally {
      setSending(false);
      setTyping(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await api.post('/aura/conversation/new');
      setMessages(res.data.messages || []);
      setUsage(res.data.usage);
      toast.success('New conversation started');
    } catch (e) {
      toast.error('Failed to start new conversation');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#fafafa]">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#fafafa] min-w-0">
      {/* Header */}
      <div className="h-[60px] px-4 md:px-6 flex items-center justify-between border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-[#1a1a1a] text-lg">Aura AI</h1>
            <p className="text-xs text-[#666]">
              {limitReached
                ? 'Daily Aura AI limit reached. Try again tomorrow.'
                : `${usage.remaining} of ${usage.limit} prompts remaining today`}
            </p>
          </div>
        </div>
        <button
          onClick={handleNewConversation}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#666] hover:bg-gray-100 rounded-lg transition-colors"
          title="New conversation"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New chat</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && !typing ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-2">
                How can Aura help you today?
              </h2>
              <p className="text-[#666] max-w-md text-sm leading-relaxed">
                Ask questions, get writing help, analyze images, or brainstorm ideas.
                You have {usage.remaining} prompts left today.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-8 w-full max-w-lg">
                {['Explain a concept simply', 'Help me write a message', 'Analyze this image'].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setText(suggestion)}
                      disabled={limitReached}
                      className="px-4 py-3 text-sm text-left border border-gray-200 rounded-xl hover:bg-white hover:border-violet-300 transition-colors disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg._id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'order-first' : ''}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        isUser
                          ? 'bg-[#1a1a1a] text-white rounded-br-md'
                          : 'bg-white border border-gray-200 text-[#1a1a1a] rounded-bl-md shadow-sm'
                      }`}
                    >
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Uploaded"
                          className="rounded-lg max-h-48 object-cover mb-2 max-w-full"
                        />
                      )}
                      {msg.text &&
                        (isUser ? (
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        ) : (
                          <div className="text-sm leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2 [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-2 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs [&_h1]:font-bold [&_h2]:font-semibold [&_h3]:font-medium [&_h1]:mb-2 [&_h2]:mb-2 [&_h3]:mb-1">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        ))}
                    </div>
                  </div>
                  {isUser && (
                    <Avatar src={user?.profilePic} name={user?.fullName} size="sm" className="mt-1" />
                  )}
                </div>
              );
            })
          )}

          {typing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="max-w-3xl mx-auto w-full px-4 py-2">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-2">
            <img src={imagePreview} alt="Preview" className="h-14 w-14 object-cover rounded-lg" />
            <span className="text-sm text-[#666] flex-1">Image attached</span>
            <button onClick={() => setImagePreview(null)} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto">
          {limitReached && (
            <p className="text-center text-sm text-amber-600 mb-3 font-medium">
              Daily Aura AI limit reached. Try again tomorrow.
            </p>
          )}
          <div className="flex items-end gap-2 bg-[#f4f4f4] rounded-2xl px-3 py-2 border border-gray-200 focus-within:border-violet-400 focus-within:ring-1 focus-within:ring-violet-400 transition-all">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={limitReached || sending}
              className="p-2 text-[#666] hover:text-violet-600 disabled:opacity-40 rounded-lg"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder={limitReached ? 'Daily limit reached' : 'Message Aura AI...'}
              disabled={limitReached || sending}
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm text-[#1a1a1a] placeholder-[#999] max-h-32 py-2 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={limitReached || sending || (!text.trim() && !imagePreview)}
              className="p-2 bg-[#1a1a1a] text-white rounded-xl hover:bg-violet-600 disabled:opacity-40 disabled:hover:bg-[#1a1a1a] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[11px] text-[#999] mt-2">
            Aura AI can make mistakes. Verify important information.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuraAIPanel;
