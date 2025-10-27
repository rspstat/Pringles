import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Library, Code, Zap, Menu, Send, Mic, Paperclip, ChevronRight, ChevronDown } from 'lucide-react';
import './CircuitAnalysisChatbot.css';
import LoginModal from './LoginModal';
import FileUpload from './FileUpload';
import ChatHistory from './ChatHistory';
import { createChatRoom, getChatRooms, sendMessage, getMessages, deleteChatRoom, updateChatRoomName } from '../services/api';

export default function CircuitAnalysisChatbot() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);

  const [showChatHistory, setShowChatHistory] = useState(() => {
  const saved = localStorage.getItem('showChatHistory');
    return saved !== null ? JSON.parse(saved) : true; // 기본값 true
  });
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    try {
      const response = await getChatRooms();
      if (response.success) {
        const formattedChats = response.data.map(room => ({
          id: room.id,
          title: room.name || '새 채팅',  // 빈 문자열이면 "새 채팅" 표시
          preview: room.description || '',
          createdAt: room.created_at,
          messages: []
        }));
        setChatHistory(formattedChats);
      }
    } catch (error) {
      console.error('채팅방 목록 로드 실패:', error);
    }
  };

  // 메시지 변경 시 채팅 목록 업데이트
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages, preview: messages[0]?.text.slice(0, 50) || '' }
            : chat
        )
      );
    }
  }, [messages, currentChatId]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentChatId) return;
    
    const userMessage = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    
    try {
      const response = await sendMessage(currentChatId, userMessage);
      if (response.success) {
        setMessages(prev => [...prev, { text: response.response, sender: 'ai' }]);
        
        // 첫 메시지일 때 채팅방 이름 업데이트
        if (messages.length === 0) {
          const newTitle = userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '');
          
          // DB에 업데이트
          await updateChatRoomName(currentChatId, newTitle);
          
          // UI 업데이트
          setChatHistory(prev => 
            prev.map(chat => 
              chat.id === currentChatId 
                ? { ...chat, title: newTitle, preview: userMessage.slice(0, 50) }
                : chat
            )
          );
        }
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectChat = async (chatId) => {
    setCurrentChatId(chatId);
    
    try {
      const response = await getMessages(chatId);
      if (response.success) {
        const formattedMessages = response.data.map(msg => ({
          text: msg.content,
          sender: msg.role === 'user' ? 'user' : 'ai'
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await deleteChatRoom(chatId);
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('채팅방 삭제 실패:', error);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await createChatRoom('', '');  // 빈 문자열로 생성
      
      if (response.success) {
        const newChat = {
          id: response.data.id,
          title: '새 채팅',  // UI에만 표시
          preview: '',
          createdAt: response.data.created_at,
          messages: []
        };
        
        setChatHistory(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        setMessages([]);
        setShowChatHistory(true);
      }
    } catch (error) {
      console.error('새 채팅 생성 실패:', error);
    }
  };

  // 리사이저 관련 함수 추가
  const startResizing = React.useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth >= 200 && newWidth <= 500) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div className={`chatbot-container ${isResizing ? 'resizing' : ''}`}>
      {/* 사이드바 */}
      <div 
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        style={{ width: sidebarOpen ? `${sidebarWidth}px` : '0' }}
      >
        <div className="sidebar-header">
          <div className="logo">
            <Zap className="logo-icon" />
            <span className="logo-text">Circuit AI</span>
          </div>
        </div>
        
        <div className="sidebar-menu">
          <button className="menu-item" onClick={handleNewChat}>
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
            <span>Codex</span>
          </button>
          
          <button className="menu-item">
            <Zap className="menu-icon" />
            <span>프로젝트</span>
          </button>
          
          <div className="menu-divider">
            <button 
              className="menu-item-small hca-button"
              onClick={() => setShowChatHistory(!showChatHistory)}
            >
              <span>HCA</span>
              {showChatHistory ? (
                <ChevronDown className="ml-auto" size={16} />
              ) : (
                <ChevronRight className="ml-auto" size={16} />
              )}
            </button>
            
            {/* 채팅 히스토리 표시 */}
            {showChatHistory && (
              <div className="chat-history-container">
                <ChatHistory
                  chats={chatHistory}
                  onSelectChat={handleSelectChat}
                  onDeleteChat={handleDeleteChat}
                  currentChatId={currentChatId}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="sidebar-footer">
          <div 
            className="user-profile"
            onClick={() => setLoginModalOpen(true)}
          >
            <div className="user-avatar">HG</div>
            <div className="user-info">
              <div className="user-name">Hong gildong</div>
              <div className="user-plan">Plus</div>
            </div>
          </div>
        </div>
      </div>

      {/* 리사이저 - 사이드바 밖에 위치! */}
      {sidebarOpen && (
        <div
          className="sidebar-resizer"
          onMouseDown={startResizing}
        />
      )}

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
              <h1 className="welcome-text">도움이 필요하신가요?</h1>
              
              {/* 파일 업로드 추가 */}
              <FileUpload 
                onUploadComplete={(results) => {
                  console.log('업로드 완료:', results);
                }}
              />
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

      {/* 로그인 모달 */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
    </div>
  );
}