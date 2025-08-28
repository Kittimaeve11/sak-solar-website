'use client';  // บังคับให้เป็น Client Component

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-center"
      toastStyle={{
        margin: 'auto',
        minWidth: '300px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '1.1rem'
      }}
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed',
        zIndex: 9999,
      }}
    />
  );
}
