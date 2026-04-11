export const TOOLS_CATEGORIES = [
  {
    category: 'Transform',
    items: [
      { id: 'compress', title: 'Compress', desc: 'Reduce file size while keeping quality', icon: 'contract-outline', color: '#EC4899', route: '/tools/compress' },
      { id: 'resize', title: 'Resize', desc: 'Change dimensions to any size', icon: 'resize-outline', color: '#3B82F6', route: '/tools/resize' },
      { id: 'crop', title: 'Crop', desc: 'Remove unwanted areas precisely', icon: 'crop-outline', color: '#14B8A6', route: '/tools/crop' },
      { id: 'rotate', title: 'Rotate', desc: 'Rotate and flip with precision', icon: 'refresh-outline', color: '#F59E0B', route: '/tools/rotate' },
    ],
  },
  {
    category: 'Convert',
    items: [
      { id: 'convert-to-jpg', title: 'To JPG', desc: 'Convert any image format to JPG', icon: 'swap-horizontal-outline', color: '#3B82F6', route: '/tools/convert-to-jpg' },
      { id: 'convert-from-jpg', title: 'From JPG', desc: 'JPG to PNG or WEBP', icon: 'swap-horizontal-outline', color: '#10B981', route: '/tools/convert-from-jpg' },
      { id: 'html-to-image', title: 'HTML-2-IMG', desc: 'Convert HTML code to an image', icon: 'code-slash-outline', color: '#14B8A6', route: '/tools/html-to-image' },
    ],
  },
  {
    category: 'Enhance',
    items: [
      { id: 'upscale', title: 'Upscale', desc: 'Enlarge by 2×, 3×, or 4×', icon: 'expand-outline', color: '#3B82F6', route: '/tools/upscale' },
      { id: 'watermark', title: 'Watermark', desc: 'Add custom text watermarks', icon: 'water-outline', color: '#6366F1', route: '/tools/watermark' },
      { id: 'photo-editor', title: 'Editor', desc: 'Brightness, contrast, filters & more', icon: 'color-wand-outline', color: '#EC4899', route: '/tools/photo-editor' },
    ],
  },
  {
    category: 'Creative',
    items: [
      { id: 'meme-generator', title: 'Meme Gen', desc: 'Create memes with Impact text', icon: 'happy-outline', color: '#F59E0B', route: '/tools/meme-generator' },
      { id: 'blur-face', title: 'Blur Face', desc: 'Protect privacy by blurring areas', icon: 'eye-off-outline', color: '#EF4444', route: '/tools/blur-face' },
      { id: 'remove-background', title: 'AI BG Remove', desc: 'High-fidelity subject isolation', icon: 'cut-outline', color: '#8B5CF6', route: '/tools/remove-background' },
    ],
  },
];
