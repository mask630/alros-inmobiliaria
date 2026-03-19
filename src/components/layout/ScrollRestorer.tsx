'use client';

import { useEffect } from 'react';

export function ScrollRestorer() {
  useEffect(() => {
    const unlock = () => {
      // Direct style fixes
      document.body.style.overflow = 'auto';
      document.body.style.overflowY = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.overflowY = 'auto';
      
      // Class removal
      document.body.classList.remove('antigravity-scroll-lock');
      
      // Cleanup of injected style tags
      const lockStyle = document.getElementById('antigravity-scroll-lock-style');
      if (lockStyle) lockStyle.remove();
      
      // Ensure vertical scrollbar has a width if it was hidden
      document.body.style.scrollbarWidth = 'auto';
      
      // Removing any style attribute that might contain overflow: hidden
      if (document.body.style.overflow === 'hidden') {
          document.body.style.setProperty('overflow', 'auto', 'important');
      }
    };

    unlock();
    
    // Check every second to prevent any dynamic lock-in
    const interval = setInterval(unlock, 1000);
    
    // Also run on scroll attempt or click
    window.addEventListener('scroll', unlock, { passive: true });
    window.addEventListener('click', unlock);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', unlock);
      window.removeEventListener('click', unlock);
    };
  }, []);

  return null;
}
