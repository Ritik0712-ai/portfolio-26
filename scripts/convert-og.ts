import sharp from 'sharp';
import fs from 'fs';

const svg = fs.readFileSync('public/og-image.svg', 'utf-8');

sharp(Buffer.from(svg))
  .resize(1200, 630)
  .png()
  .toFile('public/og-default.png')
  .then(() => console.log('Created og-default.png'))
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
