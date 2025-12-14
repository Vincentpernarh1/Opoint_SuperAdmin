import React from 'react';
import './ConfirmationModal.scss';

interface ConfirmationModalProps {
  isVisible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  theme: 'light' | 'dark';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isVisible,
  message,
  onConfirm,
  onCancel,
  theme
}) => {
  if (!isVisible) return null;

  return (
    <div className={`confirmation-modal-overlay ${theme}`}>
      <div className="confirmation-modal-card">
        <div className="modal-header">
          <h3>Confirm Action</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn confirm-btn" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;