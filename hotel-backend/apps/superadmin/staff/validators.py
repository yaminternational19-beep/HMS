import re
from rest_framework.exceptions import ValidationError

class StaffValidator:
    @staticmethod
    def validate_onboard_data(data, is_update=False, current_instance=None):
        errors = {}
        
        # 1. Full Name
        name = data.get('name', '').strip()
        if not name and not is_update:
            errors['name'] = "Full Name is required."
        elif name and len(name) < 2:
            errors['name'] = "Name must be at least 2 characters long."
            
        # 2. Roster Role (dept)
        dept = data.get('dept', '').strip()
        if not dept and not is_update:
            errors['dept'] = "Roster Title Role is required."
            
        # 3. Operational HMS Password rules
        # Matches if the role is front office, maintenance, concierge, etc. (contains 'front' or 'maintain')
        is_operational = False
        role_check = dept.lower() if dept else ''
        if not role_check and current_instance:
            role_check = current_instance.dept.lower()
            
        if 'front' in role_check or 'maintain' in role_check:
            is_operational = True
            
        password = data.get('password', '')
        if is_operational:
            if not password and not is_update:
                errors['password'] = "HMS Operation Password is required for Front Office and Maintenance roles."
            elif password and len(password) < 4:
                errors['password'] = "HMS Operation Password must be at least 4 characters long."
                
        # 4. Optional Email Address format
        email = data.get('email', '')
        if email:
            email = email.strip()
            email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
            if not re.match(email_regex, email):
                errors['email'] = "Please provide a valid email address."
                
        # 5. Contact phone numbers (mandatory)
        phone_no = data.get('phoneNo', '').strip()
        if not phone_no and not is_update:
            errors['phone'] = "Contact phone number is required."
            
        emergency_no = data.get('emergencyNo', '').strip()
        if not emergency_no and not is_update:
            errors['emergencyPhone'] = "Emergency contact phone is required."
            
        # 6. Shift schedules (mandatory)
        shift_id = data.get('shift_id', '')
        if not shift_id and not is_update:
            errors['shiftId'] = "Roster Shift selection is required."
            
        # 7. Verification details
        address = data.get('address', '').strip()
        if not address and not is_update:
            errors['address'] = "Physical Address is required."
            
        govt_proof_id = data.get('govtProofId', '').strip()
        if not govt_proof_id and not is_update:
            errors['govtProofId'] = "Government ID proof number is required."

        if errors:
            raise ValidationError(errors)
            
        return data
