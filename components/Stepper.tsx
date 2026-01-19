
import React from 'react';

interface StepperProps {
  current: number;
  total: number;
}

export const Stepper: React.FC<StepperProps> = ({ current, total }) => {
  return (
    <div className="flex flex-col items-center justify-center pt-6 pb-2">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        Etapa {current + 1} de {total}
      </p>
      <div className="flex w-full flex-row items-center justify-center gap-3">
        {Array.from({ length: total }).map((_, i) => (
          <div 
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-primary' : 'w-2 bg-slate-300 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
