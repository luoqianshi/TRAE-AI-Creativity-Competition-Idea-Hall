import { useEffect, useRef, useState } from 'react';

export default function AnimatedPage({ children, type = 'fade' }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    return () => setVisible(false);
  }, []);

  const transitions = {
    fade: {
      enter: 'opacity-0',
      active: 'opacity-100 transition-opacity duration-300 ease-out',
    },
    slideRight: {
      enter: 'opacity-0 translate-x-8',
      active: 'opacity-100 translate-x-0 transition-all duration-300 ease-out',
    },
    slideUp: {
      enter: 'opacity-0 translate-y-8',
      active: 'opacity-100 translate-y-0 transition-all duration-300 ease-out',
    },
    scale: {
      enter: 'opacity-0 scale-95',
      active: 'opacity-100 scale-100 transition-all duration-300 ease-out',
    },
  };

  const t = transitions[type] || transitions.fade;

  return (
    <div ref={ref} className={`${visible ? t.active : t.enter}`}>
      {children}
    </div>
  );
}
