/**
 * Outlined Arabic lockups (دبرلي) — font-independent SVG masters.
 * Usage: node scripts/generate-ar-lockups.js
 */
const fs = require("fs")
const path = require("path")
const fontkit = require("fontkit")

const ROOT = path.join(__dirname, "..")
const SVG = path.join(ROOT, "svg")
const FONT = path.join(__dirname, "tmp-brand", "NotoSansArabic-Bold.ttf")

const WORDMARK = "دبرلي"
const MARK_PATH =
  "M43.19,87.60 C43.76,76.71 47.53,68.63 55.57,61.02 C61.97,54.97 62.02,55.08 51.50,51.79 C43.42,49.27 32.60,48.91 26.50,50.96 C12.36,55.73 4.00,69.34 4.00,87.59 L4.00,96.00 L23.37,96.00 L42.75,96.00 L43.19,87.60 Z M81.82,87.25 C81.34,77.24 78.65,70.99 72.02,64.51 C68.35,60.93 68.16,60.87 65.37,62.33 C61.30,64.47 55.60,70.73 52.94,76.00 C51.37,79.10 50.53,82.90 50.21,88.25 L49.74,96.00 L65.99,96.00 L82.24,96.00 L81.82,87.25 Z M126.00,87.16 C126.00,82.30 125.37,76.21 124.59,73.64 C121.33,62.79 112.42,53.40 102.60,50.46 C95.01,48.19 83.59,48.43 76.70,51.01 C73.57,52.18 71.00,53.30 71.00,53.49 C71.00,53.68 73.62,56.46 76.81,59.67 C85.26,68.14 88.32,75.02 88.83,86.69 L89.24,96.00 L107.62,96.00 L126.00,96.00 L126.00,87.16 Z M42.28,42.94 C46.56,41.75 52.44,36.99 54.47,33.07 C58.17,25.90 57.10,17.47 51.72,11.33 C45.86,4.66 37.65,2.45 30.22,5.55 C16.50,11.28 13.21,27.26 23.59,37.65 C29.37,43.43 34.89,44.99 42.28,42.94 Z M102.10,41.43 C108.07,38.38 113.02,29.99 112.97,23.00 C112.95,19.77 109.87,13.15 106.98,10.14 C105.73,8.84 102.86,6.93 100.61,5.91 C87.95,0.16 74.00,9.65 74.00,24.00 C74.00,38.57 89.23,48.02 102.10,41.43 Z"

const COLORS = {
  leaf: "#51B64A",
  leafDeep: "#3D9137",
  night: "#121212",
  mist: "#F7FBF6",
  white: "#FFFFFF",
}

function buildWordmarkPath(font, text, fontSize) {
  const run = font.layout(text)
  const scale = fontSize / font.unitsPerEm
  const parts = []
  let x = 0
  for (const glyph of run.glyphs) {
    const d = glyph.path.scale(scale, -scale).translate(x, 0).toSVG()
    if (d) parts.push(d)
    x += glyph.advanceWidth * scale
  }
  return { d: parts.join(""), width: x }
}

function write(fileName, contents) {
  const out = path.join(SVG, fileName)
  fs.writeFileSync(out, contents, "utf8")
  console.log("wrote", fileName)
}

function writeHorizontal(font, markFill, textFill, fileName) {
  const word = buildWordmarkPath(font, WORDMARK, 48)
  const markGap = 22
  const markWidth = 126
  const paddingX = 4
  const viewH = 100
  const baselineY = 68
  const textX = paddingX + markWidth + markGap
  const viewW = Math.ceil(textX + word.width + paddingX)

  write(
    fileName,
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}" role="img" aria-label="${WORDMARK}">
  <title>${WORDMARK}</title>
  <g fill="${markFill}">
    <path d="${MARK_PATH}"/>
  </g>
  <g fill="${textFill}" transform="translate(${textX}, ${baselineY})">
    <path d="${word.d}"/>
  </g>
</svg>
`,
  )
}

function writeStacked(font, bg, markFill, textFill, accent, fileName) {
  const word = buildWordmarkPath(font, WORDMARK, 56)
  const size = 512
  const markW = 180
  const markScale = markW / 130
  const markX = (size - markW) / 2
  const markY = 118
  const textX = (size - word.width) / 2
  const textY = 360
  const accentW = 48
  const accentX = (size - accentW) / 2

  write(
    fileName,
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="${WORDMARK}">
  <title>${WORDMARK}</title>
  <rect width="${size}" height="${size}" fill="${bg}"/>
  <g transform="translate(${markX}, ${markY}) scale(${markScale})" fill="${markFill}">
    <path d="${MARK_PATH}"/>
  </g>
  <g fill="${textFill}" transform="translate(${textX}, ${textY})">
    <path d="${word.d}"/>
  </g>
  <rect x="${accentX}" y="390" width="${accentW}" height="4" rx="2" fill="${accent}"/>
</svg>
`,
  )
}

const font = fontkit.openSync(FONT)

writeHorizontal(font, COLORS.leafDeep, COLORS.leafDeep, "dabarli-lockup-horizontal-ar-light.svg")
writeHorizontal(font, COLORS.leaf, COLORS.white, "dabarli-lockup-horizontal-ar-dark.svg")
writeStacked(
  font,
  COLORS.night,
  COLORS.leaf,
  COLORS.white,
  COLORS.leaf,
  "dabarli-lockup-stacked-ar-dark.svg",
)
writeStacked(
  font,
  COLORS.mist,
  COLORS.leafDeep,
  COLORS.leafDeep,
  COLORS.leafDeep,
  "dabarli-lockup-stacked-ar-light.svg",
)

console.log("done")
