import React, { useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  onChange: (value: string) => void;
}

const Combobox: React.FC<Props> = ({ options, onChange }) => {
  const [selectedValue, setSelectedValue] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedValue(value);
    onChange(value);
  };

  return (
    <select value={selectedValue} onChange={handleChange}>
      <option value="" disabled>Select an option</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
};
export default Combobox;