import {
  FACE_OVAL,
  LEFT_EYE,
  LEFT_IRIS,
  LEFT_EYEBROW,
  LIPS_INNER,
  LIPS_OUTER,
  RIGHT_EYE,
  RIGHT_IRIS,
  RIGHT_EYEBROW,
  faceWidth,
  polygon,
  centroid,
  LANDMARK,
  type FaceLandmarks,
} from './regions';
import type { MakeupSettings } from './types';
import { hexToRgb } from '../math/color';

/** Draws a closed polygon path from normalised points. */
function path(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  w: number,
  h: number,
): void {
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x * w, p.y * h) : ctx.lineTo(p.x * w, p.y * h)));
  ctx.closePath();
}

/**
 * Builds the RGBA mask used by the skin shader:
 * R = skin (face oval minus eyes, brows and mouth, feathered), G = teeth (inner mouth),
 * B = eyes (eye polygons), A = blemish spots tapped by the user.
 *
 * Returned as `ImageData` on purpose: a canvas stores premultiplied alpha, so pixels with
 * alpha 0 would lose their RGB channels. `ImageData` keeps the raw values and uploads
 * straight to WebGL (with premultiplication disabled).
 */
export function buildPortraitMask(
  faces: FaceLandmarks[],
  width: number,
  height: number,
  blemishSpots: { x: number; y: number; radius: number }[],
): ImageData {
  const layer = (draw: (c: CanvasRenderingContext2D) => void): Uint8ClampedArray => {
    const l = document.createElement('canvas');
    l.width = width;
    l.height = height;
    const c = l.getContext('2d');
    if (!c) throw new Error('Canvas 2D is not available.');
    draw(c);
    return c.getImageData(0, 0, width, height).data;
  };

  const skin = layer((c) => {
    c.fillStyle = '#ffffff';
    for (const face of faces) {
      const feather = faceWidth(face) * width * 0.08;
      c.save();
      c.filter = `blur(${feather}px)`;
      path(c, polygon(face, FACE_OVAL), width, height);
      c.fill();
      c.restore();
      // Cut out eyes, brows and mouth so smoothing never blurs them.
      c.save();
      c.globalCompositeOperation = 'destination-out';
      c.filter = `blur(${feather * 0.4}px)`;
      for (const region of [LEFT_EYE, RIGHT_EYE, LIPS_OUTER, LEFT_EYEBROW, RIGHT_EYEBROW]) {
        path(c, polygon(face, region), width, height);
        c.fill();
      }
      c.restore();
    }
  });
  const teeth = layer((c) => {
    c.fillStyle = '#ffffff';
    for (const face of faces) {
      path(c, polygon(face, LIPS_INNER), width, height);
      c.fill();
    }
  });
  const eyes = layer((c) => {
    c.fillStyle = '#ffffff';
    for (const face of faces) {
      c.save();
      c.filter = `blur(${faceWidth(face) * width * 0.01}px)`;
      for (const region of [LEFT_EYE, RIGHT_EYE]) {
        path(c, polygon(face, region), width, height);
        c.fill();
      }
      c.restore();
    }
  });
  const spots = layer((c) => {
    for (const spot of blemishSpots) {
      const r = spot.radius * width;
      const g = c.createRadialGradient(
        spot.x * width,
        spot.y * height,
        0,
        spot.x * width,
        spot.y * height,
        r,
      );
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.7, 'rgba(255,255,255,1)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(spot.x * width, spot.y * height, r, 0, Math.PI * 2);
      c.fill();
    }
  });

  // Each layer was painted in white, so its alpha channel is the coverage we want per channel.
  const out = new ImageData(width, height);
  const data = out.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = skin[i + 3]!;
    data[i + 1] = teeth[i + 3]!;
    data[i + 2] = eyes[i + 3]!;
    data[i + 3] = spots[i + 3]!;
  }
  return out;
}

/** Draws a soft ellipse (used for blush and eyeshadow). */
function softEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
  alpha: number,
): void {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
  const [r, gg, b] = hexToRgb(color).map((v) => Math.round(v * 255));
  g.addColorStop(0, `rgba(${r},${gg},${b},${alpha})`);
  g.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / Math.max(rx, 1e-3));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Builds the premultiplied RGBA makeup overlay: lipstick on the lips, blush on the cheeks,
 * eyebrow tint, eyeshadow above the eyes, eyeliner along the upper lash line, coloured contacts on the iris.
 */
