const fs = require('fs');
const path = require('path');

// SVG template for generating icons
const svgTemplate = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="64" fill="#0f172a"/>
  <rect x="64" y="128" width="384" height="256" rx="24" fill="#1e293b"/>
  <rect x="96" y="160" width="320" height="192" rx="16" fill="#2563eb"/>
  <circle cx="256" cy="256" r="32" fill="#ffffff"/>
  <polygon points="240,240 240,272 272,256" fill="#2563eb"/>
  <rect x="64" y="400" width="384" height="8" rx="4" fill="#64748b"/>
  <rect x="64" y="416" width="320" height="8" rx="4" fill="#64748b"/>
  <rect x="64" y="432" width="256" height="8" rx="4" fill="#64748b"/>
</svg>`;

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG files for each size
iconSizes.forEach(size => {
  const svgContent = svgTemplate(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

// Generate shortcut icons
const shortcuts = [
  { name: 'shortcut-live', color: '#ef4444' },
  { name: 'shortcut-favorites', color: '#f59e0b' }
];

shortcuts.forEach(shortcut => {
  const svgContent = `
<svg width="96" height="96" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="24" fill="${shortcut.color}"/>
  <circle cx="256" cy="256" r="80" fill="#ffffff"/>
  <polygon points="220,220 220,292 292,256" fill="${shortcut.color}"/>
</svg>`;
  
  const filepath = path.join(iconsDir, `${shortcut.name}.svg`);
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${shortcut.name}.svg`);
});

console.log('All icons generated successfully!');
console.log('Note: For production, convert these SVG files to PNG format using a tool like ImageMagick or online converters.');
