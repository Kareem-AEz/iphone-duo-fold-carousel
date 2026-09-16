/** The frame in `your-photos.tsx` at its widest, two 14rem panels, on a 3x screen. */
const FRAME = { width: 1344, height: 672 };

/**
 * Crops a picked photo to the frame's 2:1 around its center and shrinks it to the frame, on
 * the device, then returns it as a JPEG blob. A fold paints each slide about ten times, so a
 * full-size phone photo lags. Rejects when the browser can't decode the file, like HEIC in
 * Chrome.
 */
export async function downscaleImage(file: File) {
  const bitmap = await createImageBitmap(file);
  // The frame crops with `object-cover` anyway, so rows it would hide are never kept.
  const cropWidth = Math.min(bitmap.width, bitmap.height * 2);
  const cropHeight = cropWidth / 2;
  const width = Math.round(Math.min(FRAME.width, cropWidth));
  const canvas = new OffscreenCanvas(width, Math.round(width / 2));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is not available");

  context.drawImage(
    bitmap,
    (bitmap.width - cropWidth) / 2,
    (bitmap.height - cropHeight) / 2,
    cropWidth,
    cropHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  bitmap.close();
  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 });
}
