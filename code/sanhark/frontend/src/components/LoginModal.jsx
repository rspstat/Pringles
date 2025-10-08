import React from 'react';
import { X } from 'lucide-react';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    // TODO: 구글 로그인 로직 (백엔드 연동)
    console.log('구글 로그인');
    alert('구글 로그인 기능은 백엔드 연동 후 작동합니다.');
  };

  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 로직 (백엔드 연동)
    console.log('카카오 로그인');
    alert('카카오 로그인 기능은 백엔드 연동 후 작동합니다.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-header">
          <h2>로그인</h2>
          <p>소셜 계정으로 간편하게 로그인하세요</p>
        </div>

        <div className="login-buttons">
          <button className="login-button google" onClick={handleGoogleLogin}>
            <svg className="login-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google로 계속하기</span>
          </button>

          <button className="login-button kakao" onClick={handleKakaoLogin}>
            <svg className="login-icon" viewBox="0 0 24 24">
              <path fill="#000000" d="M12 3C6.48 3 2 6.48 2 10.85c0 2.8 1.83 5.26 4.58 6.65-.2.73-.77 2.88-.89 3.34-.14.55.2.54.42.39.18-.12 2.88-1.95 3.34-2.27.54.07 1.09.11 1.65.11 5.52 0 10-3.48 10-7.85S17.52 3 12 3z"/>
            </svg>
            <span>카카오로 계속하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}