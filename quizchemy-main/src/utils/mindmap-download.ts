/**
 * Download utilities for exporting mindmaps
 */

/**
 * Download SVG element as PNG image
 */
export const downloadSVGAsPNG = async (
  svgElement: SVGSVGElement,
  filename: string,
  scale: number = 2
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      
      // Get the bounding box of all content
      const bbox = svgElement.getBBox();
      const padding = 40; // Add padding around the content
      
      // Calculate dimensions with padding
      const width = bbox.width + (padding * 2);
      const height = bbox.height + (padding * 2);
      
      // Set explicit width, height, and viewBox on cloned SVG
      clonedSvg.setAttribute('width', width.toString());
      clonedSvg.setAttribute('height', height.toString());
      clonedSvg.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`);
      
      // Ensure all styles are inline
      const allElements = clonedSvg.querySelectorAll('*');
      allElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        const inlineStyles: string[] = [];
        
        // Copy important styles
        const stylesToCopy = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'font-weight', 'opacity'];
        stylesToCopy.forEach(prop => {
          const value = computedStyle.getPropertyValue(prop);
          if (value && value !== 'none') {
            inlineStyles.push(`${prop}: ${value}`);
          }
        });
        
        if (inlineStyles.length > 0) {
          element.setAttribute('style', inlineStyles.join('; '));
        }
      });

      // Create canvas with higher resolution
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);

      // Serialize cloned SVG to string
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clonedSvg);
      
      // Add XML namespace if not present
      if (!svgString.includes('xmlns=')) {
        svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      // Create blob and object URL
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Load image and draw to canvas
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create image blob'));
            return;
          }

          // Download
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
          resolve();
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image'));
      };

      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Download SVG element as SVG file
 */
export const downloadSVG = (svgElement: SVGSVGElement, filename: string): void => {
  // Clone the SVG to avoid modifying the original
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
  
  // Get the bounding box of all content
  const bbox = svgElement.getBBox();
  const padding = 40; // Add padding around the content
  
  // Calculate dimensions with padding
  const width = bbox.width + (padding * 2);
  const height = bbox.height + (padding * 2);
  
  // Set explicit width, height, and viewBox on cloned SVG
  clonedSvg.setAttribute('width', width.toString());
  clonedSvg.setAttribute('height', height.toString());
  clonedSvg.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`);
  
  // Ensure all styles are inline
  const allElements = clonedSvg.querySelectorAll('*');
  allElements.forEach((element) => {
    const computedStyle = window.getComputedStyle(element);
    const inlineStyles: string[] = [];
    
    // Copy important styles
    const stylesToCopy = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'font-weight', 'opacity'];
    stylesToCopy.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'none') {
        inlineStyles.push(`${prop}: ${value}`);
      }
    });
    
    if (inlineStyles.length > 0) {
      element.setAttribute('style', inlineStyles.join('; '));
    }
  });
  
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clonedSvg);
  
  // Add XML namespace if not present
  if (!svgString.includes('xmlns=')) {
    svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download mindmap data as JSON
 */
export const downloadJSON = (data: any, filename: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
