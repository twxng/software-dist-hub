/**
 * Utilities for working with images
 */

/**
 * Formats the image URL, adding the correct prefixes for base64 strings
 * @param imageUrl URL or base64 string of the image
 * @returns Correctly formatted image URL
 */
export const formatImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  
  // Check if it's already a correct URL or data URI
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image')) {
    return imageUrl;
  }
  
  // Determine the image type based on the start of the base64 string
  if (imageUrl.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${imageUrl}`;
  } else if (imageUrl.startsWith('iVBOR')) {
    return `data:image/png;base64,${imageUrl}`;
  } else if (imageUrl.startsWith('PHN2')) {
    return `data:image/svg+xml;base64,${imageUrl}`;
  } else if (imageUrl.startsWith('R0lGOD')) {
    return `data:image/gif;base64,${imageUrl}`;
  } else if (imageUrl.startsWith('UklGR')) {
    return `data:image/webp;base64,${imageUrl}`;
  } else {
    // If the image type is not recognized, use a general type
    return `data:image;base64,${imageUrl}`;
  }
};

/**
 * Removes the data URI prefix from a base64 string
 * @param base64 Base64 string with a possible prefix
 * @returns Clean base64 string without the prefix
 */
export const stripBase64Prefix = (base64: string): string => {
  // If there's no data: prefix, return as is
  if (!base64.startsWith('data:')) {
    return base64;
  }
  
  // Find the position after which the actual base64 starts
  const commaIndex = base64.indexOf(',');
  if (commaIndex === -1) {
    return base64; // If no comma is found, return as is
  }
  
  // Return the string after the comma
  return base64.substring(commaIndex + 1);
};

/**
 * Converts a File object to a base64 string
 * @param file File object for conversion
 * @param maxSize Maximum size in bytes (optional)
 * @param stripPrefix Whether to remove the "data:image/..." prefix (default: true)
 * @returns Promise with the base64 string
 */
export const convertFileToBase64 = (file: File, maxSize?: number, stripPrefix: boolean = true): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => {
      try {
        const base64 = reader.result as string;
        const sizeKb = Math.round(base64.length / 1024);
        
        console.log(`Image size ${file.name}: ${sizeKb} KB`);
        
        if (maxSize && base64.length > maxSize) {
          console.warn(`Image ${file.name} is too large (${sizeKb} KB), maximum: ${Math.round(maxSize / 1024)} KB`);
          // Can add compression or handling of large images here
        }
        
        // If the "data:image/..." prefix needs to be removed
        const result = stripPrefix ? stripBase64Prefix(base64) : base64;
        resolve(result);
      } catch (error) {
        console.error('Error processing file:', error);
        reject(error);
      }
    };
    
    reader.onerror = error => {
      console.error('Error reading file:', error);
      reject(error);
    };
  });
};

/**
 * Checks if the image URL in base64 format is valid
 * @param url URL of the image to check
 * @returns true if the base64 URL is valid
 */
export const isValidBase64ImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check if it's a data URI image
  if (url.startsWith('data:image')) {
    return true;
  }
  
  // Check if it's a base64 string with known image types
  const knownPrefixes = ['/9j/', 'iVBOR', 'PHN2', 'R0lGOD', 'UklGR'];
  return knownPrefixes.some(prefix => url.startsWith(prefix));
};

/**
 * Clears URL objects for memory release
 * @param urls Array of URL objects to clear
 */
export const revokeImageUrls = (urls: string[]): void => {
  urls.forEach(url => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
}; 