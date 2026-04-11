/**
 * ShrinQE Image Processor
 * Core processing uses the HTML5 Canvas API (Client-Side).
 * Advanced AI features (Background Removal) are processed via the ShrinQE Backend API.
 */
import { API_URL } from '../constants/config';

// ─── Helpers ────────────────────────────────────────────────

/**
 * Load a File/Blob into an HTMLImageElement
 */
export const loadImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image'));
    if (file instanceof File || file instanceof Blob) {
      img.src = URL.createObjectURL(file);
    } else if (typeof file === 'string') {
      img.src = file;
    } else {
      reject(new Error('Invalid input: expected File, Blob, or URL string'));
    }
  });
};

/**
 * Convert a canvas to a Blob
 */
const canvasToBlob = (canvas, mimeType = 'image/png', quality = 0.92) => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
};

/**
 * Create an offscreen canvas with given dimensions
 */
const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

/**
 * Format bytes into human-readable size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Get image dimensions from a File
 */
export const getImageInfo = async (file) => {
  const img = await loadImage(file);
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    size: file.size,
    name: file.name,
    type: file.type,
  };
};

// ─── Compress ────────────────────────────────────────────────

export const compressImage = async (file, quality = 0.7, maxWidth = null, maxHeight = null) => {
  const img = await loadImage(file);
  let { naturalWidth: w, naturalHeight: h } = img;

  // Scale down if max dimensions specified
  if (maxWidth && w > maxWidth) {
    h = Math.round(h * (maxWidth / w));
    w = maxWidth;
  }
  if (maxHeight && h > maxHeight) {
    w = Math.round(w * (maxHeight / h));
    h = maxHeight;
  }

  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);

  // Use JPEG for compression (or WebP if supported)
  const mimeType = 'image/jpeg';
  const blob = await canvasToBlob(canvas, mimeType, quality);

  return {
    blob,
    width: w,
    height: h,
    originalSize: file.size,
    compressedSize: blob.size,
    savings: Math.round((1 - blob.size / file.size) * 100),
    url: URL.createObjectURL(blob),
  };
};

// ─── Resize ──────────────────────────────────────────────────

export const resizeImage = async (file, targetWidth, targetHeight, maintainAspect = true) => {
  const img = await loadImage(file);
  let w = targetWidth;
  let h = targetHeight;

  if (maintainAspect) {
    const ratio = img.naturalWidth / img.naturalHeight;
    if (targetWidth && !targetHeight) {
      h = Math.round(targetWidth / ratio);
    } else if (targetHeight && !targetWidth) {
      w = Math.round(targetHeight * ratio);
    } else {
      // Fit within bounds
      const scaleW = targetWidth / img.naturalWidth;
      const scaleH = targetHeight / img.naturalHeight;
      const scale = Math.min(scaleW, scaleH);
      w = Math.round(img.naturalWidth * scale);
      h = Math.round(img.naturalHeight * scale);
    }
  }

  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await canvasToBlob(canvas, outputType, 0.92);

  return {
    blob,
    width: w,
    height: h,
    url: URL.createObjectURL(blob),
  };
};

// ─── Crop ────────────────────────────────────────────────────

export const cropImage = async (file, cropX, cropY, cropW, cropH) => {
  const img = await loadImage(file);

  const canvas = createCanvas(cropW, cropH);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await canvasToBlob(canvas, outputType, 0.95);

  return {
    blob,
    width: cropW,
    height: cropH,
    url: URL.createObjectURL(blob),
  };
};

// ─── Rotate ──────────────────────────────────────────────────

