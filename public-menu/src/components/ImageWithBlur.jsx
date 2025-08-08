import { useState, useEffect } from 'react';
import { blurUrlFromCloudinary } from '../lib/cloudinary.js';
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
  const [blurUrl, setBlurUrl] = useState(null);

  useEffect(() => {
    if (src) {
      setImageLoaded(false);
      setImageError(false);
      setBlurUrl(blurUrlFromCloudinary(src));
    }
  }, [src]);

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
    'w-full h-full object-cover transition-opacity duration-300',
    {
      'opacity-0': !imageLoaded,
      'opacity-100': imageLoaded
    }
  );

  const skeletonClasses = clsx(
    'absolute inset-0 skeleton',
    {
      'opacity-100': !imageLoaded && !blurUrl,
      'opacity-0': imageLoaded || blurUrl
    }
  );

  const blurClasses = clsx(
    'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
    {
      'opacity-100': !imageLoaded && blurUrl,
      'opacity-0': imageLoaded || !blurUrl
    }
  );

  return (
    <div 
      className={containerClasses}
      style={{ aspectRatio }}
    >
      {/* Skeleton placeholder for non-Cloudinary images */}
      <div className={skeletonClasses} />
      
      {/* Blur placeholder for Cloudinary images */}
      {blurUrl && (
        <img
          src={blurUrl}
          alt=""
          className={blurClasses}
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      {src && !imageError && (
        <img
          src={src}
          alt={alt || ''}
          className={imageClasses}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      )}
      
      {/* Fallback image */}
      {imageError && fallbackSrc && (
        <img
          src={fallbackSrc}
          alt={alt || ''}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
