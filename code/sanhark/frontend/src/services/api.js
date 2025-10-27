const API_BASE_URL = 'http://localhost:8000/api';

// 채팅방 생성
export const createChatRoom = async (name, description = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description })
    });
    
    if (!response.ok) {
      throw new Error('채팅방 생성 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('채팅방 생성 에러:', error);
    throw error;
  }
};

// 채팅방 목록 조회
export const getChatRooms = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/rooms`);
    
    if (!response.ok) {
      throw new Error('채팅방 목록 조회 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('채팅방 목록 조회 에러:', error);
    throw error;
  }
};

// 메시지 전송
export const sendMessage = async (roomId, message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_id: roomId,
        message
      })
    });
    
    if (!response.ok) {
      throw new Error('메시지 전송 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('메시지 전송 에러:', error);
    throw error;
  }
};

// 메시지 조회
export const getMessages = async (roomId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/messages/${roomId}`);
    
    if (!response.ok) {
      throw new Error('메시지 조회 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('메시지 조회 에러:', error);
    throw error;
  }
};

// 파일 업로드
export const uploadFile = async (roomId, file) => {
  try {
    const formData = new FormData();
    formData.append('room_id', roomId);
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

// 채팅방의 파일 목록 조회
export const getRoomFiles = async (roomId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/upload/room/${roomId}`);
    
    if (!response.ok) {
      throw new Error('파일 목록 조회 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('파일 목록 조회 에러:', error);
    throw error;
  }
};

// 채팅방 삭제
export const deleteChatRoom = async (roomId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('채팅방 삭제 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('채팅방 삭제 에러:', error);
    throw error;
  }
};

// 채팅방 이름 업데이트
export const updateChatRoomName = async (roomId, name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name })
    });
    
    if (!response.ok) {
      throw new Error('채팅방 이름 업데이트 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('채팅방 이름 업데이트 에러:', error);
    throw error;
  }
};