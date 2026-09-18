import type { NormPoint } from '../overlays/types';

/** Reshape sliders. All values are -100..100 (0 = untouched) except where noted. */
export interface ReshapeSettings {
  /** Narrows (positive) or widens the lower face. */
  faceSlim: number;
  /** Sharpens (positive) or softens the jaw corners. */
  jaw: number;
  /** Lengthens (positive) or shortens the chin. */
  chin: number;
  /** Narrows (positive) or widens the nose. */
  noseWidth: number;
  /** Enlarges (positive) or shrinks the eyes. */
  eyeSize: number;
  /** Moves the eyes apart (positive) or closer. */
  eyeDistance: number;
  /** Lifts (positive) the outer eye corners. */
  eyeLift: number;
  /** Enlarges (positive) or shrinks the mouth. */
  mouthSize: number;
  /** Raises (positive) the hairline / lengthens the forehead. */
  forehead: number;
  /** Shrinks the whole head (positive) — "small head" effect. */
  headSize: number;
}

/** Skin and feature sliders, 0..100. */
export interface SkinSettings {
  smooth: number;
  whiten: number;
  teeth: number;
  eyes: number;
  /** Spot-heal strength for tapped blemishes. */
  blemish: number;
}

/** One makeup item: colour + strength. */
export interface MakeupItem {
  color: string;
  /** 0..100 */
  opacity: number;
}

export interface MakeupSettings {
  lipstick: MakeupItem;
  blush: MakeupItem;
  eyebrows: MakeupItem;
  eyeshadow: MakeupItem;
  contacts: MakeupItem;
  eyeliner: MakeupItem;
}

/** A liquify brush stroke: pushes pixels along the drag direction. */
export interface LiquifyStroke {
  points: NormPoint[];
  /** Radius as a fraction of image width. */
  radius: number;
  /** 0..1 */
  strength: number;
  mode: 'push' | 'bulge' | 'pinch' | 'restore';
}

/** All portrait settings kept in the editor state. */
export interface PortraitSettings {
  skin: SkinSettings;
  reshape: ReshapeSettings;
  makeup: MakeupSettings;
  /** Blemish spots the user tapped, in 0..1 coordinates with radius as a fraction of width. */
  blemishSpots: { x: number; y: number; radius: number }[];
  liquify: LiquifyStroke[];
}

/** Neutral portrait settings. */
export function defaultPortraitSettings(): PortraitSettings {
  return {
    skin: { smooth: 0, whiten: 0, teeth: 0, eyes: 0, blemish: 100 },
    reshape: {
      faceSlim: 0,
      jaw: 0,
      chin: 0,
      noseWidth: 0,
      eyeSize: 0,
      eyeDistance: 0,
      eyeLift: 0,
      mouthSize: 0,
      forehead: 0,
      headSize: 0,
    },
    makeup: {
      lipstick: { color: '#c2185b', opacity: 0 },
      blush: { color: '#f48fb1', opacity: 0 },
      eyebrows: { color: '#3e2723', opacity: 0 },
      eyeshadow: { color: '#8d6e63', opacity: 0 },
      contacts: { color: '#5d8aa8', opacity: 0 },
      eyeliner: { color: '#1a1a1a', opacity: 0 },
    },
    blemishSpots: [],
    liquify: [],
  };
}

/** Metadata for the reshape sliders (drives the UI). */
export const RESHAPE_DEFINITIONS: readonly {
  key: keyof ReshapeSettings;
  label: string;
  description: string;
}[] = [
  { key: 'faceSlim', label: 'Face slim', description: 'Narrows the cheeks and lower face.' },
  { key: 'jaw', label: 'Jaw', description: 'Sharpens or softens the jawline.' },
  { key: 'chin', label: 'Chin', description: 'Lengthens or shortens the chin.' },
  { key: 'headSize', label: 'Small head', description: 'Shrinks the whole head slightly.' },
  { key: 'forehead', label: 'Forehead', description: 'Raises or lowers the hairline.' },
  { key: 'noseWidth', label: 'Nose width', description: 'Slims or widens the nose.' },
  { key: 'eyeSize', label: 'Eye size', description: 'Enlarges or shrinks both eyes.' },
  { key: 'eyeDistance', label: 'Eye distance', description: 'Moves the eyes apart or closer.' },
  { key: 'eyeLift', label: 'Eye lift', description: 'Lifts the outer corners of the eyes.' },
  { key: 'mouthSize', label: 'Mouth size', description: 'Enlarges or shrinks the mouth.' },
];

/** Metadata for the skin sliders. */
export const SKIN_DEFINITIONS: readonly {
  key: keyof SkinSettings;
  label: string;
  description: string;
}[] = [
  {
    key: 'smooth',
    label: 'Smooth skin',
    description: 'Softens pores and fine lines while keeping edges.',
  },
  { key: 'whiten', label: 'Brighten skin', description: 'Lifts and evens the skin tone.' },
  { key: 'teeth', label: 'Whiten teeth', description: 'Removes yellow cast from teeth.' },
  { key: 'eyes', label: 'Brighten eyes', description: 'Adds sparkle and contrast to the eyes.' },
];

/** Metadata for makeup items. */
export const MAKEUP_DEFINITIONS: readonly {
  key: keyof MakeupSettings;
  label: string;
  swatches: string[];
}[] = [
  {
    key: 'lipstick',
    label: 'Lipstick',
    swatches: [
      '#c2185b',
      '#e53935',
      '#ad1457',
      '#ff7043',
      '#8e24aa',
      '#d81b60',
      '#6d4c41',
      '#f06292',
    ],
  },
  {
    key: 'blush',
    label: 'Blush',
    swatches: ['#f48fb1', '#ff8a80', '#ffab91', '#ce93d8', '#f8bbd0', '#ffcc80'],
  },
  {
    key: 'eyebrows',
    label: 'Eyebrows',
    swatches: ['#3e2723', '#212121', '#5d4037', '#795548', '#8d6e63', '#4e342e'],
  },
  {
    key: 'eyeshadow',
    label: 'Eyeshadow',
    swatches: ['#8d6e63', '#ba68c8', '#4fc3f7', '#ffb74d', '#a1887f', '#ef9a9a', '#90a4ae'],
  },
  {
    key: 'contacts',
    label: 'Contact lenses',
    swatches: ['#5d8aa8', '#6b8e23', '#8b5a2b', '#708090', '#4b0082', '#2e8b57'],
  },
  { key: 'eyeliner', label: 'Eyeliner', swatches: ['#1a1a1a', '#3e2723', '#1a237e', '#004d40'] },
];
