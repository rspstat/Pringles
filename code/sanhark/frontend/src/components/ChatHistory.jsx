import React from 'react';
import { MessageSquare, Trash2, Clock } from 'lucide-react';
import './ChatHistory.css';

export default function ChatHistory({ chats, onSelectChat, onDeleteChat, currentChatId }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '오늘';
    if (days === 1) return '어제';
    if (days < 7) return `${days}일 전`;
    if (days < 30) return `${Math.floor(days / 7)}주 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const groupChatsByDate = () => {
    const groups = {
      today: [],
      yesterday: [],
      week: [],
      month: [],
      older: []
    };

    chats.forEach(chat => {
      const date = new Date(chat.createdAt);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) groups.today.push(chat);
      else if (days === 1) groups.yesterday.push(chat);
      else if (days < 7) groups.week.push(chat);
      else if (days < 30) groups.month.push(chat);
      else groups.older.push(chat);
    });

    return groups;
  };

  const groups = groupChatsByDate();

  const renderChatGroup = (title, chatList) => {
    if (chatList.length === 0) return null;

    return (
      <div className="chat-group">
        <h3 className="chat-group-title">{title}</h3>
        {chatList.map(chat => (
          <div
            key={chat.id}
            className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <MessageSquare className="chat-icon" size={16} />
            <div className="chat-info">
              <span className="chat-title">{chat.title}</span>
              <span className="chat-preview">{chat.preview}</span>
            </div>
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="chat-history">
      {chats.length === 0 ? (
        <div className="empty-history">
          <Clock size={48} />
          <p>채팅 기록이 없습니다</p>
        </div>
      ) : (
        <>
          {renderChatGroup('오늘', groups.today)}
          {renderChatGroup('어제', groups.yesterday)}
          {renderChatGroup('이번 주', groups.week)}
          {renderChatGroup('이번 달', groups.month)}
          {renderChatGroup('이전', groups.older)}
        </>
      )}
    </div>
  );
}