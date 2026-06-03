import base64
import hashlib
import hmac
import json
import time
import os
from django.conf import settings
from datetime import datetime, time as dt_time, timedelta

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

    @staticmethod
    def is_within_shift_login_window(shift_time_str: str, current_dt) -> bool:
        """
        Validates if the current_dt is within the allowed shift login window:
        - Day/Standard Shift: starts at shift start (minus 15 mins buffer) up to shift end + 2 hours.
        - Night Shift: starts at shift start (minus 15 mins buffer) up to shift end + 2 hours (spans midnight).
        """
        parts = shift_time_str.split('-')
        if len(parts) != 2:
            return True
        
        try:
            start_t = datetime.strptime(parts[0].strip(), "%I:%M %p").time()
            end_t = datetime.strptime(parts[1].strip(), "%I:%M %p").time()
        except ValueError:
            return True
            
        # 24-hour shift check: bypass window limits if shift covers the full day
        if start_t == end_t or (start_t.hour == 0 and start_t.minute == 0 and end_t.hour == 23 and end_t.minute == 59):
            return True
            
        current_time = current_dt.time()
        
        # Check if night shift (spans midnight)
        is_night_shift = start_t >= end_t
        
        # Buffer: 15 minutes before shift starts
        start_buffer_minutes = (start_t.hour * 60 + start_t.minute - 15) % 1440
        start_buffer_time = dt_time(start_buffer_minutes // 60, start_buffer_minutes % 60)
        
        # End limit: 2 hours after shift ends
        end_limit_minutes = (end_t.hour * 60 + end_t.minute + 120) % 1440
        end_limit_time = dt_time(end_limit_minutes // 60, end_limit_minutes % 60)
        
        if is_night_shift:
            if start_buffer_time > end_limit_time:
                return current_time >= start_buffer_time or current_time <= end_limit_time
            else:
                return start_buffer_time <= current_time <= end_limit_time
        else:
            if start_buffer_time > end_limit_time:
                return current_time >= start_buffer_time or current_time <= end_limit_time
            else:
                return start_buffer_time <= current_time <= end_limit_time

    @staticmethod
    def is_token_valid_for_shift(shift_time_str: str, iat_timestamp: int, current_dt) -> bool:
        """
        Validates if the token issued at iat_timestamp was generated within the
        current active shift cycle of the employee, enforcing logouts after shift + 2 hours.
        """
        parts = shift_time_str.split('-')
        if len(parts) != 2:
            return True
        
        try:
            start_t = datetime.strptime(parts[0].strip(), "%I:%M %p").time()
            end_t = datetime.strptime(parts[1].strip(), "%I:%M %p").time()
        except ValueError:
            return True

        # 24-hour shift check: bypass window limits if shift covers the full day
        if start_t == end_t or (start_t.hour == 0 and start_t.minute == 0 and end_t.hour == 23 and end_t.minute == 59):
            return True

        is_night_shift = start_t >= end_t
        current_time = current_dt.time()
        current_date = current_dt.date()
        
        start_buffer_minutes = (start_t.hour * 60 + start_t.minute - 15) % 1440
        start_buffer_time = dt_time(start_buffer_minutes // 60, start_buffer_minutes % 60)
        
        end_limit_minutes = (end_t.hour * 60 + end_t.minute + 120) % 1440
        end_limit_time = dt_time(end_limit_minutes // 60, end_limit_minutes % 60)
        
        if is_night_shift:
            if start_buffer_time > end_limit_time:
                is_inside_window = current_time >= start_buffer_time or current_time <= end_limit_time
            else:
                is_inside_window = start_buffer_time <= current_time <= end_limit_time
                
            if not is_inside_window:
                return False
                
            # Compute when the current active night shift session started
            if current_time <= end_limit_time:
                # Shift session started yesterday
                shift_start_dt = datetime.combine(current_date - timedelta(days=1), start_buffer_time, tzinfo=current_dt.tzinfo)
            else:
                # Shift session started today
                shift_start_dt = datetime.combine(current_date, start_buffer_time, tzinfo=current_dt.tzinfo)
                
            token_issue_dt = datetime.fromtimestamp(iat_timestamp, current_dt.tzinfo)
            return token_issue_dt >= shift_start_dt
        else:
            if start_buffer_time > end_limit_time:
                is_inside_window = current_time >= start_buffer_time or current_time <= end_limit_time
            else:
                is_inside_window = start_buffer_time <= current_time <= end_limit_time
                
            if not is_inside_window:
                return False
                
            shift_start_dt = datetime.combine(current_date, start_buffer_time, tzinfo=current_dt.tzinfo)
            token_issue_dt = datetime.fromtimestamp(iat_timestamp, current_dt.tzinfo)
            return token_issue_dt >= shift_start_dt

