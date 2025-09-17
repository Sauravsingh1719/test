'use client';
import { useEffect } from 'react';
import { useFullScreen } from '@/hooks/useFullScreen';

interface FullScreenWrapperProps {
  children: React.ReactNode;
  isFullScreen?: boolean;
}

export default function FullScreenWrapper({ 
  children, 
  isFullScreen = true 
}: FullScreenWrapperProps) {
  useFullScreen(isFullScreen);

  return (
    <div className={isFullScreen ? "h-screen w-screen bg-gray-100 overflow-hidden" : ""}>
      {children}
    </div>
  );
}