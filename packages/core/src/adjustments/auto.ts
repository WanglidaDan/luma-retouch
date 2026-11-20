import type { Adjustments } from './types';

/** Analyses image luminance and returns restrained, reversible tone corrections for a new photo. */
export function analyzeAutoAdjustments(canvas: HTMLCanvasElement): Partial<Adjustments> {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Could not analyse the photo pixels.');
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = data.length / 4;
  const stride = Math.max(1, Math.ceil(pixels / 65_536));
  const histogram = new Uint32Array(256);
  let samples = 0;
  for (let p = 0; p < pixels; p += stride) {
    const i = p * 4;
    const luminance = Math.round(0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]!);
    histogram[luminance] = histogram[luminance]! + 1;
    samples++;
  }
  const percentile = (fraction: number): number => {
    const target = Math.ceil(samples * fraction);
    let total = 0;
    for (let i = 0; i < histogram.length; i++) {
      total += histogram[i]!;
      if (total >= target) return i / 255;
    }
    return 0.5;
  };
  const median = percentile(0.5);
  const shadows = percentile(0.12);
  const highlights = percentile(0.92);
  const exposure = Math.round(
    Math.max(-28, Math.min(28, 50 * Math.log2(0.44 / Math.max(median, 0.05)))),
  );
  const shadowLift = shadows < 0.14 ? Math.min(12, Math.round((0.14 - shadows) * 100)) : 0;
  const highlightRecovery =
    highlights > 0.9 ? -Math.min(14, Math.round((highlights - 0.9) * 100)) : 0;
  return { exposure, shadows: shadowLift, highlights: highlightRecovery };
}
