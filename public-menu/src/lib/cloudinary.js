/**
 * Generate a blurred placeholder URL for Cloudinary images
 * @param {string} url - Original Cloudinary URL
 * @returns {string|null} - Blurred URL or null if not Cloudinary
 */
export function blurUrlFromCloudinary(url) {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('cloudinary.com')) return null;
    
    // Insert blur transform before the filename
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    // Insert blur transform after 'upload'
    pathParts.splice(uploadIndex + 1, 0, 'c_scale,w_24,e_blur:2000,q_10');
    
    urlObj.pathname = pathParts.join('/');
    return urlObj.toString();
  } catch (error) {
    console.warn('Failed to generate Cloudinary blur URL:', error);
    return null;
  }
}
