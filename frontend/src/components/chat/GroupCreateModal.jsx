import { useState } from 'react';
import { X, Users, Upload } from 'lucide-react';
import api from '../../lib/api';
import useChatStore from '../../store/chatStore';
import Avatar from './Avatar';
import toast from 'react-hot-toast';

const GroupCreateModal = ({ isOpen, onClose }) => {
  const { friends, setGroups } = useChatStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupPic, setGroupPic] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setGroupPic(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || selectedMembers.length === 0) {
      toast.error('Group name and at least one member are required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/groups/create', {
        name: name.trim(),
        description,
        memberIds: selectedMembers,
        groupPic: groupPic || undefined,
      });
      const groupsRes = await api.get('/groups/my-groups');
      setGroups(groupsRes.data);
      useChatStore.getState().setSelectedChat({
        type: 'group',
        id: response.data._id,
        name: response.data.name,
        avatar: response.data.groupPic,
        members: response.data.members,
      });
      toast.success('Group created!');
      onClose();
      setName('');
      setDescription('');
      setSelectedMembers([]);
      setGroupPic('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#f0f2f5] px-6 py-4 flex items-center justify-between border-b">
          <h2 className="text-xl font-semibold text-[#111b21]">Create Group</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-[#dfe5e7] flex items-center justify-center overflow-hidden">
                {groupPic ? (
                  <img src={groupPic} alt="Group" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-6 h-6 text-[#54656f]" />
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            <input
              type="text"
              placeholder="Group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00a884] outline-none"
              required
            />
          </div>

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00a884] outline-none resize-none"
          />

          <div>
            <p className="text-sm font-medium text-[#54656f] mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" /> Select members
            </p>
            {friends.length === 0 ? (
              <p className="text-sm text-[#667781]">Add friends first to create a group.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {friends.map((friend) => (
                  <label
                    key={friend._id}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                      selectedMembers.includes(friend._id) ? 'bg-[#d9fdd3]' : 'hover:bg-[#f0f2f5]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(friend._id)}
                      onChange={() => toggleMember(friend._id)}
                      className="accent-[#00a884]"
                    />
                    <Avatar src={friend.profilePic} name={friend.fullName} size="sm" />
                    <span className="text-[#111b21]">{friend.fullName}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00a884] text-white rounded-xl font-medium hover:bg-[#008f6f] disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupCreateModal;
