/**
 * anonCard.ts — Generate colorful anonymous message card backgrounds.
 *
 * Uses sharp + SVG. Text is sent via Telegram caption (supports all languages).
 * The image is a decorative gradient card with quote marks and subtle branding.
 */
import sharp from 'sharp';

// ─── Gradient palette ────────────────────────────────────────────────────────

const GRADIENTS: [string, string][] = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a18cd1', '#fbc2eb'],
  ['#fccb90', '#d57eeb'],
  ['#f6d365', '#fda085'],
  ['#89f7fe', '#66a6ff'],
  ['#ff9a9e', '#fad0c4'],
  ['#fbc2eb', '#a6c1ee'],
  ['#a1c4fd', '#c2e9fb'],
  ['#d4fc79', '#96e6a1'],
  ['#84fab0', '#8fd3f4'],
  ['#6a11cb', '#2575fc'],
  ['#ff6a00', '#ee0979'],
];

function pickGradient(): [string, string] {
  const g = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
  return [g[0], g[1]];
}

// ─── Card generation ─────────────────────────────────────────────────────────

const CARD_WIDTH = 800;
const CARD_HEIGHT = 400;

/**
 * Generate a decorative gradient card image (no text — text goes in caption).
 * Features: gradient background, large quote mark, subtle decorative elements.
 */
export async function generateAnonCard(): Promise<Buffer> {
  const [color1, color2] = pickGradient();

  const isDark = isGradientDark(color1, color2);
  const quoteColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
  const decorColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';

  const svg = `<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="0" fill="url(#bg)"/>
  
  <!-- Large quote marks -->
  <text x="60" y="150" fill="${quoteColor}" font-size="200" font-family="Georgia, serif" font-weight="bold">\u201C</text>
  <text x="640" y="380" fill="${quoteColor}" font-size="200" font-family="Georgia, serif" font-weight="bold">\u201D</text>
  
  <!-- Decorative circles -->
  <circle cx="700" cy="80" r="60" fill="${decorColor}"/>
  <circle cx="730" cy="110" r="40" fill="${decorColor}"/>
  <circle cx="100" cy="350" r="30" fill="${decorColor}"/>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function isGradientDark(c1: string, c2: string): boolean {
  const lum = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };
  return (lum(c1) + lum(c2)) / 2 < 160;
}
