import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-brutal-red',
    info: 'bg-blue-500',
    warning: 'bg-white text-black',
  }[type];

  return (
    <div className={`brutal-card ${bgColor} fixed bottom-4 right-4 z-50 flex items-center gap-2`}>
      <span>{message}</span>
      <button onClick={onClose} className="p-1 hover:opacity-80">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default Toast;
