import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const CustomPhoneInput = ({ value, onChange, placeholder = 'Phone Number', ...props }) => {
  const PhoneInputComponent = PhoneInput.default || PhoneInput;

  return (
    <div className="custom-phone-input-wrapper w-full">
      <PhoneInputComponent
        country={'in'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        enableSearch={true}
        inputStyle={{
          width: '100%',
          height: '38px',
          fontSize: '0.875rem',
          color: '#0f172a',
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          outline: 'none',
          paddingLeft: '48px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
        buttonStyle={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRight: 'none',
          borderTopLeftRadius: '0.5rem',
          borderBottomLeftRadius: '0.5rem',
          width: '40px',
        }}
        containerStyle={{
          width: '100%',
        }}
        dropdownStyle={{
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          width: '260px',
          zIndex: 9999,
        }}
        {...props}
      />
    </div>
  );
};

export default CustomPhoneInput;
