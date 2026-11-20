import { describe, expect, it } from 'vitest';
import { analyzeAutoAdjustments } from './auto';

function grayscalePhoto(value: number, count = 64): HTMLCanvasElement {
  const data = new Uint8ClampedArray(count * 4);
  for (let i = 0; i < count; i++) {
    const offset = i * 4;
    data[offset] = value;
    data[offset + 1] = value;
    data[offset + 2] = value;
    data[offset + 3] = 255;
  }
  return {
    width: count,
    height: 1,
    getContext: () => ({ getImageData: () => ({ data }) }),
  } as unknown as HTMLCanvasElement;
}

describe('automatic tone analysis', () => {
  it('lifts an underexposed image with a restrained correction', () => {
    const adjustments = analyzeAutoAdjustments(grayscalePhoto(50));
    expect(adjustments.exposure).toBe(28);
    expect(adjustments.shadows).toBe(0);
    expect(adjustments.highlights).toBe(0);
  });

  it('protects highlights and limits exposure changes for a bright image', () => {
    const adjustments = analyzeAutoAdjustments(grayscalePhoto(250));
    expect(adjustments.exposure).toBe(-28);
    expect(adjustments.highlights).toBe(-8);
  });
});
