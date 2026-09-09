import atlasUrl from '../../../assets/concert/performance-atlas.png';

let artwork: Promise<HTMLCanvasElement> | undefined;

/** Decode the production sprite sheet once, removing its green-screen matte. */
export function loadPerformerArtwork() {
  if (artwork) return artwork;
  artwork = new Promise<HTMLCanvasElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(image, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = pixels.data;
        keyStageArtwork(data);
        ctx.putImageData(pixels, 0, 0);
        resolve(canvas);
      } catch (error) { artwork = undefined; reject(error); }
    };
    image.onerror = () => { artwork = undefined; reject(new Error('Concert character artwork could not load')); };
    image.src = atlasUrl;
  });
  return artwork;
}

export function performerCell(index: number) {
  return { x: index % 4 / 4, y: Math.floor(index / 4) / 2, width: 1 / 4, height: 1 / 2 };
}

export function keyStageArtwork(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const excess = data[i + 1] - Math.max(data[i], data[i + 2]);
    // The dark green microphone is retained; only bright key green is cut.
    if (data[i + 1] > 100 && excess > 35) {
      const matte = Math.min(1, Math.max(0, (excess - 35) / 85));
      data[i + 3] = Math.round(255 * (1 - matte));
      data[i + 1] = Math.min(data[i + 1], Math.max(data[i], data[i + 2]) + 12);
    }
  }
}
