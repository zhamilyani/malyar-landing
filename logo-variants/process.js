const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname);

(async () => {
  const img = await loadImage(path.join(dir, 'original.png'));
  const w = img.width, h = img.height;
  console.log(`Image: ${w}x${h}`);

  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // === Version 2: original colors, just transparent background ===
  const canvas2 = createCanvas(w, h);
  const ctx2 = canvas2.getContext('2d');
  ctx2.drawImage(img, 0, 0);
  const imageData2 = ctx2.getImageData(0, 0, w, h);
  const data2 = imageData2.data;

  for (let i = 0; i < data2.length; i += 4) {
    const r = data2[i], g = data2[i+1], b = data2[i+2], a = data2[i+3];
    if (r > 235 && g > 235 && b > 235 && a > 200) {
      data2[i+3] = 0;
      continue;
    }
    if (r > 215 && g > 215 && b > 215 && a > 200) {
      const brightness = (r + g + b) / 3;
      data2[i+3] = Math.max(0, Math.round(255 - (brightness - 215) * 6));
    }
  }
  ctx2.putImageData(imageData2, 0, 0);
  const buffer2 = canvas2.toBuffer('image/png');
  fs.writeFileSync(path.join(dir, 'logo-original-transparent.png'), buffer2);
  console.log('Saved logo-original-transparent.png');

  // === Version 1: gold + text ===
  // Gold target: #c9a84c = rgb(201, 168, 76)
  const goldR = 201, goldG = 168, goldB = 76;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];

    // 1. White/near-white background -> transparent
    if (r > 235 && g > 235 && b > 235 && a > 200) {
      data[i+3] = 0;
      continue;
    }

    // 2. Light gray near white -> semi-transparent (anti-alias)
    if (r > 215 && g > 215 && b > 215 && a > 200) {
      const brightness = (r + g + b) / 3;
      data[i+3] = Math.max(0, Math.round(255 - (brightness - 215) * 6));
      continue;
    }

    // 3. Pure reds (high R, low G, low B) -> Gold
    if (r > 140 && g < 90 && b < 90) {
      const intensity = r / 255;
      data[i] = Math.round(goldR * intensity);
      data[i+1] = Math.round(goldG * intensity);
      data[i+2] = Math.round(goldB * intensity);
      continue;
    }

    // 4. Orange/warm tones -> warmer gold
    if (r > 180 && g > 60 && g < 190 && b < 80) {
      const intensity = r / 255;
      const gRatio = g / r;
      data[i] = Math.min(255, Math.round(goldR * intensity));
      data[i+1] = Math.min(255, Math.round(goldG * intensity * (0.8 + gRatio * 0.4)));
      data[i+2] = Math.min(255, Math.round(goldB * intensity * 0.7));
      continue;
    }

    // 5. Pinkish/light red halftone -> light gold
    if (r > 200 && g > 120 && g < 210 && b > 80 && b < 180 && r > g && r > b) {
      const intensity = r / 255;
      data[i] = Math.min(255, Math.round(goldR * intensity));
      data[i+1] = Math.min(255, Math.round(goldG * intensity));
      data[i+2] = Math.min(255, Math.round(goldB * intensity * 1.2));
      continue;
    }

    // 6. Yellow halftone dots (r>200, g>150, b<100) -> gold halftone
    if (r > 200 && g > 140 && g < 220 && b < 100) {
      const intensity = (r + g) / (255 * 2);
      data[i] = Math.min(255, Math.round(goldR * intensity * 1.3));
      data[i+1] = Math.min(255, Math.round(goldG * intensity * 1.3));
      data[i+2] = Math.min(255, Math.round(goldB * intensity * 1.1));
      continue;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Add text on the panel (right side, on the wooden panel itself)
  const fontSize = Math.round(h * 0.07);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textX = w * 0.80;
  const textY = h * 0.47;

  ctx.translate(textX, textY);

  // Shadow for readability
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  // "malyarka" - dark text on panel
  ctx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = '#1a1208';
  ctx.fillText('malyarka', 0, -fontSize * 0.58);

  // "pro.kz" - darker gold text
  ctx.fillStyle = '#6B4F10';
  ctx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
  ctx.fillText('pro.kz', 0, fontSize * 0.52);

  ctx.restore();

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(dir, 'logo-final.png'), buffer);
  console.log('Done! Saved logo-final.png');

  // === Version 3: original red spray, but gun is silver/light gray, transparent bg ===
  const canvas3 = createCanvas(w, h);
  const ctx3 = canvas3.getContext('2d');
  ctx3.drawImage(img, 0, 0);
  const imageData3 = ctx3.getImageData(0, 0, w, h);
  const d3 = imageData3.data;

  for (let i = 0; i < d3.length; i += 4) {
    const r = d3[i], g = d3[i+1], b = d3[i+2], a = d3[i+3];

    // White bg -> transparent
    if (r > 235 && g > 235 && b > 235 && a > 200) {
      d3[i+3] = 0;
      continue;
    }
    // Near-white anti-alias
    if (r > 215 && g > 215 && b > 215 && a > 200) {
      const brightness = (r + g + b) / 3;
      d3[i+3] = Math.max(0, Math.round(255 - (brightness - 215) * 6));
      continue;
    }

    // Dark/black pixels (the gun body) -> silver/light gray
    // Gun is dark: low R, low G, low B (all < 80-100), roughly equal (not colored)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max > 0 ? (max - min) / max : 0;

    // Near-black to dark gray, low saturation = gun metal
    if (max < 120 && saturation < 0.3) {
      // Map dark (0-120) to silver range (160-220)
      const lightness = (r + g + b) / 3;
      const silver = Math.round(160 + (lightness / 120) * 60);
      d3[i] = Math.min(230, silver + 5);   // slight warm tint
      d3[i+1] = Math.min(228, silver + 3);
      d3[i+2] = Math.min(235, silver + 8); // slight cool/blue tint for metallic
      continue;
    }

    // Medium gray (gun highlights, already lighter parts) -> lighter silver
    if (max < 180 && max >= 120 && saturation < 0.25) {
      const lightness = (r + g + b) / 3;
      const silver = Math.round(190 + (lightness / 180) * 40);
      d3[i] = Math.min(240, silver + 3);
      d3[i+1] = Math.min(238, silver + 1);
      d3[i+2] = Math.min(242, silver + 5);
      continue;
    }
  }

  ctx3.putImageData(imageData3, 0, 0);
  const buffer3 = canvas3.toBuffer('image/png');
  fs.writeFileSync(path.join(dir, 'logo-silver.png'), buffer3);
  console.log('Saved logo-silver.png');
})();
