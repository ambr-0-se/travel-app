# PWA Icons Setup

This folder should contain the following icon files for the Progressive Web App:

## Required Icons

- **pwa-192x192.png** - 192x192 pixels (for Android home screen)
- **pwa-512x512.png** - 512x512 pixels (for Android home screen and splash screens)
- **apple-touch-icon.png** - 180x180 pixels (for iOS home screen)
- **favicon.ico** - 32x32 pixels (browser tab icon)

## Generating Icons

### Option 1: Online Tools (Easiest)

1. **PWA Asset Generator:**
   - Visit: https://github.com/onderceylan/pwa-asset-generator
   - Upload a square source image (at least 512x512)
   - Download generated icons

2. **RealFaviconGenerator:**
   - Visit: https://realfavicongenerator.net/
   - Upload your source image
   - Download all formats

### Option 2: Manual Creation

Create a square image (recommended: 512x512 or larger) with your app logo/icon, then resize to the required dimensions using:
- Image editing software (Photoshop, GIMP, etc.)
- Online tools like https://www.iloveimg.com/resize-image
- Command line: `convert source.png -resize 192x192 pwa-192x192.png` (ImageMagick)

## Icon Design Tips

- Use a simple, recognizable design
- Ensure good contrast for visibility
- Test on both light and dark backgrounds
- Keep important elements centered (corners may be rounded on some platforms)

## Note

The app will work without these icons, but they improve the user experience when installing the app to the home screen.

