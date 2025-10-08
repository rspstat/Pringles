const API_BASE_URL = 'http://localhost:8000/api';

export const sendMessage = async (message, conversationId = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId
      })
    });
    
    if (!response.ok) {
      throw new Error('API 요청 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API 에러:', error);
    throw error;
  }
};

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('파일 업로드 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('파일 업로드 에러:', error);
    throw error;
  }
};