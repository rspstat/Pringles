# from openai import OpenAI
# from app.config import settings

# client = OpenAI(api_key=settings.OPENAI_API_KEY)

# def get_ai_response(user_message: str, conversation_history: list = None) -> str:
#     """OpenAI API로 응답 생성"""
#     try:
#         messages = [
#             {
#                 "role": "system",
#                 "content": "당신은 하드웨어 회로 설계 및 분석 전문가입니다. "
#                           "회로도, 전자 부품, 회로 분석에 대한 질문에 명확하게 답변해주세요."
#             }
#         ]
        
#         if conversation_history:
#             messages.extend(conversation_history[-10:])
        
#         messages.append({"role": "user", "content": user_message})
        
#         response = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=messages,
#             temperature=0.7,
#             max_tokens=1000
#         )
        
#         return response.choices[0].message.content
        
#     except Exception as e:
#         print(f"OpenAI API 에러: {e}")
#         return "응답 생성 중 오류가 발생했습니다."