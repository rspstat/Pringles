import React, { useState } from 'react';
import { MessageSquare, Search, Library, Code, Zap, Menu, Send, Mic, Paperclip } from 'lucide-react';
import './CircuitAnalysisChatbot.css';

export default function CircuitAnalysisChatbot() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { text: inputValue, sender: 'user' }]);
      setInputValue('');
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: '회로 분석을 도와드리겠습니다. 어떤 회로에 대해 질문하시나요?', 
          sender: 'ai' 
        }]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {/* 사이드바 */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Zap className="logo-icon" />
            <span className="logo-text">Circuit AI</span>
          </div>
        </div>
        
        <div className="sidebar-menu">
          <button className="menu-item">
            <MessageSquare className="menu-icon" />
            <span>새 채팅</span>
          </button>
          
          <button className="menu-item">
            <Search className="menu-icon" />
            <span>채팅 검색</span>
          </button>
          
          <button className="menu-item">
            <Library className="menu-icon" />
            <span>라이브러리</span>
          </button>
          
          <button className="menu-item">
            <Code className="menu-icon" />
            <span>코드</span>
          </button>
          
          <button className="menu-item">
            <Zap className="menu-icon" />
            <span>프로젝트</span>
          </button>
          
          <div className="menu-divider">
            <button className="menu-item-small">
              <span>HCA</span>
              <span className="arrow">›</span>
            </button>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">HG</div>
            <div className="user-info">
              <div className="user-name">Hong gildong</div>
              <div className="user-plan">Plus</div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {/* 헤더 */}
        <div className="header">
          <div className="header-left">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="header-button"
            >
              <Menu size={20} />
            </button>
            <button className="header-button">
              <MessageSquare size={20} />
            </button>
            <div className="header-title">
              <span className="title-text">Circuit AI</span>
              <span className="title-version">1.0</span>
              <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <button className="header-button">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        {/* 채팅 영역 */}
        <div className="chat-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <h1 className="welcome-text">무슨 작업을 하고 계세요?</h1>
            </div>
          ) : (
            <div className="messages-container">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.sender}`}>
                  <div className="message-bubble">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div className="input-area">
          <div className="input-wrapper">
            <div className="input-container">
              <button className="input-button left">
                <Paperclip size={20} />
              </button>
              
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="무엇이든 물어보세요"
                className="text-input"
              />
              
              <div className="input-actions">
                <button className="input-button">
                  <Mic size={20} />
                </button>
                <button className="input-button">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </button>
                {inputValue.trim() && (
                  <button 
                    onClick={handleSendMessage}
                    className="send-button"
                  >
                    <Send size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}