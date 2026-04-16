import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: React.CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
  playOnce?: boolean; // New prop to control one-time animation
  uniqueKey?: string; // Unique identifier for tracking animation state
}

// Simple text splitting utility (fallback for SplitText plugin)
const splitTextManually = (element: HTMLElement, type: 'chars' | 'words' | 'lines'): HTMLElement[] => {
  const text = element.textContent || '';
  const elements: HTMLElement[] = [];
  const parentClasses = element.className;
  
  // Immediately hide the original text
  element.style.color = 'transparent';
  
  if (type === 'chars') {
    element.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char; // Use non-breaking space
      span.style.display = 'inline-block';
      span.style.color = 'inherit'; // Inherit color from parent
      span.className = `split-char ${parentClasses}`; // Inherit parent classes
      element.appendChild(span);
      elements.push(span);
    }
  } else if (type === 'words') {
    const words = text.split(' ');
    element.innerHTML = '';
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.textContent = word;
      span.style.display = 'inline-block';
      span.style.color = 'inherit'; // Inherit color from parent
      span.className = `split-word ${parentClasses}`; // Inherit parent classes
      element.appendChild(span);
      elements.push(span);
      
      if (index < words.length - 1) {
        element.appendChild(document.createTextNode(' '));
      }
    });
  }
  
  // Restore color after splitting
  element.style.color = '';
  
  return elements;
};

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'h1',
  onLetterAnimationComplete,
  playOnce = false,
  uniqueKey = 'default-split-text'
}) => {
  const ref = useRef<HTMLElement>(null);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [shouldAnimate, setShouldAnimate] = useState<boolean>(true);

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }
  }, []);

  // Check if animation has already been played for this session
  useEffect(() => {
    if (playOnce) {
      const animationKey = `splittext-animated-${uniqueKey}`;
      const hasAnimated = sessionStorage.getItem(animationKey);
      
      if (hasAnimated) {
        setShouldAnimate(false);
      }
    }
  }, [playOnce, uniqueKey]);

  useEffect(() => {
    if (!ref.current || !text) return;

    const el = ref.current;
    
    // Immediately hide the text content
    el.style.color = 'transparent';
    
    if (!fontsLoaded) return;
    
    // Split the text manually (this will hide original text)
    const targets = splitTextManually(el, splitType);
    
    if (targets.length === 0) return;

    // If shouldAnimate is false, just show the final state immediately
    if (!shouldAnimate) {
      gsap.set(targets, to);
      el.style.color = '';
      return;
    }

    // Initially hide all split elements
    gsap.set(targets, from);
    
    // Restore color for split elements
    el.style.color = '';
    
    // Animate the split elements
    const tl = gsap.to(targets, {
      ...to,
      duration,
      ease,
      stagger: delay / 1000,
      scrollTrigger: {
        trigger: el,
        start: `top ${(1 - threshold) * 100}%`,
        once: true,
        fastScrollEnd: true,
      },
      onComplete: () => {
        // Mark animation as completed in session storage
        if (playOnce) {
          const animationKey = `splittext-animated-${uniqueKey}`;
          sessionStorage.setItem(animationKey, 'true');
        }
        onLetterAnimationComplete?.();
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === el) st.kill();
      });
      tl.kill();
    };
  }, [
    text,
    delay,
    duration,
    ease,
    splitType,
    JSON.stringify(from),
    JSON.stringify(to),
    threshold,
    rootMargin,
    fontsLoaded,
    onLetterAnimationComplete,
    shouldAnimate,
    playOnce,
    uniqueKey
  ]);

  const style: React.CSSProperties = {
    textAlign,
    overflow: 'hidden',
    display: 'inline-block',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    willChange: 'transform, opacity',
    // Hide text until it's properly split and ready to animate
    visibility: fontsLoaded && shouldAnimate ? 'visible' : (fontsLoaded ? 'visible' : 'hidden'),
    color: fontsLoaded ? 'inherit' : 'transparent',
  };
  
  const classes = `split-parent ${className}`;
  
  const TagComponent = tag as keyof JSX.IntrinsicElements;
  
  return React.createElement(
    TagComponent,
    {
      ref,
      style,
      className: classes,
    },
    text
  );
};

export default SplitText;