export const rotateImage = async (file, degrees = 90, flipH = false, flipV = false) => {
  const img = await loadImage(file);
  const rad = (degrees * Math.PI) / 180;

  // Calculate new canvas size after rotation
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const newW = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
  const newH = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);

  const canvas = createCanvas(newW, newH);
  const ctx = canvas.getContext('2d');

  ctx.translate(newW / 2, newH / 2);
  if (flipH) ctx.scale(-1, 1);
  if (flipV) ctx.scale(1, -1);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await canvasToBlob(canvas, outputType, 0.95);

  return {
    blob,
    width: newW,
    height: newH,
    url: URL.createObjectURL(blob),
  };
};

// ─── Convert to JPG ─────────────────────────────────────────

export const convertToJPG = async (file, quality = 0.92) => {
  const img = await loadImage(file);

  const canvas = createCanvas(img.naturalWidth, img.naturalHeight);
  const ctx = canvas.getContext('2d');
  // Fill white background (for transparent PNGs)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  const blob = await canvasToBlob(canvas, 'image/jpeg', quality);

  return {
    blob,
    width: img.naturalWidth,
    height: img.naturalHeight,
    url: URL.createObjectURL(blob),
  };
};

// ─── Convert from JPG ───────────────────────────────────────

export const convertFromJPG = async (file, outputFormat = 'image/png') => {
  const img = await loadImage(file);

  const canvas = createCanvas(img.naturalWidth, img.naturalHeight);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const blob = await canvasToBlob(canvas, outputFormat, 0.95);

  return {
    blob,
    width: img.naturalWidth,
    height: img.naturalHeight,
    url: URL.createObjectURL(blob),
  };
};

// ─── Watermark ───────────────────────────────────────────────

export const addWatermark = async (file, text, options = {}) => {
  const {
    position = 'bottom-right', // top-left, top-right, center, bottom-left, bottom-right
    fontSize = 24,
    opacity = 0.5,
    color = '#FFFFFF',
    fontFamily = 'Inter, Arial, sans-serif',
    padding = 20,
  } = options;

  const img = await loadImage(file);
  const canvas = createCanvas(img.naturalWidth, img.naturalHeight);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // Set text style
  ctx.globalAlpha = opacity;
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  const metrics = ctx.measureText(text);
  const textW = metrics.width;
  const textH = fontSize;

  let x, y;
  switch (position) {
    case 'top-left':
      x = padding; y = padding + textH; break;
    case 'top-right':
      x = canvas.width - textW - padding; y = padding + textH; break;
    case 'center':
      x = (canvas.width - textW) / 2; y = (canvas.height + textH) / 2; break;
    case 'bottom-left':
      x = padding; y = canvas.height - padding; break;
    case 'bottom-right':
    default:
      x = canvas.width - textW - padding; y = canvas.height - padding; break;
  }

  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await canvasToBlob(canvas, outputType, 0.95);

  return {
    blob,
    width: img.naturalWidth,
    height: img.naturalHeight,
    url: URL.createObjectURL(blob),
  };
};

// ─── Meme Generator ──────────────────────────────────────────

