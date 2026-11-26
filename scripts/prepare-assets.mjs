import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const ROOT = process.cwd();
const SOURCE_VIDEO = path.join(ROOT, 'assets', 'WhatsApp Video 2026-11-26 at 21.41.18.mp4');
const OUT_FRAMES = path.join(ROOT, 'public', 'assets', 'frames');
const OUT_VIDEO = path.join(ROOT, 'public', 'assets', 'video');
const OUT_POSTERS = path.join(ROOT, 'public', 'assets', 'posters');

// Tightly bounds the top-left static Wink watermark + star at 3840x2160
const DELOGO_FILTER = 'delogo=x=64:y=50:w=318:h=126';

const TIERS = [
  { id: 'desktop', fps: 24, width: 1920, height: 1080, cas: 0.22, quality: 88 },
  { id: 'tablet', fps: 20, width: 1280, height: 720, cas: 0.18, quality: 82 },
  { id: 'mobile', fps: 16, width: 960, height: 540, cas: 0.15, quality: 78 },
];

// Mid-timestamps (seconds) for each of the 9 chapters (reduced-motion & poster fallbacks)
const CHAPTER_POSTER_TIMES = [0.45, 1.45, 2.45, 4.0, 6.0, 8.1, 10.6, 14.0, 18.2];

function runFfmpeg(args) {
  execFileSync(ffmpegPath, ['-hide_banner', '-y', ...args], { stdio: 'inherit' });
}

function folderBytes(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  return fs
    .readdirSync(dirPath)
    .reduce((sum, f) => sum + fs.statSync(path.join(dirPath, f)).size, 0);
}

function run() {
  if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
    throw new Error('ffmpeg-static binary not found. Run npm install.');
  }
  if (!fs.existsSync(SOURCE_VIDEO)) {
    throw new Error(`Source video not found: ${SOURCE_VIDEO}`);
  }

  fs.mkdirSync(OUT_VIDEO, { recursive: true });
  fs.mkdirSync(OUT_POSTERS, { recursive: true });

  // 1. Progressive WebP frame sequences (desktop, tablet, mobile)
  for (const tier of TIERS) {
    const tierDir = path.join(OUT_FRAMES, tier.id);
    fs.rmSync(tierDir, { recursive: true, force: true });
    fs.mkdirSync(tierDir, { recursive: true });

    console.log(`\n[prepare-assets] Generating ${tier.id} (${tier.width}x${tier.height} @ ${tier.fps}fps)...`);
    const vf = `${DELOGO_FILTER},fps=${tier.fps},scale=${tier.width}:${tier.height}:flags=lanczos,cas=${tier.cas}`;
    runFfmpeg([
      '-i',
      SOURCE_VIDEO,
      '-vf',
      vf,
      '-c:v',
      'libwebp',
      '-quality',
      String(tier.quality),
      '-compression_level',
      '4',
      '-an',
      path.join(tierDir, 'f_%04d.webp'),
    ]);

    const files = fs.readdirSync(tierDir).filter((f) => f.endsWith('.webp'));
    const mb = (folderBytes(tierDir) / (1024 * 1024)).toFixed(2);
    console.log(`  ✓ ${tier.id}: ${files.length} frames, ${mb} MB`);
  }

  // 2. Clean 1080p Concept Film MP4 (CRF 15, faststart)
  const conceptMp4 = path.join(OUT_VIDEO, 'abyssline-concept.mp4');
  console.log('\n[prepare-assets] Encoding Concept Film MP4 (1920x1080, CRF 15)...');
  runFfmpeg([
    '-i',
    SOURCE_VIDEO,
    '-vf',
    `${DELOGO_FILTER},fps=24,scale=1920:1080:flags=lanczos,cas=0.18`,
    '-c:v',
    'libx264',
    '-crf',
    '15',
    '-preset',
    'slow',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    conceptMp4,
  ]);
  const mp4Mb = (fs.statSync(conceptMp4).size / (1024 * 1024)).toFixed(2);
  console.log(`  ✓ abyssline-concept.mp4: ${mp4Mb} MB`);

  // 3. Clean 1080p chapter posters for reduced-motion & modal poster
  console.log('\n[prepare-assets] Extracting 9 chapter poster frames...');
  CHAPTER_POSTER_TIMES.forEach((sec, idx) => {
    const outPoster = path.join(OUT_POSTERS, `ch${idx}.webp`);
    runFfmpeg([
      '-ss',
      String(sec),
      '-i',
      SOURCE_VIDEO,
      '-frames:v',
      '1',
      '-vf',
      `${DELOGO_FILTER},scale=1920:1080:flags=lanczos,cas=0.18`,
      '-c:v',
      'libwebp',
      '-quality',
      '85',
      outPoster,
    ]);
  });
  const postersMb = (folderBytes(OUT_POSTERS) / (1024 * 1024)).toFixed(2);
  console.log(`  ✓ posters: 9 files, ${postersMb} MB`);
}

run();