export function buildMakeupOverlay(
  faces: FaceLandmarks[],
  width: number,
  height: number,
  makeup: MakeupSettings,
): HTMLCanvasElement | null {
  const active = Object.values(makeup).some((item) => item.opacity > 0);
  if (!active || faces.length === 0) return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not available.');
  for (const face of faces) {
    const fw = faceWidth(face) * width;
    if (makeup.lipstick.opacity > 0) {
      ctx.save();
      ctx.filter = `blur(${fw * 0.006}px)`;
      ctx.fillStyle = makeup.lipstick.color;
      ctx.globalAlpha = makeup.lipstick.opacity / 100;
      path(ctx, polygon(face, LIPS_OUTER), width, height);
      ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      path(ctx, polygon(face, LIPS_INNER), width, height);
      ctx.fill();
      ctx.restore();
    }
    if (makeup.blush.opacity > 0) {
      for (const idx of [LANDMARK.leftCheekbone, LANDMARK.rightCheekbone]) {
        const p = face.points[idx];
        if (!p) continue;
        softEllipse(
          ctx,
          p.x * width,
          p.y * height + fw * 0.03,
          fw * 0.16,
          fw * 0.11,
          makeup.blush.color,
          (makeup.blush.opacity / 100) * 0.7,
        );
      }
    }
    if (makeup.eyebrows.opacity > 0) {
      ctx.save();
      ctx.filter = `blur(${fw * 0.01}px)`;
      ctx.fillStyle = makeup.eyebrows.color;
      ctx.globalAlpha = (makeup.eyebrows.opacity / 100) * 0.8;
      for (const region of [LEFT_EYEBROW, RIGHT_EYEBROW]) {
        path(ctx, polygon(face, region), width, height);
        ctx.fill();
      }
      ctx.restore();
    }
    if (makeup.eyeshadow.opacity > 0) {
      for (const region of [LEFT_EYE, RIGHT_EYE]) {
        const c = centroid(face, region);
        softEllipse(
          ctx,
          c.x * width,
          c.y * height - fw * 0.05,
          fw * 0.14,
          fw * 0.08,
          makeup.eyeshadow.color,
          (makeup.eyeshadow.opacity / 100) * 0.75,
        );
      }
      // Keep the eye itself clean.
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      for (const region of [LEFT_EYE, RIGHT_EYE]) {
        path(ctx, polygon(face, region), width, height);
        ctx.fill();
      }
      ctx.restore();
    }
    if (makeup.eyeliner.opacity > 0) {
      ctx.save();
      ctx.strokeStyle = makeup.eyeliner.color;
      ctx.globalAlpha = makeup.eyeliner.opacity / 100;
      ctx.lineWidth = Math.max(1, fw * 0.012);
      ctx.lineCap = 'round';
      // Upper lash line: the second half of each eye ring runs along the top lid.
      for (const region of [LEFT_EYE, RIGHT_EYE]) {
        const pts = polygon(face, region);
        const upper = pts.slice(8).concat([pts[0]!]);
        ctx.beginPath();
        upper.forEach((p, i) =>
          i === 0 ? ctx.moveTo(p.x * width, p.y * height) : ctx.lineTo(p.x * width, p.y * height),
        );
        ctx.stroke();
      }
      ctx.restore();
    }
    if (makeup.contacts.opacity > 0) {
      ctx.save();
      ctx.fillStyle = makeup.contacts.color;
      ctx.globalAlpha = (makeup.contacts.opacity / 100) * 0.85;
      for (const [irisIdx, eyeRegion] of [
        [LEFT_IRIS, LEFT_EYE],
        [RIGHT_IRIS, RIGHT_EYE],
      ] as const) {
        const centre = face.points[irisIdx[0]!];
        const edge = face.points[irisIdx[1]!];
        if (!centre || !edge) continue;
        const r = Math.hypot((edge.x - centre.x) * width, (edge.y - centre.y) * height);
        ctx.save();
        path(ctx, polygon(face, eyeRegion), width, height);
        ctx.clip();
        ctx.beginPath();
        ctx.arc(centre.x * width, centre.y * height, r, 0, Math.PI * 2);
        ctx.fill();
        // Leave the pupil dark.
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(centre.x * width, centre.y * height, r * 0.38, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }
  }
  return canvas;
}
