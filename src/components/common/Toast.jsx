import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

export const showToast = (message, type = 'success') => {
  const options = {
    duration: 3000,
    position: 'top-right',
    style: {
      borderRadius: '12px',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '600',
    },
  };

  if (type === 'success') {
    toast.success(message, options);
  } else if (type === 'error') {
    toast.error(message, options);
  } else {
    toast(message, options);
  }
};

const Toast = () => {
  return (
    <Toaster
      toastOptions={{
        success: {
          icon: '✅',
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
          },
        },
        error: {
          icon: '❌',
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
          },
        },
      }}
    />
  );
};

export default Toast;