export const generateMeme = async (file, topText = '', bottomText = '', options = {}) => {
  const {
    fontSize = null, // auto-calculate if null
    fontColor = '#FFFFFF',
    strokeColor = '#000000',
    fontFamily = 'Impact, Arial Black, sans-serif',
  } = options;

  const img = await loadImage(file);
  const canvas = createCanvas(img.naturalWidth, img.naturalHeight);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const calcFontSize = fontSize || Math.max(24, Math.round(canvas.width / 12));
  ctx.font = `bold ${calcFontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = fontColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = Math.max(2, calcFontSize / 12);
  ctx.lineJoin = 'round';

  const wrapText = (text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const maxTextWidth = canvas.width * 0.9;
  const padding = calcFontSize * 0.6;

  // Top text
  if (topText) {
    const lines = wrapText(topText.toUpperCase(), maxTextWidth);
    lines.forEach((line, i) => {
      const y = padding + calcFontSize + i * (calcFontSize * 1.2);
      ctx.strokeText(line, canvas.width / 2, y);
      ctx.fillText(line, canvas.width / 2, y);
    });
  }

  // Bottom text
  if (bottomText) {
    const lines = wrapText(bottomText.toUpperCase(), maxTextWidth);
    const startY = canvas.height - padding - (lines.length - 1) * (calcFontSize * 1.2);
    lines.forEach((line, i) => {
      const y = startY + i * (calcFontSize * 1.2);
      ctx.strokeText(line, canvas.width / 2, y);
      ctx.fillText(line, canvas.width / 2, y);
    });
  }

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);

  return {
    blob,
    width: img.naturalWidth,
    height: img.naturalHeight,
    url: URL.createObjectURL(blob),
  };
};

// ─── Blur Region ─────────────────────────────────────────────

export const blurRegions = async (file, regions = [], intensity = 15) => {
  const img = await loadImage(file);
  const canvas = createCanvas(img.naturalWidth, img.naturalHeight);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  for (const region of regions) {
    const { x, y, width, height } = region;

    // Extract region
    const regionCanvas = createCanvas(width, height);
    const regionCtx = regionCanvas.getContext('2d');
    regionCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

    // Apply box blur by scaling down then up
    const blurCanvas = createCanvas(width, height);
    const blurCtx = blurCanvas.getContext('2d');

    const scaleFactor = Math.max(1, Math.round(intensity / 2));
    const smallW = Math.max(1, Math.round(width / scaleFactor));
    const smallH = Math.max(1, Math.round(height / scaleFactor));

    // Scale down
    blurCtx.drawImage(regionCanvas, 0, 0, smallW, smallH);
    // Scale back up (creates blur effect)
    blurCtx.imageSmoothingEnabled = true;
    blurCtx.imageSmoothingQuality = 'low';
    blurCtx.drawImage(blurCanvas, 0, 0, smallW, smallH, 0, 0, width, height);

    // Draw blurred region back
    ctx.drawImage(blurCanvas, x, y);
  }

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await canvasToBlob(canvas, outputType, 0.95);

  return {
    blob,
    width: img.naturalWidth,
    height: img.naturalHeight,
    url: URL.createObjectURL(blob),
  };
};

// ─── Upscale ─────────────────────────────────────────────────

export const upscaleImage = async (file, scale = 2) => {
  const img = await loadImage(file);
  const newW = Math.round(img.naturalWidth * scale);
  const newH = Math.round(img.naturalHeight * scale);

  const canvas = createCanvas(newW, newH);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, newW, newH);

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await canvasToBlob(canvas, outputType, 0.95);

  return {
    blob,
    width: newW,
    height: newH,
    url: URL.createObjectURL(blob),
  };
};

// ─── Remove Background (AI-Powered) ──────────────────────────


export const removeBackground = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/api/tools/remove-background`, {
      method: 'POST',
      body: formData,
      // Note: No'Content-Type' header needed for FormData; browser sets it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend error: ${response.status}`);
    }

    const blob = await response.blob();
    
    // Load back into Image to get dimensions (since it's a new PNG)
    const img = await loadImage(blob);
    
    return {
      blob,
      width: img.naturalWidth,
      height: img.naturalHeight,
      url: URL.createObjectURL(blob),
    };
  } catch (err) {
    console.error('AI Background Removal Error:', err);
    throw new Error('AI processing failed: ' + err.message);
  }
};

// ─── Photo Editor (Filters) ─────────────────────────────────

