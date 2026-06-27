import { useState, useEffect, useCallback } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type KineticSwapperProps = {
  prefix: string;
  words: string[];
  className?: string;
  /** Additional classes for the rotating word (e.g. text-accent for gold color) */
  wordClassName?: string;
  wordStyle?: React.CSSProperties;
  interval?: number;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p' | 'div';
  style?: React.CSSProperties;
  /** Pause word cycling when user hovers over the text */
  pauseOnHover?: boolean;
  /** Callback fired whenever the active word changes */
  onWordChange?: (word: string, index: number) => void;
};

/* ============================================================
   KineticSwapper — Mechanical 3D drum roll (split-flap / slot machine)
   rotator matching the hardware system aesthetic.
   ============================================================ */
export function KineticSwapper({
  prefix,
  words,
  className = '',
  wordClassName = '',
  interval = 2200,
  as: Tag = 'h1',
  style,
  wordStyle,
  pauseOnHover = true,
  onWordChange,
}: KineticSwapperProps) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const reduced = usePrefersReducedMotion();

  const tick = useCallback(() => {
    setIndex((prev) => prev + 1);
  }, []);

  const activeIndex = index % words.length;

  // Fire parent callback on word changes
  useEffect(() => {
    if (onWordChange && words[activeIndex] !== undefined) {
      onWordChange(words[activeIndex], activeIndex);
    }
  }, [activeIndex, onWordChange, words]);

  // Sync animation timer with browser visibility and hover states
  useEffect(() => {
    if (reduced || words.length <= 1) return;

    let timer: any = null;

    const startTimer = () => {
      if (!timer && !(pauseOnHover && isHovered)) {
        timer = setInterval(tick, interval);
      }
    };

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    if (document.visibilityState === 'visible') {
      startTimer();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startTimer();
      } else {
        stopTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tick, interval, reduced, words.length, isHovered, pauseOnHover]);

  if (reduced || words.length === 0) {
    return (
      <Tag className={className} style={style}>
        {prefix} <span className={wordClassName} style={wordStyle}>{words[0] ?? ''}</span>
      </Tag>
    );
  }

  // Find the longest word to act as a layout width/height anchor
  const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), '');

  // Calculate face text dynamically to support any length list of words
  const getFaceText = (faceNum: number) => {
    const diff = (faceNum - (index % 4) + 4) % 4;
    const targetIndex = index + (diff === 3 ? -1 : diff);
    return words[(targetIndex + words.length * 1000) % words.length] ?? '';
  };

  return (
    <Tag className={className} style={style}>
      <span>{prefix}&nbsp;</span>
      <span 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-live="polite"
        aria-atomic="true"
        style={{ 
          position: 'relative', 
          display: 'inline-block', 
          verticalAlign: 'top', 
          cursor: 'pointer',
          perspective: '400px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Invisible layout anchor to reserve width and height matching font metrics */}
        <span 
          className={wordClassName} 
          style={{ 
            ...wordStyle, 
            visibility: 'hidden', 
            display: 'inline-block', 
            pointerEvents: 'none', 
            userSelect: 'none',
            letterSpacing: isHovered ? '0.06em' : '0em',
            transition: 'letter-spacing 0.25s ease-out'
          }} 
          aria-hidden="true"
        >
          {longestWord}
        </span>

        {/* 3D Cube rotator container */}
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            transformStyle: 'preserve-3d',
            transform: `rotateX(${index * 90}deg)`,
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Face 0: Front */}
          <div 
            className={wordClassName}
            style={{ 
              ...wordStyle, 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              alignItems: 'center', 
              backfaceVisibility: 'hidden',
              whiteSpace: 'nowrap',
              letterSpacing: isHovered ? '0.06em' : '0em',
              transition: 'letter-spacing 0.25s ease-out',
              transform: 'rotateX(0deg) translateZ(0.55em)' 
            }}
          >
            {getFaceText(0)}
          </div>
          {/* Face 1: Bottom */}
          <div 
            className={wordClassName}
            style={{ 
              ...wordStyle, 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              alignItems: 'center', 
              backfaceVisibility: 'hidden',
              whiteSpace: 'nowrap',
              letterSpacing: isHovered ? '0.06em' : '0em',
              transition: 'letter-spacing 0.25s ease-out',
              transform: 'rotateX(-90deg) translateZ(0.55em)' 
            }}
          >
            {getFaceText(1)}
          </div>
          {/* Face 2: Back */}
          <div 
            className={wordClassName}
            style={{ 
              ...wordStyle, 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              alignItems: 'center', 
              backfaceVisibility: 'hidden',
              whiteSpace: 'nowrap',
              letterSpacing: isHovered ? '0.06em' : '0em',
              transition: 'letter-spacing 0.25s ease-out',
              transform: 'rotateX(180deg) translateZ(0.55em)' 
            }}
          >
            {getFaceText(2)}
          </div>
          {/* Face 3: Top */}
          <div 
            className={wordClassName}
            style={{ 
              ...wordStyle, 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              alignItems: 'center', 
              backfaceVisibility: 'hidden',
              whiteSpace: 'nowrap',
              letterSpacing: isHovered ? '0.06em' : '0em',
              transition: 'letter-spacing 0.25s ease-out',
              transform: 'rotateX(90deg) translateZ(0.55em)' 
            }}
          >
            {getFaceText(3)}
          </div>
        </div>
      </span>
    </Tag>
  );
}
