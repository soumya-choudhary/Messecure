import { useState } from 'react';
import { X, Bell, Moon, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsModal = ({ isOpen, onClose, user }) => {
  const [settings, setSettings] = useState({
    notifications: localStorage.getItem('chat_notifications') !== 'false',
    darkMode: localStorage.getItem('chat_dark_mode') === 'true',
    readReceipts: localStorage.getItem('chat_read_receipts') !== 'false',
  });

  const toggle = (key, storageKey) => {
    const next = !settings[key];
    setSettings((s) => ({ ...s, [key]: next }));
    localStorage.setItem(storageKey, String(next));
    toast.success('Setting saved');
  };

  const clearLocalData = () => {
    localStorage.removeItem('chat_notifications');
    localStorage.removeItem('chat_dark_mode');
    localStorage.removeItem('chat_read_receipts');
    toast.success('Local preferences cleared');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#f0f2f5]">
          <h2 className="text-xl font-semibold text-[#111b21]">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X className="w-5 h-5 text-[#54656f]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="pb-4 border-b border-gray-100">
            <p className="text-sm text-[#667781]">Account</p>
            <p className="font-medium text-[#111b21]">{user?.fullName}</p>
            <p className="text-sm text-[#667781]">@{user?.username}</p>
            <p className="text-sm text-[#667781] mt-1">{user?.email}</p>
          </div>

          {[
            { key: 'notifications', label: 'Message notifications', icon: Bell, storage: 'chat_notifications' },
            { key: 'darkMode', label: 'Dark mode (coming soon)', icon: Moon, storage: 'chat_dark_mode' },
            { key: 'readReceipts', label: 'Read receipts', icon: Shield, storage: 'chat_read_receipts' },
          ].map(({ key, label, icon: Icon, storage }) => (
            <button
              key={key}
              onClick={() => toggle(key, storage)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#f0f2f5] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-[#00a884]" />
                <span className="text-[#111b21]">{label}</span>
              </div>
              <div
                className={`w-11 h-6 rounded-full transition-colors ${
                  settings[key] ? 'bg-[#00a884]' : 'bg-gray-300'
                } relative`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings[key] ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </button>
          ))}

          <button
            onClick={clearLocalData}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Reset local preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
