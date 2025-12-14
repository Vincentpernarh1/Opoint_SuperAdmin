import React, { useEffect } from 'react';
import { XIcon, CheckCircleIcon } from '../Icons/Icons';
import './NotificationOverlay.scss';

interface NotificationOverlayProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  isVisible: boolean;
  theme?: 'light' | 'dark';
}

const NotificationOverlay = ({ message, type, onClose, isVisible, theme = 'light' }: NotificationOverlayProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const Icon = type === 'success' ? CheckCircleIcon : XIcon;

  return (
    <div className={`notification-overlay ${theme}`}>
      <div className="notification-overlay__backdrop" onClick={onClose} />
      <div className={`notification-overlay__card notification-overlay__card--${type}`}>
        <div className="notification-overlay__content">
          <Icon className="notification-overlay__icon" />
          <div className="notification-overlay__text">
            <h3 className="notification-overlay__title">
              {type === 'success' ? 'Success!' : 'Error!'}
            </h3>
            <p className="notification-overlay__message">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="notification-overlay__close-btn"
            aria-label="Close notification"
          >
            <XIcon className="notification-overlay__close-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationOverlay;