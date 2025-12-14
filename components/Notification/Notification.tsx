import { useEffect } from 'react';
import { XIcon, CheckCircleIcon } from '../Icons/Icons';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification = ({ message, type, onClose }: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircleIcon : XIcon;

  return (
    <div className={`fixed top-4 right-4 sm:top-5 sm:right-5 z-50 flex items-center p-3 sm:p-4 rounded-lg shadow-lg text-white ${bgColor} animate-fade-in-down max-w-xs sm:max-w-sm`}>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0" />
      <span className="text-xs sm:text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="ml-2 sm:ml-4 -mr-1 sm:-mr-2 p-1 rounded-full hover:bg-black/20 transition-colors flex-shrink-0" aria-label="Close">
        <XIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

export default Notification;
