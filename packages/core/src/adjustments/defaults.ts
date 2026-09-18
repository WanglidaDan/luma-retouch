import type {
  AdjustmentDefinition,
  Adjustments,
  Curves,
  HslAdjustment,
  HslBand,
  ScalarAdjustmentKey,
} from './types';

/** The eight HSL bands in colour-wheel order. */
export const HSL_BANDS: readonly HslBand[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'aqua',
  'blue',
  'purple',
  'magenta',
];

/** Centre hue (degrees) of each HSL band. Used by the shader to weight adjustments. */
export const HSL_BAND_HUES: Record<HslBand, number> = {
  red: 0,
  orange: 30,
  yellow: 60,
  green: 120,
  aqua: 180,
  blue: 240,
  purple: 280,
  magenta: 320,
};

/** A straight identity curve (no change). */
export const IDENTITY_CURVE = (): { x: number; y: number }[] => [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
];

/** Fresh identity curves for all four channels. */
export function defaultCurves(): Curves {
  return {
    rgb: IDENTITY_CURVE(),
    red: IDENTITY_CURVE(),
    green: IDENTITY_CURVE(),
    blue: IDENTITY_CURVE(),
  };
}

/** Fresh zeroed HSL adjustment for every band. */
export function defaultHsl(): Record<HslBand, HslAdjustment> {
  const out = {} as Record<HslBand, HslAdjustment>;
  for (const band of HSL_BANDS) out[band] = { hue: 0, saturation: 0, luminance: 0 };
  return out;
}

/** Returns a brand-new `Adjustments` object with every parameter at its neutral value. */
export function defaultAdjustments(): Adjustments {
  return {
    exposure: 0,
    brightness: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    temperature: 0,
    tint: 0,
    saturation: 0,
    vibrance: 0,
    hue: 0,
    sharpen: 0,
    clarity: 0,
    structure: 0,
    dehaze: 0,
    denoise: 0,
    grain: 0,
    grainSize: 50,
    fade: 0,
    vignette: 0,
    vignetteFeather: 50,
    hsl: defaultHsl(),
    curves: defaultCurves(),
    splitToning: {
      highlightHue: 45,
      highlightSaturation: 0,
      shadowHue: 220,
      shadowSaturation: 0,
      balance: 0,
    },
    colorBalance: { shadows: [0, 0, 0], midtones: [0, 0, 0], highlights: [0, 0, 0] },
    lut: { id: null, intensity: 100 },
  };
}

/** Ordered list of every scalar slider. The UI renders exactly this list, grouped by `group`. */
export const ADJUSTMENT_DEFINITIONS: readonly AdjustmentDefinition[] = [
  {
    key: 'exposure',
    label: 'Exposure',
    group: 'light',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Overall light level, like changing the camera exposure.',
  },
  {
    key: 'brightness',
    label: 'Brightness',
    group: 'light',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Lifts or lowers midtones while protecting the extremes.',
  },
  {
    key: 'contrast',
    label: 'Contrast',
    group: 'light',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Difference between dark and bright areas.',
  },
  {
    key: 'highlights',
    label: 'Highlights',
    group: 'light',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Recover or boost the brightest areas only.',
  },
  {
    key: 'shadows',
    label: 'Shadows',
    group: 'light',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Open up or deepen the darkest areas only.',
  },
  {
    key: 'whites',
    label: 'Whites',
    group: 'light',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Sets the white point.',
  },
  {
    key: 'blacks',
    label: 'Blacks',
    group: 'light',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Sets the black point.',
  },
  {
    key: 'temperature',
    label: 'Temperature',
    group: 'color',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Cooler (blue) to warmer (yellow).',
  },
  {
    key: 'tint',
    label: 'Tint',
    group: 'color',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Green to magenta balance.',
  },
  {
    key: 'saturation',
    label: 'Saturation',
    group: 'color',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Strength of all colours equally.',
  },
  {
    key: 'vibrance',
    label: 'Vibrance',
    group: 'color',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Boosts muted colours more than already-vivid ones; protects skin.',
  },
  {
    key: 'hue',
    label: 'Hue shift',
    group: 'color',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Rotates every colour around the colour wheel.',
  },
  {
    key: 'sharpen',
    label: 'Sharpen',
    group: 'detail',
    min: 0,
    max: 100,
    defaultValue: 0,
    description: 'Crisper edges.',
  },
  {
    key: 'clarity',
    label: 'Clarity',
    group: 'detail',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Midtone contrast for punch (or softness when negative).',
  },
  {
    key: 'structure',
    label: 'Structure',
    group: 'detail',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Fine texture emphasis.',
  },
  {
    key: 'dehaze',
    label: 'Dehaze',
    group: 'detail',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Cuts through haze and fog; negative adds a misty look.',
  },
  {
    key: 'denoise',
    label: 'Denoise',
    group: 'detail',
    min: 0,
    max: 100,
    defaultValue: 0,
    description: 'Smooths grainy noise while keeping edges.',
  },
  {
    key: 'grain',
    label: 'Grain',
    group: 'effects',
    min: 0,
    max: 100,
    defaultValue: 0,
    description: 'Film-style grain.',
  },
  {
    key: 'grainSize',
    label: 'Grain size',
    group: 'effects',
    min: 0,
    max: 100,
    defaultValue: 50,
    description: 'Coarseness of the grain.',
  },
  {
    key: 'fade',
    label: 'Fade',
    group: 'effects',
    min: 0,
    max: 100,
    defaultValue: 0,
    description: 'Lifts blacks for a matte, faded-film look.',
  },
  {
    key: 'vignette',
    label: 'Vignette',
    group: 'effects',
    min: -100,
    max: 100,
    defaultValue: 0,
    description: 'Darkens (or brightens) the corners.',
  },
  {
    key: 'vignetteFeather',
    label: 'Vignette feather',
    group: 'effects',
    min: 0,
    max: 100,
    defaultValue: 50,
    description: 'Softness of the vignette edge.',
  },
];

/** Quick lookup from slider key to its definition. */
export const ADJUSTMENT_BY_KEY: Record<ScalarAdjustmentKey, AdjustmentDefinition> =
  Object.fromEntries(ADJUSTMENT_DEFINITIONS.map((d) => [d.key, d])) as Record<
    ScalarAdjustmentKey,
    AdjustmentDefinition
  >;

/** Human-readable labels for each HSL band. */
export const HSL_BAND_LABELS: Record<HslBand, string> = {
  red: 'Red',
  orange: 'Orange',
  yellow: 'Yellow',
  green: 'Green',
  aqua: 'Aqua',
  blue: 'Blue',
  purple: 'Purple',
  magenta: 'Magenta',
};
