import os
from fastapi import UploadFile, HTTPException
from app.config import settings

class FileValidator:
    @staticmethod
    def validate_file_size(file: UploadFile):
        """파일 크기 검증"""
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"파일 크기가 너무 큽니다. 최대 {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        return file_size
    
    @staticmethod
    def validate_file_extension(filename: str):
        """파일 확장자 검증"""
        extension = filename.split(".")[-1].lower()
        
        if extension not in settings.allowed_extensions_list:
            raise HTTPException(
                status_code=400,
                detail=f"지원하지 않는 파일 형식입니다. 허용: {', '.join(settings.allowed_extensions_list)}"
            )
        return extension
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """파일명 정리"""
        safe_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_."
        filename = "".join(c for c in filename if c in safe_chars)
        return filename if filename else "uploaded_file"
