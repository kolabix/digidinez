import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

export default function ImageWithBlur({ 
  src, 
  alt, 
  className = '', 
  aspectRatio = '1/1',
  fallbackSrc = null 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isBlurred, setIsBlurred] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    if (src) {
      setImageLoaded(false);
      setImageError(false);
      setIsBlurred(true);
    }
  }, [src]);

  // When the image has loaded, drop the blur on the next animation frame so the
  // transition runs smoothly from blurred to sharp.
  useEffect(() => {
    if (!imageLoaded) return;
    const rafId = requestAnimationFrame(() => setIsBlurred(false));
    return () => cancelAnimationFrame(rafId);
  }, [imageLoaded]);

  // Lazy-load with IntersectionObserver
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { rootMargin: '100px' }
      );
      observer.observe(element);
      return () => observer.disconnect();
    }

    // Fallback if IntersectionObserver not available
    setIsInView(true);
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const containerClasses = clsx(
    'relative overflow-hidden bg-surface-muted',
    className
  );

  const imageClasses = clsx(
    'absolute inset-0 w-full h-full object-cover transition-[opacity,filter,transform] duration-300',
    isBlurred ? 'opacity-100 blur-md scale-105' : 'opacity-100 blur-0 scale-100'
  );

  const skeletonClasses = clsx(
    'absolute inset-0 skeleton',
    {
      'opacity-100': !imageLoaded,
      'opacity-0': imageLoaded
    }
  );

  return (
    <div 
      className={containerClasses}
      ref={containerRef}
      style={{ aspectRatio }}
    >
      {/* Skeleton placeholder while loading */}
      <div className={skeletonClasses} />
      
      {/* Main image */}
      {isInView && src && !imageError && (
        <img
          src={src}
          alt={alt || ''}
          className={imageClasses}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />
      )}
      
      {/* Fallback image */}
      {imageError && fallbackSrc && (
        <img
          src={fallbackSrc}
          alt={alt || ''}
          className="absolute inset-0 w-full h-full object-cover z-20"
        />
      )}
    </div>
  );
}
