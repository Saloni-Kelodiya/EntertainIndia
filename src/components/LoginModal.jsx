// app/components/LoginModal.jsx
'use client';

import { useEffect } from 'react';
import LoginPage from '../page-components/LoginPage';
import { useStore } from '../store/useStore';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useStore();

  useEffect(() => {
    if (isLoginModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleLoginSuccess = (user, token) => {
  login(user, token);
  closeLoginModal();
};


  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={closeLoginModal}
      />
      
      <div className="relative  dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-4">
        <LoginPage 
          isModal={true}
          onClose={closeLoginModal}
          onSuccess={handleLoginSuccess}
        />
      </div>
    </div>
  );
}