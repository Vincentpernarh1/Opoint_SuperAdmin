import React from 'react';
import './Loading.scss';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  colors?: string[];
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

const Loading = ({
  size = 'medium',
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  message,
  className = '',
  fullScreen = false
}: LoadingProps) => {
  const containerClasses = [
    'loading-container',
    `loading-${size}`,
    fullScreen ? 'loading-fullscreen' : '',
    `loading-colors-${colors.length}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="loading-spinner">
        <div className="loading-segment loading-segment-0"></div>
        <div className="loading-segment loading-segment-1"></div>
        <div className="loading-segment loading-segment-2"></div>
        <div className="loading-segment loading-segment-3"></div>
        <div className="loading-segment loading-segment-4"></div>
      </div>
      {message && <div className="loading-message">{message}</div>}
    </div>
  );
};

export default Loading;