# Dabarli Brand Identity

Official brand guidelines and logo assets for **Dabarli** — Tunisia’s flexible work and gig marketplace.

**Live site:** [https://dabarli.github.io/dabarli-brand/](https://dabarli.github.io/dabarli-brand/)

## Identity

- **Mark:** two overlapping figures (connection / marketplace)
- **Palette:** green-only — Leaf Deep `#3D9137` (light), Leaf `#51B64A` (dark)
- **Surfaces:** Mist `#F7FBF6` · Night `#121212` · Ink `#1A1A1A`
- **Blue is retired** from the brand system

## Assets

```
svg/                          # Vector masters
png/                          # Transparent + composited PNGs @ 256 / 512 / 1024
jpg/                          # Solid-background JPGs @ 256 / 512 / 1024
```

Naming: `dabarli-[asset]-[variant]-[size].[format]`

Examples:
- `png/dabarli-mark-light-1024.png` — transparent mark
- `jpg/dabarli-profile-dark-1024.jpg` — social profile square
- `png/dabarli-lockup-horizontal-light-512.png` — horizontal lockup
- `svg/dabarli-lockup-horizontal-ar-light.svg` — Arabic horizontal (outlined دبرلي)
- `svg/dabarli-lockup-stacked-ar-dark.svg` — Arabic stacked splash

Type: **Syne** (display) · **Manrope** (Latin) · **Cairo** (Arabic)

## Generate rasters

Place `NotoSansArabic-Bold.ttf` in `scripts/tmp-brand/` first (for Arabic path outlining), then:

```bash
npm install
npm run generate
```

## Local preview

```bash
cd dabarli-brand
python -m http.server 8080
# open http://localhost:8080
```

## License

Brand assets © Dabarli. Public for partner and product use under Dabarli brand rules on the guidelines site.
