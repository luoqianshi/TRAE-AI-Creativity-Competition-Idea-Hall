import { useEffect, useState } from 'react';
import { IconClose } from './Icons';

export default function Modal({ isOpen, onClose, title, children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-lg bg-white rounded-t-3xl p-6 safe-bottom transition-transform duration-350 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="tap-active p-1 rounded-xl hover:bg-gray-100">
            <IconClose size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
