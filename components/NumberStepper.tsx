
import React from 'react';

interface NumberStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  label?: string;
  sublabel?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({ 
  value, onChange, min = 0, max, label, sublabel 
}) => {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };
  const handleIncrement = () => {
    if (max === undefined || value < max) onChange(value + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      if (max !== undefined && val > max) onChange(max);
      else if (val < min) onChange(min);
      else onChange(val);
    } else if (e.target.value === '') {
      onChange(0);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 gap-4">
      {(label || sublabel) && (
        <div className="flex flex-col flex-1">
          {label && <p className="text-slate-900 dark:text-white text-base font-medium">{label}</p>}
          {sublabel && <p className="text-slate-500 dark:text-slate-400 text-xs">{sublabel}</p>}
        </div>
      )}
      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
        <button 
          type="button"
          onClick={handleDecrement}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-slate-700 shadow-sm text-slate-600 dark:text-slate-200 hover:text-primary active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-sm font-bold">remove</span>
        </button>
        <input 
          className="w-12 p-0 text-center bg-transparent border-none text-slate-900 dark:text-white font-bold text-lg focus:ring-0" 
          type="number" 
          value={value}
          onChange={handleInputChange}
        />
        <button 
          type="button"
          onClick={handleIncrement}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-white dark:bg-slate-700 shadow-sm text-slate-600 dark:text-slate-200 hover:text-primary active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
        </button>
      </div>
    </div>
  );
};
