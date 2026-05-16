'use client';

import React, { useRef, useEffect } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  onTimeUpdate?: (time: number) => void;
  seekTime?: number;
  height?: string;
  width?: string;
}

// Declare YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubePlayer({
  videoId,
  onTimeUpdate,
  seekTime,
  height = '400',
  width = '100%',
}: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const playerInstanceRef = useRef<any>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load YouTube API if not already loaded
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }

    // Wait for API to be ready
    const checkYTReady = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        setTimeout(checkYTReady, 100);
      }
    };

    checkYTReady();

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [videoId]);

  useEffect(() => {
    // Handle seeking when seekTime changes
    if (seekTime !== undefined && playerInstanceRef.current) {
      playerInstanceRef.current.seekTo(seekTime, true);
    }
  }, [seekTime]);

  const initPlayer = () => {
    if (playerInstanceRef.current) return; // Already initialized

    playerInstanceRef.current = new window.YT.Player(playerRef.current, {
      height,
      width,
      videoId,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerReady = () => {
    // Start tracking time updates
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    updateIntervalRef.current = setInterval(() => {
      if (playerInstanceRef.current && onTimeUpdate) {
        const currentTime = playerInstanceRef.current.getCurrentTime();
        onTimeUpdate(currentTime);
      }
    }, 500); // Update every 500ms
    // Attempt muted autoplay so browsers allow playback without user gesture
    try {
      if (playerInstanceRef.current && playerInstanceRef.current.playVideo) {
        // Mute first to satisfy autoplay policies, then play
        if (playerInstanceRef.current.isMuted && !playerInstanceRef.current.isMuted()) {
          playerInstanceRef.current.mute();
        } else {
          // ensure muted state
          playerInstanceRef.current.mute?.();
        }
        playerInstanceRef.current.playVideo?.();
      }
    } catch (err) {
      // ignore autoplay failures
    }
  };

  const onPlayerStateChange = (event: any) => {
    // Handle pause/play if needed
    if (event.data === window.YT.PlayerState.PLAYING) {
      if (!updateIntervalRef.current) {
        onPlayerReady();
      }
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 overflow-hidden">
      <div
        id="youtube-player"
        ref={playerRef}
        style={{
          width: '100%',
          height,
        }}
      />
    </div>
  );
}
