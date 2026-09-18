import type { EFFECT_IDS } from '../render/shaders/effects';

/** Identifier of a creative effect. */
export type EffectId = keyof typeof EFFECT_IDS;

/** Blur focus shapes for the Blur / Bokeh tool. */
export type BlurShape = 'whole' | 'radial' | 'linear';

/** Live settings of the active creative effect. Only one effect is active at a time (like Meitu). */
export interface EffectSettings {
  id: EffectId;
  /** Main strength 0..100. */
  amount: number;
  /** Secondary parameter 0..100 (meaning depends on the effect, see `paramLabel`). */
  param: number;
  /** Focus centre in 0..1 image coordinates (blur, swirl). */
  centerX: number;
  centerY: number;
  /** Angle in degrees for the linear blur band. */
  angle: number;
  shape: BlurShape;
}

/** UI metadata for one effect. */
export interface EffectDefinition {
  id: EffectId;
  name: string;
  description: string;
  amountLabel: string;
  /** Label for the secondary slider; omit when the effect has none. */
  paramLabel?: string;
  /** Effects that let the user tap the image to move the focus centre. */
  hasCenter?: boolean;
  /** Effects that use the large blur texture. */
  needsBlur?: boolean;
  defaultAmount: number;
  defaultParam: number;
}

/** Neutral settings for an effect id. */
export function defaultEffectSettings(id: EffectId): EffectSettings {
  const def = EFFECT_DEFINITIONS.find((e) => e.id === id);
  return {
    id,
    amount: def?.defaultAmount ?? 50,
    param: def?.defaultParam ?? 50,
    centerX: 0.5,
    centerY: 0.5,
    angle: 0,
    shape: 'whole',
  };
}

