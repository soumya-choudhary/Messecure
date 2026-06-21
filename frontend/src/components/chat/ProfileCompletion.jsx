import { X, CheckCircle, AlertCircle } from 'lucide-react';

const ProfileCompletion = ({ completion, onUpdateClick }) => {
  if (completion >= 100) return null;

  const getCompletionColor = () => {
    if (completion >= 80) return 'bg-green-500';
    if (completion >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getCompletionMessage = () => {
    if (completion >= 80) return "You're almost there!";
    if (completion >= 50) return "You're making good progress!";
    return "Complete your profile to unlock more features";
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {completion >= 80 ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-orange-500" />
          )}
          <h3 className="font-semibold text-gray-900">Profile Completion</h3>
        </div>
        <button
          onClick={() => {/* Close functionality can be added */}}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">{getCompletionMessage()}</p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-700 font-medium">{completion}% Complete</span>
          <span className="text-gray-500">{100 - completion}% remaining</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getCompletionColor()} transition-all duration-500 rounded-full`}
            style={{ width: `${completion}%` }}
          ></div>
        </div>
      </div>

      {/* Missing Fields Hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
        <p className="text-xs text-blue-800 mb-2 font-medium">Complete these to reach 100%:</p>
        <ul className="text-xs text-blue-700 space-y-1">
          {completion < 100 && <li>• Add a profile picture</li>}
          {completion < 100 && <li>• Write a bio</li>}
        </ul>
      </div>

      {/* Update Button */}
      <button
        onClick={onUpdateClick}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
      >
        Update Profile
      </button>
    </div>
  );
};

export default ProfileCompletion;

