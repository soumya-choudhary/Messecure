const Avatar = ({ src, name = 'U', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initial = (name || 'U').charAt(0).toUpperCase();

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold overflow-hidden flex-shrink-0 bg-[#dfe5e7] text-[#54656f] ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
};

export default Avatar;
