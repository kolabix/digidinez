import { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';

export const ImageCropper = ({ 
  imageFile, 
  onCropComplete, 
  onCancel, 
  aspectRatio = 1, // 1:1 for square
  minWidth = 200,
  minHeight = 200
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [imageUrl, setImageUrl] = useState('');
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        
        // Initialize crop area to center with reasonable size
        const containerWidth = containerRef.current?.clientWidth || 400;
        const containerHeight = containerRef.current?.clientHeight || 400;
        
        const scale = Math.min(containerWidth / img.width, containerHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        const cropSize = Math.min(scaledWidth, scaledHeight) * 0.8;
        const x = (scaledWidth - cropSize) / 2;
        const y = (scaledHeight - cropSize) / 2;
        
        setCropArea({ x, y, width: cropSize, height: cropSize });
      };
      img.src = url;
      
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const handleMouseDown = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is inside crop area
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newX = Math.max(0, Math.min(x - dragStart.x, imageDimensions.width - cropArea.width));
    const newY = Math.max(0, Math.min(y - dragStart.y, imageDimensions.height - cropArea.height));
    
    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropComplete = async () => {
    if (!imageFile || !canvasRef.current) return;
    
    setIsLoading(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to crop dimensions
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw cropped portion
      ctx.drawImage(
        imageRef.current,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      );
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          // Create a new file with the cropped image
          const croppedFile = new File([blob], 'brand-mark.png', { type: 'image/png' });
          onCropComplete(croppedFile);
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Crop error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResizeCrop = (direction, delta) => {
    setCropArea(prev => {
      let newWidth = prev.width;
      let newHeight = prev.height;
      let newX = prev.x;
      let newY = prev.y;
      
      switch (direction) {
        case 'nw':
          newWidth = Math.max(minWidth, prev.width - delta);
          newHeight = newWidth / aspectRatio;
          newX = prev.x + (prev.width - newWidth);
          newY = prev.y + (prev.height - newHeight);
          break;
        case 'ne':
          newWidth = Math.max(minWidth, prev.width - delta);
          newHeight = newWidth / aspectRatio;
          newY = prev.y + (prev.height - newHeight);
          break;
        case 'sw':
          newWidth = Math.max(minWidth, prev.width - delta);
          newHeight = newWidth / aspectRatio;
          newX = prev.x + (prev.width - newWidth);
          break;
        case 'se':
          newWidth = Math.max(minWidth, prev.width - delta);
          newHeight = newWidth / aspectRatio;
          break;
      }
      
      // Ensure crop area stays within image bounds
      newX = Math.max(0, Math.min(newX, imageDimensions.width - newWidth));
      newY = Math.max(0, Math.min(newY, imageDimensions.height - newHeight));
      
      return { x: newX, y: newY, width: newWidth, height: newHeight };
    });
  };

  if (!imageFile) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Crop Image for Brand Mark
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Select the square area you want to use as your brand mark. Drag to move the selection or use the corner handles to resize.
          </p>
          
          <div className="flex justify-center mb-6">
            <div 
              ref={containerRef}
              className="relative border-2 border-gray-300 rounded-lg overflow-hidden cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop preview"
                className="max-w-full max-h-full block"
                draggable={false}
              />
              
              {/* Crop overlay */}
              <div
                className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
              >
                {/* Corner resize handles */}
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize"
                  style={{ left: -6, top: -6 }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    
                    const handleMouseMove = (e) => {
                      const delta = Math.min(startX - e.clientX, startY - e.clientY);
                      handleResizeCrop('nw', delta);
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize"
                  style={{ right: -6, top: -6 }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    
                    const handleMouseMove = (e) => {
                      const delta = Math.min(e.clientX - startX, startY - e.clientY);
                      handleResizeCrop('ne', delta);
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize"
                  style={{ left: -6, bottom: -6 }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    
                    const handleMouseMove = (e) => {
                      const delta = Math.min(startX - e.clientX, e.clientY - startY);
                      handleResizeCrop('sw', delta);
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize"
                  style={{ right: -6, bottom: -6 }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    
                    const handleMouseMove = (e) => {
                      const delta = Math.min(e.clientX - startX, e.clientY - startY);
                      handleResizeCrop('se', delta);
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleCropComplete} disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                'Crop & Save'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
