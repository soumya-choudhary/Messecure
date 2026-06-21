import { useState } from 'react';
import { X, Plus, Trash2, Edit3 } from 'lucide-react';
import useChatStore from '../../store/chatStore';

const FolderModal = ({ isOpen, onClose }) => {
  const { folders, addFolder, updateFolder, deleteFolder } = useChatStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [folderIcon, setFolderIcon] = useState('📁');

  const icons = ['💬', '📩', '⭐', '👥', '📁', '🔒', '📌', '🎯', '💼', '🎨'];

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      const newFolder = {
        id: `folder-${Date.now()}`,
        name: folderName,
        icon: folderIcon,
        chats: [],
      };
      addFolder(newFolder);
      setFolderName('');
      setFolderIcon('📁');
      setShowAddForm(false);
    }
  };

  const handleUpdateFolder = () => {
    if (editingFolder && folderName.trim()) {
      updateFolder(editingFolder.id, {
        name: folderName,
        icon: folderIcon,
      });
      setEditingFolder(null);
      setFolderName('');
      setFolderIcon('📁');
    }
  };

  const handleEdit = (folder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderIcon(folder.icon);
    setShowAddForm(false);
  };

  const handleDelete = (folderId) => {
    if (window.confirm('Are you sure you want to delete this folder?')) {
      deleteFolder(folderId);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingFolder(null);
    setFolderName('');
    setFolderIcon('📁');
  };

  if (!isOpen) return null;

  const customFolders = folders.filter((f) => !['all', 'unread'].includes(f.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Folders</h2>
            <p className="text-sm text-gray-500 mt-1">
              Create folders for different groups of chats and quickly switch between them
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Default Folders */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Default Folders</h3>
            <div className="space-y-2">
              {folders
                .filter((f) => ['all', 'unread'].includes(f.id))
                .map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{folder.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{folder.name}</p>
                        <p className="text-xs text-gray-500">{folder.chats.length} chats</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Custom Folders */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">My Folders</h3>
              {!showAddForm && !editingFolder && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Folder</span>
                </button>
              )}
            </div>

            {/* Add/Edit Form */}
            {(showAddForm || editingFolder) && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Folder Name
                    </label>
                    <input
                      type="text"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      placeholder="Enter folder name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Icon
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {icons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFolderIcon(icon)}
                          className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                            folderIcon === icon
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                    >
                      {editingFolder ? 'Update' : 'Create'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Folders List */}
            <div className="space-y-2">
              {customFolders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No custom folders yet</p>
              ) : (
                customFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{folder.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{folder.name}</p>
                        <p className="text-xs text-gray-500">{folder.chats.length} chats</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(folder)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(folder.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderModal;