export const applyFilters = async (file, filters = {}) => {
  const {
    brightness = 100,   // 0-200, default 100
    contrast = 100,     // 0-200, default 100
    saturation = 100,   // 0-200, default 100
    blur = 0,           // 0-20px
    grayscale = 0,      // 0-100%
    sepia = 0,          // 0-100%
    hueRotate = 0,      // 0-360 degrees
    invert = 0,         // 0-100%
  } = filters;

  const img = await loadImage(file);
  const canvas = createCanvas(img.naturalWidth, img.naturalHeight);
  const ctx = canvas.getContext('2d');

  // Build CSS filter string
  const filterParts = [];
  if (brightness !== 100) filterParts.push(`brightness(${brightness}%)`);
  if (contrast !== 100) filterParts.push(`contrast(${contrast}%)`);
  if (saturation !== 100) filterParts.push(`saturate(${saturation}%)`);
  if (blur > 0) filterParts.push(`blur(${blur}px)`);
  if (grayscale > 0) filterParts.push(`grayscale(${grayscale}%)`);
  if (sepia > 0) filterParts.push(`sepia(${sepia}%)`);
  if (hueRotate > 0) filterParts.push(`hue-rotate(${hueRotate}deg)`);
  if (invert > 0) filterParts.push(`invert(${invert}%)`);

  ctx.filter = filterParts.length > 0 ? filterParts.join(' ') : 'none';
  ctx.drawImage(img, 0, 0);

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await canvasToBlob(canvas, outputType, 0.95);

  return {
    blob,
    width: img.naturalWidth,
    height: img.naturalHeight,
    url: URL.createObjectURL(blob),
  };
};

// ─── HTML to Image ───────────────────────────────────────────

export const htmlToImage = async (htmlString, options = {}) => {
  const {
    width = 800,
    height = null,
    backgroundColor = '#FFFFFF',
    outputFormat = 'image/png',
  } = options;

  // Measure the HTML content height via a hidden container
  const measure = document.createElement('div');
  measure.style.cssText = `position:fixed;left:-9999px;top:-9999px;width:${width}px;padding:20px;box-sizing:border-box;`;
  measure.innerHTML = htmlString;
  document.body.appendChild(measure);
  await new Promise(r => setTimeout(r, 100));
  const contentHeight = height || measure.scrollHeight || 400;
  document.body.removeChild(measure);

  // Properly escape HTML for XHTML embedding in SVG foreignObject
  // We must create a well-formed XHTML document
  const xhtmlContent = `<div xmlns="http://www.w3.org/1999/xhtml" style="margin:0;padding:20px;background:${backgroundColor};width:${width}px;min-height:${contentHeight}px;box-sizing:border-box;">${htmlString}</div>`;

  // Parse to ensure valid XHTML
  const parser = new DOMParser();
  const parsed = parser.parseFromString(xhtmlContent, 'application/xhtml+xml');

  // Check for parse errors
  const parseError = parsed.querySelector('parsererror');
  let serializedHTML;
  if (parseError) {
    // Fallback: sanitize by using innerHTML round-trip
    const fallback = document.createElement('div');
    fallback.innerHTML = htmlString;
    const serializer = new XMLSerializer();
    const sanitized = serializer.serializeToString(fallback);
    serializedHTML = `<div xmlns="http://www.w3.org/1999/xhtml" style="margin:0;padding:20px;background:${backgroundColor};width:${width}px;min-height:${contentHeight}px;box-sizing:border-box;">${sanitized}</div>`;
  } else {
    const serializer = new XMLSerializer();
    serializedHTML = serializer.serializeToString(parsed.documentElement);
  }

  const svgString = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${contentHeight}">`,
    `<foreignObject width="100%" height="100%">`,
    serializedHTML,
    `</foreignObject>`,
    `</svg>`,
  ].join('');

  // Convert SVG to a data URL (avoids cross-origin / tainted canvas)
  const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('Failed to render HTML. Ensure your HTML is valid and doesn\'t reference external resources.'));
    img.src = svgDataUrl;
  });

  const canvas = createCanvas(width, contentHeight);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, contentHeight);
  ctx.drawImage(img, 0, 0);

  const blob = await canvasToBlob(canvas, outputFormat, 0.95);

  return {
    blob,
    width,
    height: contentHeight,
    url: URL.createObjectURL(blob),
  };
};

/**
 * Revoke a previously created object URL to free memory
 */
export const revokeURL = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
