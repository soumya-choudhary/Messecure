import { useState, useEffect, useRef } from 'react';
import { X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import useChatStore from '../../store/chatStore';
import Avatar from './Avatar';
import toast from 'react-hot-toast';

const STORY_DURATION_MS = 30000;

const StoryViewer = ({ storyGroup, onClose, onNext, onPrev }) => {
  const { user } = useChatStore();
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const startRef = useRef(Date.now());

  const stories = storyGroup?.stories || [];
  const currentStory = stories[storyIndex];
  const isOwn = storyGroup?.user?._id === user?._id;

  useEffect(() => {
    if (!currentStory) return;

    const markViewed = async () => {
      if (!isOwn) {
        try {
          await api.post(`/stories/${currentStory._id}/view`);
        } catch (e) {
          console.error(e);
        }
      }
    };
    markViewed();

    startRef.current = Date.now();
    setProgress(0);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      setProgress(Math.min((elapsed / STORY_DURATION_MS) * 100, 100));
      if (elapsed >= STORY_DURATION_MS) {
        goNext();
      }
    }, 50);

    return () => clearInterval(timerRef.current);
  }, [currentStory?._id]);

  const goNext = () => {
    if (storyIndex < stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else {
      onNext?.();
    }
  };

  const goPrev = () => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else {
      onPrev?.();
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="flex gap-1 p-3 pt-4">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <Avatar src={storyGroup.user?.profilePic} name={storyGroup.user?.fullName} size="sm" />
          <div>
            <p className="text-white font-medium text-sm">{storyGroup.user?.fullName}</p>
            <p className="text-white/60 text-xs">
              {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <button onClick={goPrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10" aria-label="Previous" />
        <button onClick={goNext} className="absolute right-0 top-0 bottom-0 w-1/3 z-10" aria-label="Next" />

        {currentStory.mediaType === 'video' ? (
          <video src={currentStory.content} className="max-h-full max-w-full object-contain" autoPlay muted />
        ) : (
          <img src={currentStory.content} alt="Story" className="max-h-full max-w-full object-contain" />
        )}

        {currentStory.caption && (
          <p className="absolute bottom-8 left-4 right-4 text-white text-center text-sm drop-shadow-lg">
            {currentStory.caption}
          </p>
        )}
      </div>

      <div className="flex justify-center gap-4 pb-6">
        <button onClick={goPrev} className="p-2 text-white/80 hover:text-white">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button onClick={goNext} className="p-2 text-white/80 hover:text-white">
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

const StoriesPanel = () => {
  const { user, stories, setStories } = useChatStore();
  const [viewerIndex, setViewerIndex] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const fetchStories = async () => {
    try {
      const res = await api.get('/stories/friends');
      setStories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await api.post('/stories/upload', {
          content: reader.result,
          mediaType: file.type.startsWith('video/') ? 'video' : 'image',
          caption: '',
        });
        toast.success('Story uploaded!');
        fetchStories();
      } catch (err) {
        toast.error('Failed to upload story');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const ownStories = stories.find((s) => s.user?._id === user?._id);

  return (
    <div className="flex-1 flex flex-col bg-[#f0f2f5]">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-semibold text-[#111b21]">Stories</h2>
        <p className="text-sm text-[#667781]">Photos disappear after 24 hours · 30s per view</p>
      </div>

      <div className="p-4 overflow-x-auto">
        <div className="flex gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#00a884] flex items-center justify-center bg-white">
              <Plus className="w-6 h-6 text-[#00a884]" />
            </div>
            <span className="text-xs text-[#54656f]">{uploading ? 'Uploading...' : 'Add Story'}</span>
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
          </button>

          {stories.map((group, index) => {
            const hasUnviewed = group.stories?.some(
              (s) => !s.viewedBy?.some((v) => (v.userId?._id || v.userId)?.toString() === user?._id?.toString())
            );
            return (
              <button
                key={group.user?._id}
                onClick={() => setViewerIndex(index)}
                className="flex flex-col items-center gap-2 flex-shrink-0"
              >
                <div
                  className={`p-0.5 rounded-full ${
                    hasUnviewed ? 'bg-gradient-to-tr from-[#00a884] to-[#25d366]' : 'bg-gray-300'
                  }`}
                >
                  <div className="bg-white p-0.5 rounded-full">
                    <Avatar src={group.user?.profilePic} name={group.user?.fullName} size="lg" />
                  </div>
                </div>
                <span className="text-xs text-[#54656f] max-w-[64px] truncate">
                  {group.user?._id === user?._id ? 'Your story' : group.user?.fullName?.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {stories.length === 0 && !ownStories && (
        <div className="flex-1 flex items-center justify-center text-[#667781]">
          <p>No stories yet. Upload one or wait for friends!</p>
        </div>
      )}

      {viewerIndex !== null && stories[viewerIndex] && (
        <StoryViewer
          storyGroup={stories[viewerIndex]}
          onClose={() => setViewerIndex(null)}
          onNext={() => {
            if (viewerIndex < stories.length - 1) setViewerIndex(viewerIndex + 1);
            else setViewerIndex(null);
          }}
          onPrev={() => {
            if (viewerIndex > 0) setViewerIndex(viewerIndex - 1);
          }}
        />
      )}
    </div>
  );
};

export default StoriesPanel;
