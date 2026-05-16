'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface VideoContextType {
  videoUrl: string;
  setVideoUrl: (url: string) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [videoUrl, setVideoUrl] = useState('');

  return (
    <VideoContext.Provider value={{ videoUrl, setVideoUrl }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within VideoProvider');
  }
  return context;
}
