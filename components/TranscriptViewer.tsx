'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { TranscriptItem } from '@/lib/transcript';

interface TranscriptViewerProps {
  items: TranscriptItem[];
  currentTime?: number;
  onSeek?: (time: number) => void;
  isLoading?: boolean;
  language?: string;
}

export function TranscriptViewer({
  items,
  currentTime = 0,
  onSeek,
  isLoading = false,
  language = 'en',
}: TranscriptViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [userScrolling, setUserScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle manual scrolling - disable auto-scroll when user scrolls
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setUserScrolling(true);
      clearTimeout(scrollTimeoutRef.current);
      // Re-enable auto-scroll after 3 seconds of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setUserScrolling(false);
      }, 3000);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!items || items.length === 0) return;

    // Find the current transcript item based on currentTime
    const currentIndex = items.findIndex((item, index) => {
      const nextItem = items[index + 1];
      return (
        currentTime >= item.start &&
        (!nextItem || currentTime < nextItem.start)
      );
    });

    if (currentIndex >= 0) {
      setActiveIndex(currentIndex);
      
      // Only auto-scroll if user hasn't manually scrolled
      if (!userScrolling && activeItemRef.current && scrollContainerRef.current) {
        // Check if the active item is visible
        const container = scrollContainerRef.current;
        const activeItem = activeItemRef.current;
        const containerRect = container.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        
        const isVisible = 
          itemRect.top >= containerRect.top &&
          itemRect.bottom <= containerRect.bottom;
        
        // Only scroll if item is not visible
        if (!isVisible) {
          setTimeout(() => {
            activeItemRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }, 0);
        }
      }
    }
  }, [currentTime, items, userScrolling]);

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimestampClick = (startTime: number) => {
    if (onSeek) {
      onSeek(startTime);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-blue-400"></div>
          <span className="ml-3 text-slate-300">Loading transcript...</span>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-slate-400">
        No transcript available for this video.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          📝 Real-time Transcript
        </h3>
        <span className="inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
          {language === 'hi' ? '🇮🇳 Hindi' : language === 'en' ? '🇬🇧 English' : '🌍 ' + language.toUpperCase()}
        </span>
      </div>
      <div className="max-h-[600px] space-y-2 overflow-y-auto" ref={scrollContainerRef}>
        {items.map((item, index) => (
          <div
            key={index}
            ref={index === activeIndex ? activeItemRef : null}
            className={`transition-all duration-200 ${
              index === activeIndex
                ? 'rounded-lg bg-blue-500/20 px-3 py-2 border-l-4 border-blue-400'
                : 'px-3 py-2 hover:bg-white/5 rounded'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleTimestampClick(item.start)}
                className="flex-shrink-0 pt-1 font-mono text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors cursor-pointer min-w-[50px]"
                title="Click to seek to this timestamp"
              >
                {formatTime(item.start)}
              </button>
              <p
                className={`flex-1 text-sm leading-relaxed transition-colors ${
                  index === activeIndex ? 'text-white font-medium' : 'text-slate-300'
                }`}
              >
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-400">
        <p>💡 Click on any timestamp to jump to that part of the video</p>
      </div>
    </div>
  );
}
