interface SurfaceSize { width: number; height: number; ratio: number }
interface DrawingSurface { setDrawingBufferSize(width: number, height: number, ratio: number): void }
interface EffectSurface { setSize(width: number, height: number): void }

// Keep the last complete frame during duplicate or temporarily zero-size layout
// notifications. Assigning canvas.width/height, even unchanged, clears its buffer.
export function createSurfaceResizer(renderer: DrawingSurface, effects: EffectSurface) {
  let previous: SurfaceSize | null = null;
  return (width: number, height: number, deviceRatio: number): SurfaceSize | null => {
    width = Math.floor(width); height = Math.floor(height);
    if (width <= 0 || height <= 0 || !Number.isFinite(width + height)) return null;
    const ratio = Math.min(deviceRatio || 1, width < 700 ? 1.25 : 1.5);
    if (previous?.width === width && previous.height === height && previous.ratio === ratio) return null;
    // Update canvas size and pixel ratio together, once. Composer stays at DPR 1
    // and receives physical pixels to avoid allocating its targets twice.
    renderer.setDrawingBufferSize(width, height, ratio);
    effects.setSize(Math.floor(width * ratio), Math.floor(height * ratio));
    previous = { width, height, ratio };
    return previous;
  };
}

// Watch the entire session, not just the loading/idle frames before audio starts.
// Return true once: quality must never oscillate and repeatedly clear buffers.
export function createQualityMonitor() {
  let previousTime = 0, averageMs = 16, samples = 0, reduced = false;
  return (time: number) => {
    if (reduced || time <= previousTime) return false;
    if (previousTime) {
      averageMs = averageMs * .95 + (time - previousTime) * 1000 * .05;
      samples = Math.min(180, samples + 1);
    }
    previousTime = time;
    if (samples > 90 && averageMs > 29) { reduced = true; return true; }
    return false;
  };
}
