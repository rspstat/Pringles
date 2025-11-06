import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

def get_ai_response(user_message: str, conversation_history: list = None) -> str:
    """Gemini API로 응답 생성 (일반)"""
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        context = ""
        
        if conversation_history:
            for msg in conversation_history[-10:]:
                role = "사용자" if msg["role"] == "user" else "AI"
                context += f"{role}: {msg['content']}\n"
        
        context += f"사용자: {user_message}\nAI:"
        
        response = model.generate_content(context)
        return response.text
        
    except Exception as e:
        print(f"Gemini API 에러: {e}")
        return "응답 생성 중 오류가 발생했습니다."

def get_ai_response_stream(user_message: str, conversation_history: list = None):
    """Gemini API 스트리밍 응답"""
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        context = ""
        
        if conversation_history:
            for msg in conversation_history[-10:]:
                role = "사용자" if msg["role"] == "user" else "AI"
                context += f"{role}: {msg['content']}\n"
        
        context += f"사용자: {user_message}\nAI:"
        
        response = model.generate_content(context, stream=True)
        
        for chunk in response:
            if chunk.text:
                yield chunk.text
        
    except Exception as e:
        print(f"Gemini API 에러: {e}")
        yield "응답 생성 중 오류가 발생했습니다."