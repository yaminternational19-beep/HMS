import base64
import hashlib
import hmac
import json
import time
import os
from django.conf import settings

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def base64url_decode(data: str) -> bytes:
    # Add back base64 padding
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

class JWTService:
    SECRET_KEY = os.environ.get('JWT_SECRET', getattr(settings, 'SECRET_KEY', 'default_fallback_secret_key'))
    DEFAULT_EXPIRY = int(os.environ.get('JWT_EXPIRY_SECONDS', 86400))

    @classmethod
    def generate_token(cls, payload: dict, expires_in_seconds: int = None) -> str:
        """
        Generates a standard HS256 JWT Token with base64url encoding.
        """
        if expires_in_seconds is None:
            expires_in_seconds = cls.DEFAULT_EXPIRY

        header = {
            "alg": "HS256",
            "typ": "JWT"
        }
        
        payload_copy = payload.copy()
        payload_copy['exp'] = int(time.time()) + expires_in_seconds
        payload_copy['iat'] = int(time.time())
        
        header_b64 = base64url_encode(json.dumps(header).encode('utf-8'))
        payload_b64 = base64url_encode(json.dumps(payload_copy).encode('utf-8'))
        
        signature_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        signature = hmac.new(cls.SECRET_KEY.encode('utf-8'), signature_input, hashlib.sha256).digest()
        signature_b64 = base64url_encode(signature)
        
        return f"{header_b64}.{payload_b64}.{signature_b64}"

    @classmethod
    def decode_token(cls, token: str) -> dict:
        """
        Decodes and verifies an HS256 JWT Token.
        Raises ValueError if token is invalid or expired.
        """
        try:
            parts = token.split('.')
            if len(parts) != 3:
                raise ValueError("Invalid token format")
                
            header_b64, payload_b64, signature_b64 = parts
            
            # Verify signature integrity
            signature_input = f"{header_b64}.{payload_b64}".encode('utf-8')
            expected_signature = hmac.new(cls.SECRET_KEY.encode('utf-8'), signature_input, hashlib.sha256).digest()
            expected_signature_b64 = base64url_encode(expected_signature)
            
            if not hmac.compare_digest(signature_b64, expected_signature_b64):
                raise ValueError("Signature verification failed")
                
            # Decode payload
            payload_json = base64url_decode(payload_b64).decode('utf-8')
            payload = json.loads(payload_json)
            
            # Check expiration
            exp = payload.get('exp')
            if exp and int(time.time()) > exp:
                raise ValueError("Token has expired")
                
            return payload
        except Exception as e:
            if isinstance(e, ValueError):
                raise e
            raise ValueError(f"Token decoding failed: {str(e)}")
