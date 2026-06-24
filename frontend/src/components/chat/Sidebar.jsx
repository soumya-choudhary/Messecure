import { Menu, X, LogOut, Settings, MessageSquare, Users, Image, Sparkles } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import Avatar from './Avatar';

const Sidebar = ({
  user,
  onToggleSidebar,
  sidebarOpen,
  onProfileClick,
  onLogout,
  onSettingsClick,
}) => {
  const { activeView, setActiveView, setSelectedChat } = useChatStore();

  const menuItems = [
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'stories', label: 'Stories', icon: Image },
    { id: 'aura', label: 'Aura AI', icon: Sparkles },
  ];

  const handleNav = (id) => {
    setActiveView(id);
    setSelectedChat(null);
    onToggleSidebar?.();
  };

  return (
    <>
      <button
        onClick={onToggleSidebar}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-[#f0f2f5] rounded-full shadow-md"
      >
        {sidebarOpen ? <X className="w-5 h-5 text-[#54656f]" /> : <Menu className="w-5 h-5 text-[#54656f]" />}
      </button>

      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[68px] bg-[#f0f2f5] border-r border-[#e9edef] transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full items-center py-3">
          <button
            onClick={onProfileClick}
            className="mb-4 p-1 rounded-full hover:ring-2 hover:ring-[#00a884] transition-all"
            title="Profile"
          >
            <Avatar src={user?.profilePic} name={user?.fullName} size="md" />
          </button>

          <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  title={item.label}
                  className={`w-full p-3 rounded-xl transition-colors flex flex-col items-center gap-0.5 ${
                    active
                      ? item.id === 'aura'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-[#d9fdd3] text-[#008069]'
                      : 'text-[#54656f] hover:bg-[#e9edef]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium hidden xl:block">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex flex-col items-center gap-1 w-full px-2 pb-2">
            <button
              onClick={onSettingsClick}
              title="Settings"
              className="w-full p-3 rounded-xl text-[#54656f] hover:bg-[#e9edef] transition-colors"
            >
              <Settings className="w-5 h-5 mx-auto" />
            </button>
            <button
              onClick={onLogout}
              title="Logout"
              className="w-full p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mx-auto" />
            </button>
          </div>
        </div>

        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={onToggleSidebar} />
        )}
      </div>
    </>
  );
};

export default Sidebar;
