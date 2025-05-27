import { BrowserPDF417Reader } from '@zxing/browser';

export const scanPdf417FromBase64 = async (base64Image: string): Promise<string | null> => {
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Create an image and load the base64 data
    const img = new Image();
    
    // Wait for the image to load
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image onto canvas
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.onerror = (e) => reject(new Error('Image loading failed'));
      
      // Set the source to trigger loading (with data URL prefix if needed)
      img.src = base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`;
    });
    
    // Use canvas for decoding
    const reader = new BrowserPDF417Reader();
    const result = await reader.decodeFromCanvas(canvas);
    
    return result.getText();
  } catch (err) {
    console.error("PDF417 scan failed:", err);
    return null;
  }
};