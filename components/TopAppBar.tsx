
import React from 'react';

interface TopAppBarProps {
  title: string;
  onBack?: () => void;
  onAction?: () => void;
  actionText?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title, onBack, onAction, actionText }) => {
  return (
    <header className="sticky top-0 z-50 flex items-center bg-white dark:bg-surface-dark px-4 py-3 justify-between border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex items-center flex-1">
        {onBack && (
          <button 
            onClick={onBack}
            className="text-primary hover:bg-primary/10 rounded-full p-2 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back_ios_new</span>
          </button>
        )}
      </div>
      <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center truncate">
        {title}
      </h2>
      <div className="flex items-center justify-end flex-1">
        {onAction && (
          <button 
            onClick={onAction}
            className="flex items-center p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 group transition-colors"
          >
            <p className="text-red-600 dark:text-red-400 text-base font-bold leading-normal">{actionText || 'Cancelar'}</p>
          </button>
        )}
      </div>
    </header>
  );
};
