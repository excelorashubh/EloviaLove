import { useEffect, useState } from 'react';

const COUNTRY_OPTIONS = [
  { label: 'India', value: '+91', emoji: '🇮🇳' },
  { label: 'United States', value: '+1', emoji: '🇺🇸' },
  { label: 'United Kingdom', value: '+44', emoji: '🇬🇧' },
  { label: 'Australia', value: '+61', emoji: '🇦🇺' },
  { label: 'Canada', value: '+1', emoji: '🇨🇦' },
  { label: 'Germany', value: '+49', emoji: '🇩🇪' },
];

const formatLabel = ({ emoji, label, value }) => `${emoji} ${label} (${value})`;

export default function PhoneInput({ countryCode, phoneNumber, onChange, error }) {
  const [selectedCountry, setSelectedCountry] = useState(countryCode || '+91');
  const [localNumber, setLocalNumber] = useState(phoneNumber || '');

  useEffect(() => {
    if (countryCode) setSelectedCountry(countryCode);
  }, [countryCode]);

  useEffect(() => {
    if (phoneNumber) setLocalNumber(phoneNumber);
  }, [phoneNumber]);

  const handleCountryChange = (event) => {
    const nextCode = event.target.value;
    setSelectedCountry(nextCode);
    onChange({ countryCode: nextCode, phoneNumber: localNumber });
  };

  const handleNumberChange = (event) => {
    const cleaned = event.target.value.replace(/[^0-9 ]/g, '');
    setLocalNumber(cleaned);
    onChange({ countryCode: selectedCountry, phoneNumber: cleaned });
  };

  return (
    <div className="space-y-2">
      <label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number</label>
      <div className="flex gap-3">
        <select
          value={selectedCountry}
          onChange={handleCountryChange}
          className="w-36 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
        >
          {COUNTRY_OPTIONS.map((option) => (
            <option key={option.value + option.label} value={option.value}>
              {formatLabel(option)}
            </option>
          ))}
        </select>
        <input
          id="phone"
          type="tel"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder="98765 43210"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
        />
      </div>
      <p className="text-xs text-slate-400">Include your country code prefix and digits only.</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
