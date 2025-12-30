import React from 'react';

interface GodModeWelcomeProps {
  onClose: () => void;
}

const GodModeWelcome: React.FC<GodModeWelcomeProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border-2 border-red-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <i className="fa-solid fa-bolt-lightning text-red-400 text-3xl animate-pulse"></i>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-3">
          God Mode активирован!
        </h2>
        
        <div className="text-slate-300 mb-6 space-y-3 leading-relaxed">
          <p className="text-center">
            Теперь у тебя есть полный контроль над игрой:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-arrows-up-down-left-right text-emerald-400 mt-1"></i>
              <span>Перетаскивай плитки для перемещения</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-right-left text-blue-400 mt-1"></i>
              <span>Перетаскивай на другую плитку для обмена</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-plus text-emerald-400 mt-1"></i>
              <span>Тапни на пустую ячейку дважды, чтобы добавить плитку</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-trash-can text-red-400 mt-1"></i>
              <span>Кликни на плитку, чтобы удалить её</span>
            </li>
          </ul>
        </div>
        
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95"
        >
          Понятно
        </button>
      </div>
    </div>
  );
};

export default GodModeWelcome;

