import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SOURCE_GRID = path.join(ROOT, 'assets', 'Gemini_Generated_Image_f65hz1f65hz1f65h.jpg');
const SOURCE_VIDEO = path.join(ROOT, 'assets', 'gemini_generated_video_62859849.mp4');
const OUT_CHAPTERS = path.join(ROOT, 'public', 'assets', 'chapters');
const OUT_VIDEO = path.join(ROOT, 'public', 'assets', 'video');

fs.mkdirSync(OUT_CHAPTERS, { recursive: true });
fs.mkdirSync(OUT_VIDEO, { recursive: true });

// 3x3 storyboard panel mapping -> chapter asset names
const GRID_MAP = [
  { row: 0, col: 0, name: 'boarding' },
  { row: 0, col: 1, name: 'departure' },
  { row: 0, col: 2, name: 'arrival' },
  { row: 1, col: 0, name: 'cab' },
  { row: 1, col: 1, name: 'kelp' },
  { row: 1, col: 2, name: 'sunken-city' },
  { row: 2, col: 0, name: 'reef' },
  { row: 2, col: 1, name: 'glow-zone' },
  { row: 2, col: 2, name: 'cab-alt' },
];

async function run() {
  const meta = await sharp(SOURCE_GRID).metadata();
  const width = meta.width;
  const height = meta.height;
  const cellW = Math.floor(width / 3);
  const cellH = Math.floor(height / 3);
  const trim = 6; // trim subtle grid seam pixels

  console.log(`Source grid: ${width}x${height} -> cell ${cellW}x${cellH}`);

  for (const cell of GRID_MAP) {
    const left = cell.col * cellW + trim;
    const top = cell.row * cellH + trim;
    const extractW = cellW - trim * 2;
    const extractH = cellH - trim * 2;

    const pipeline = sharp(SOURCE_GRID)
      .extract({ left, top, width: extractW, height: extractH })
      .resize({ width: 1440, withoutEnlargement: true });

    const webpPath = path.join(OUT_CHAPTERS, `${cell.name}.webp`);
    const avifPath = path.join(OUT_CHAPTERS, `${cell.name}.avif`);

    await pipeline.clone().webp({ quality: 82 }).toFile(webpPath);
    await pipeline.clone().avif({ quality: 58 }).toFile(avifPath);

    const webpSize = (fs.statSync(webpPath).size / 1024).toFixed(1);
    const avifSize = (fs.statSync(avifPath).size / 1024).toFixed(1);
    console.log(`  ✓ ${cell.name}: ${webpSize} KB (.webp), ${avifSize} KB (.avif)`);
  }

  if (fs.existsSync(SOURCE_VIDEO)) {
    const destVideo = path.join(OUT_VIDEO, 'abyssline-journey.mp4');
    fs.copyFileSync(SOURCE_VIDEO, destVideo);
    console.log(`  ✓ copied concept video -> ${destVideo}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