/** Every creative effect shown in the Effects panel (blur is exposed through its own Blur tool too). */
export const EFFECT_DEFINITIONS: readonly EffectDefinition[] = [
  {
    id: 'blur',
    name: 'Blur / Bokeh',
    description: 'Soften the whole image or keep a sharp circle or band in focus.',
    amountLabel: 'Blur',
    paramLabel: 'Focus size',
    hasCenter: true,
    needsBlur: true,
    defaultAmount: 60,
    defaultParam: 40,
  },
  {
    id: 'bloom',
    name: 'Bloom',
    description: 'Dreamy glow spreading from bright areas.',
    amountLabel: 'Glow',
    paramLabel: 'Threshold',
    needsBlur: true,
    defaultAmount: 50,
    defaultParam: 50,
  },
  {
    id: 'glow',
    name: 'Soft Glow',
    description: 'Gentle soft-focus haze over the whole photo.',
    amountLabel: 'Amount',
    needsBlur: true,
    defaultAmount: 50,
    defaultParam: 50,
  },
  {
    id: 'vignetteBlur',
    name: 'Edge Blur',
    description: 'Keeps the centre sharp and blurs towards the corners.',
    amountLabel: 'Amount',
    needsBlur: true,
    defaultAmount: 60,
    defaultParam: 50,
  },
  {
    id: 'pixelate',
    name: 'Pixelate',
    description: 'Blocky mosaic over the whole picture.',
    amountLabel: 'Block size',
    defaultAmount: 30,
    defaultParam: 50,
  },
  {
    id: 'rgbSplit',
    name: 'RGB Split',
    description: 'Offsets the red and blue channels sideways.',
    amountLabel: 'Offset',
    defaultAmount: 40,
    defaultParam: 50,
  },
  {
    id: 'chromatic',
    name: 'Chromatic',
    description: 'Lens-style colour fringing that grows towards the edges.',
    amountLabel: 'Amount',
    defaultAmount: 50,
    defaultParam: 50,
  },
  {
    id: 'glitch',
    name: 'Glitch',
    description: 'Broken-signal slices with colour tearing.',
    amountLabel: 'Intensity',
    paramLabel: 'Slices',
    defaultAmount: 50,
    defaultParam: 40,
  },
  {
    id: 'vhs',
    name: 'VHS',
    description: 'Scanlines, noise and colour bleed like an old tape.',
    amountLabel: 'Amount',
    defaultAmount: 60,
    defaultParam: 50,
  },
  {
    id: 'halftone',
    name: 'Halftone',
    description: 'Newspaper-style dot pattern.',
    amountLabel: 'Amount',
    paramLabel: 'Dot size',
    defaultAmount: 100,
    defaultParam: 60,
  },
  {
    id: 'dotScreen',
    name: 'Dot Screen',
    description: 'Comic-book dots layered over the colours.',
    amountLabel: 'Amount',
    paramLabel: 'Dot size',
    defaultAmount: 70,
    defaultParam: 60,
  },
  {
    id: 'crossHatch',
    name: 'Cross Hatch',
    description: 'Pen-and-ink hatching in the shadows.',
    amountLabel: 'Amount',
    paramLabel: 'Line spacing',
    defaultAmount: 100,
    defaultParam: 50,
  },
  {
    id: 'sketch',
    name: 'Sketch',
    description: 'Pencil outline drawing.',
    amountLabel: 'Amount',
    paramLabel: 'Line strength',
    defaultAmount: 100,
    defaultParam: 50,
  },
  {
    id: 'emboss',
    name: 'Emboss',
    description: 'Raised, carved-metal look.',
    amountLabel: 'Amount',
    defaultAmount: 100,
    defaultParam: 50,
  },
  {
    id: 'oilPaint',
    name: 'Oil Paint',
    description: 'Painterly smoothing of textures.',
    amountLabel: 'Brush size',
    defaultAmount: 50,
    defaultParam: 50,
  },
  {
    id: 'posterize',
    name: 'Posterize',
    description: 'Reduces colours to flat bands.',
    amountLabel: 'Amount',
    defaultAmount: 60,
    defaultParam: 50,
  },
  {
    id: 'solarize',
    name: 'Solarize',
    description: 'Partially inverts the brightest tones.',
    amountLabel: 'Amount',
    defaultAmount: 50,
    defaultParam: 50,
  },
  {
    id: 'threshold',
    name: 'Threshold',
    description: 'Pure black and white stencil.',
    amountLabel: 'Amount',
    paramLabel: 'Level',
    defaultAmount: 100,
    defaultParam: 50,
  },
  {
    id: 'invert',
    name: 'Invert',
    description: 'Negative image.',
    amountLabel: 'Amount',
    defaultAmount: 100,
    defaultParam: 50,
  },
  {
    id: 'kaleidoscope',
    name: 'Kaleidoscope',
    description: 'Mirrors the image into symmetric wedges.',
    amountLabel: 'Amount',
    paramLabel: 'Segments',
    defaultAmount: 100,
    defaultParam: 30,
  },
  {
    id: 'mirror',
    name: 'Mirror',
    description: 'Reflects one half onto the other.',
    amountLabel: 'Amount',
    paramLabel: 'Axis',
    defaultAmount: 100,
    defaultParam: 0,
  },
  {
    id: 'swirl',
    name: 'Swirl',
    description: 'Twists the image around a point you can tap.',
    amountLabel: 'Twist',
    paramLabel: 'Radius',
    hasCenter: true,
    defaultAmount: 40,
    defaultParam: 50,
  },
  {
    id: 'fisheye',
    name: 'Fisheye',
    description: 'Bulging wide-angle lens.',
    amountLabel: 'Amount',
    defaultAmount: 60,
    defaultParam: 50,
  },
  {
    id: 'frostedGlass',
    name: 'Frosted Glass',
    description: 'Looks like the photo is behind textured glass.',
    amountLabel: 'Amount',
    defaultAmount: 50,
    defaultParam: 50,
  },
];

/** Looks up an effect definition; undefined for unknown ids. */
export function findEffect(id: string): EffectDefinition | undefined {
  return EFFECT_DEFINITIONS.find((e) => e.id === id);
}
