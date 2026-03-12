# Images Folder

## How to Add the Surveyor Background Image

1. Save the surveyor image you provided as `surveyor-bg.jpg` in this folder
2. The image will automatically be used as the landing page background
3. The path is already configured in the code: `/images/surveyor-bg.jpg`

## Image Requirements

- **Filename:** `surveyor-bg.jpg` (or `surveyor-bg.png`)
- **Recommended size:** 1920x1080 or larger
- **Format:** JPG or PNG
- **Location:** `frontend/public/images/surveyor-bg.jpg`

## Current Setup

The landing page is configured to:
- Display the image as a full-screen background
- Apply a slow zoom animation (20s cycle)
- Add a dark overlay for text readability
- Include floating geometric shapes
- Show animated patterns

## If Image Doesn't Show

1. Check the filename matches exactly: `surveyor-bg.jpg`
2. Make sure the image is in the correct folder: `frontend/public/images/`
3. Refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser console for any errors

## Alternative Image Formats

If you want to use PNG instead of JPG, update the code in `LandingPage.tsx`:

```typescript
backgroundImage: "url('E:\real estate\frontend\public\images\ba.jpg')"
```
