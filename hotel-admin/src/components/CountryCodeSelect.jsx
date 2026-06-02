import React from 'react';

export const COUNTRY_CODES = [
  { code: 'AE', name: 'UAE', prefix: '+971', flag: '🇦🇪' },
  { code: 'IN', name: 'India', prefix: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'USA', prefix: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'UK', prefix: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', prefix: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', prefix: '+61', flag: '🇦🇺' },
  { code: 'SG', name: 'Singapore', prefix: '+65', flag: '🇸🇬' },
  { code: 'DE', name: 'Germany', prefix: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', prefix: '+33', flag: '🇫🇷' },
  { code: 'SA', name: 'Saudi Arabia', prefix: '+966', flag: '🇸🇦' }
];

const CountryCodeSelect = ({ value, onChange, className = '' }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`form-select !w-[95px] min-w-[95px] shrink-0 font-mono text-xs cursor-pointer ${className}`}
    >
      {COUNTRY_CODES.map((c) => (
        <option key={`${c.code}-${c.prefix}`} value={c.prefix}>
          {c.flag} {c.prefix}
        </option>
      ))}
    </select>
  );
};

export default CountryCodeSelect;
