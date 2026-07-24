/**
 * Generate sized PNG/JPG downloads from brand SVGs.
 * Usage: node scripts/generate-rasters.js
 */
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SVG = path.join(ROOT, "svg");
const PNG = path.join(ROOT, "png");
const JPG = path.join(ROOT, "jpg");

const SIZES = [256, 512, 1024];
const PROFILE_SIZES = [512, 1024];

const COLORS = {
  mist: "#F7FBF6",
  paper: "#FFFFFF",
  night: "#121212",
  leaf: "#51B64A",
  leafDeep: "#3D9137",
  ink: "#1A1A1A",
};

function ensureDirs() {
  for (const d of [PNG, JPG]) {
    fs.mkdirSync(d, { recursive: true });
  }
}

function readSvg(name) {
  return fs.readFileSync(path.join(SVG, name), "utf8");
}

function renderSvgToPngBuffer(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    background: "rgba(0,0,0,0)",
  });
  return resvg.render().asPng();
}

async function writePng(name, buffer) {
  const out = path.join(PNG, name);
  await sharp(buffer).png().toFile(out);
  console.log("png", name);
}

async function writeJpg(name, buffer, quality = 92) {
  const out = path.join(JPG, name);
  await sharp(buffer).jpeg({ quality, mozjpeg: true }).toFile(out);
  console.log("jpg", name);
}

/** Transparent mark / icon at multiple widths */
async function exportTransparent(svgFile, baseName, sizes = SIZES) {
  const svg = readSvg(svgFile);
  for (const size of sizes) {
    const buf = renderSvgToPngBuffer(svg, size);
    await writePng(`${baseName}-${size}.png`, buf);
  }
}

/** Square profile / social image with solid background + centered mark */
async function exportProfile({
  svgFile,
  baseName,
  bg,
  markWidthRatio = 0.58,
  sizes = PROFILE_SIZES,
  asJpg = true,
}) {
  const svg = readSvg(svgFile);
  for (const size of sizes) {
    const markW = Math.round(size * markWidthRatio);
    const markPng = renderSvgToPngBuffer(svg, markW);
    const canvas = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: bg,
      },
    })
      .composite([{ input: markPng, gravity: "centre" }])
      .png()
      .toBuffer();

    await writePng(`${baseName}-${size}.png`, canvas);
    if (asJpg) {
      const jpgBuf = await sharp(canvas).jpeg({ quality: 92, mozjpeg: true }).toBuffer();
      await writeJpg(`${baseName}-${size}.jpg`, jpgBuf);
    }
  }
}

/** Horizontal lockup: mark + wordmark text drawn via SVG (no external font dependency) */
function buildLockupSvg({ markFill, textFill, markSvgPath }) {
  // Inline the mark path from a known mark SVG
  const markSrc = readSvg(markSvgPath);
  const pathMatch = markSrc.match(/<path[^>]*\sd="([^"]+)"/);
  if (!pathMatch) throw new Error(`No path in ${markSvgPath}`);
  const d = pathMatch[1];

  // Geometric wordmark approximation using SVG text with generic sans (resvg default)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="840" height="200" viewBox="0 0 840 200">
  <g transform="translate(24, 28) scale(1.45)" fill="${markFill}">
    <path d="${d}"/>
  </g>
  <text x="250" y="128" font-family="Arial, Helvetica, sans-serif" font-size="92" font-weight="700" fill="${textFill}" letter-spacing="-1.5">Dabarli</text>
