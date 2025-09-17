
import { useEffect } from 'react';

export const useFullScreen = (isFullScreen: boolean) => {
  useEffect(() => {
    if (isFullScreen) {
      document.body.classList.add('full-screen-mode');
      document.documentElement.classList.add('full-screen-mode');
    } else {
      document.body.classList.remove('full-screen-mode');
      document.documentElement.classList.remove('full-screen-mode');
    }

    return () => {
      document.body.classList.remove('full-screen-mode');
      document.documentElement.classList.remove('full-screen-mode');
    };
  }, [isFullScreen]);
};