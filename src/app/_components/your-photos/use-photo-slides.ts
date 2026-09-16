import { useEffect, useState } from "react";

import { downscaleImage } from "@/app/_components/your-photos/downscale-image.utils";

const MIN_PHOTOS = 2;
const MAX_PHOTOS = 8;

type Photos = {
  /** Changes with every new set, so the carousel can remount and check readiness again. */
  id: number;
  urls: string[];
};

/**
 * Turns picked files into local `blob:` URLs. Nothing is uploaded: each file is shrunk in the
 * browser and kept in this tab's memory. Returns the current photos, or `null` before any are
 * picked, plus `pick` and `reset`.
 */
export function usePhotoSlides() {
  const [photos, setPhotos] = useState<Photos | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Frees a set's memory once it is replaced, reset, or the section unmounts.
  useEffect(() => {
    if (!photos) return;
    return () => photos.urls.forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);

  async function pick(files: File[]) {
    if (files.length < MIN_PHOTOS || files.length > MAX_PHOTOS) {
      setError(`Pick between ${MIN_PHOTOS} and ${MAX_PHOTOS} photos.`);
      return;
    }

    setPreparing(true);
    setError(null);
    try {
      const blobs = await Promise.all(files.map(downscaleImage));
      const urls = blobs.map((blob) => URL.createObjectURL(blob));
      setPhotos((previous) => ({ id: (previous?.id ?? 0) + 1, urls }));
    } catch {
      setError(
        "One of those photos can't be opened here. Try JPG, PNG, or WebP.",
      );
    } finally {
      setPreparing(false);
    }
  }

  function reset() {
    setPhotos(null);
    setError(null);
  }

  return { photos, preparing, error, pick, reset };
}