</svg>`;
}

async function exportLockup(baseName, markSvgPath, markFill, textFill, sizes = SIZES) {
  const svg = buildLockupSvg({ markFill, textFill, markSvgPath });
  for (const size of sizes) {
    // size = target width
    const buf = renderSvgToPngBuffer(svg, size);
    await writePng(`${baseName}-${size}.png`, buf);

    // JPG needs opaque background
    const meta = await sharp(buf).metadata();
    const bg = textFill.toLowerCase() === "#ffffff" ? COLORS.night : COLORS.mist;
    const jpgCanvas = await sharp({
      create: {
        width: meta.width,
        height: meta.height,
        channels: 3,
        background: bg,
      },
    })
      .composite([{ input: buf, gravity: "centre" }])
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();
    await writeJpg(`${baseName}-${size}.jpg`, jpgCanvas);
  }
}

async function main() {
  ensureDirs();

  // Transparent marks
  await exportTransparent("dabarli-symbol-light.svg", "dabarli-mark-light");
  await exportTransparent("dabarli-symbol-dark.svg", "dabarli-mark-dark");
  await exportTransparent("dabarli-mark-mono.svg", "dabarli-mark-mono");
  await exportTransparent("dabarli-mark-white.svg", "dabarli-mark-white");
  await exportTransparent("dabarli-mark-on-leaf.svg", "dabarli-mark-on-leaf");
  await exportTransparent("dabarli-mark.svg", "dabarli-mark"); // currentColor may render black
  await exportTransparent("dabarli-favicon.svg", "dabarli-favicon", [32, 64, 128, 256]);
  await exportTransparent("dabarli-app-icon.svg", "dabarli-app-icon", PROFILE_SIZES);

  // Lockups
  await exportLockup(
    "dabarli-lockup-horizontal-light",
    "dabarli-symbol-light.svg",
    COLORS.leafDeep,
    COLORS.leafDeep
  );
  await exportLockup(
    "dabarli-lockup-horizontal-dark",
    "dabarli-symbol-dark.svg",
    COLORS.leaf,
    "#FFFFFF"
  );

  // Social / profile squares
  await exportProfile({
    svgFile: "dabarli-symbol-dark.svg",
    baseName: "dabarli-profile-dark",
    bg: COLORS.night,
  });
  await exportProfile({
    svgFile: "dabarli-symbol-light.svg",
    baseName: "dabarli-profile-light",
    bg: COLORS.mist,
  });
  await exportProfile({
    svgFile: "dabarli-mark-on-leaf.svg",
    baseName: "dabarli-profile-leaf",
    bg: COLORS.leafDeep,
  });
  await exportProfile({
    svgFile: "dabarli-symbol-dark.svg",
    baseName: "dabarli-app-icon-flat",
    bg: COLORS.night,
    markWidthRatio: 0.58,
  });

  // Stacked lockup (square-ish vertical)
  for (const size of PROFILE_SIZES) {
    const markW = Math.round(size * 0.42);
    const markPng = renderSvgToPngBuffer(readSvg("dabarli-symbol-light.svg"), markW);
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="${COLORS.mist}"/>
  <text x="50%" y="${Math.round(size * 0.72)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(size * 0.11)}" font-weight="700" fill="${COLORS.leafDeep}">Dabarli</text>
</svg>`;
    const textLayer = renderSvgToPngBuffer(svg, size);
    const stacked = await sharp(textLayer)
      .composite([{ input: markPng, top: Math.round(size * 0.22), left: Math.round((size - markW) / 2) }])
      .png()
      .toBuffer();
    await writePng(`dabarli-lockup-stacked-light-${size}.png`, stacked);
    await writeJpg(
      `dabarli-lockup-stacked-light-${size}.jpg`,
      await sharp(stacked).jpeg({ quality: 92 }).toBuffer()
    );

    const markDark = renderSvgToPngBuffer(readSvg("dabarli-symbol-dark.svg"), markW);
    const svgDark = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="${COLORS.night}"/>
  <text x="50%" y="${Math.round(size * 0.72)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(size * 0.11)}" font-weight="700" fill="#FFFFFF">Dabarli</text>
</svg>`;
    const textDark = renderSvgToPngBuffer(svgDark, size);
    const stackedDark = await sharp(textDark)
      .composite([{ input: markDark, top: Math.round(size * 0.22), left: Math.round((size - markW) / 2) }])
      .png()
      .toBuffer();
    await writePng(`dabarli-lockup-stacked-dark-${size}.png`, stackedDark);
    await writeJpg(
      `dabarli-lockup-stacked-dark-${size}.jpg`,
      await sharp(stackedDark).jpeg({ quality: 92 }).toBuffer()
    );
  }

  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
