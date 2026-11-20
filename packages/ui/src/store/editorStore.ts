import { create } from 'zustand';
import {
  History,
  bitmapToCanvas,
  defaultAdjustments,
  defaultPortraitSettings,
  analyzeAutoAdjustments,
  fitWithin,
  loadImageFromBlob,
  loadImageFromUrl,
  makePreviewCanvas,
  PREVIEW_MAX_EDGE,
  detectFaces,
  type OverlayLayer,
} from '@photoditor-buddy/core';
import { defaultAiSettings, KeyVault, type AiSettings } from '@photoditor-buddy/ai';
import type { EmbedConfig } from '@photoditor-buddy/sdk';
import type {
  BusyState,
  EditSnapshot,
  EditorData,
  Screen,
  SourceImage,
  ToolId,
  Toast,
} from './types';

const AI_SETTINGS_KEY = 'photoditor-buddy:ai-settings';
const HISTORY_DEPTH = 40;

/** Shared key vault instance (keys live in localStorage, see `KeyVault`). */
export const keyVault = new KeyVault();

function loadAiSettings(): AiSettings {
  try {
    const raw = localStorage.getItem(AI_SETTINGS_KEY);
    return raw
      ? { ...defaultAiSettings(), ...(JSON.parse(raw) as Partial<AiSettings>) }
      : defaultAiSettings();
  } catch {
    return defaultAiSettings();
  }
}

/** Actions available on the store. */
export interface EditorActions {
  openFile(file: Blob, fileName?: string): Promise<void>;
  openUrl(url: string, fileName?: string): Promise<void>;
  openCanvas(canvas: HTMLCanvasElement, fileName: string, mimeType?: string): void;
  /** Automatically balances tone and applies restrained face retouch to the current photo. */
  autoRetouch(): Promise<void>;
  goHome(): void;
  setScreen(screen: Screen): void;
  setTool(tool: ToolId | null): void;
  /** Applies a change without an undo step (live slider drags). */
  updateLive(patch: Partial<EditSnapshot>): void;
  /** Applies a change and records an undo step (uses the pre-drag state as the undo point). */
  commit(patch: Partial<EditSnapshot>): void;
  /** Replaces the image itself (crop, AI result). Records an undo step. `resetLook` clears sliders/filters that are now baked in. */
  commitSource(
    full: HTMLCanvasElement,
    options?: { keepOverlays?: boolean; fileName?: string; resetLook?: boolean; mimeType?: string },
  ): void;
  /** Called by the embed bridge so exports go to the host page instead of a download. Returns true when handled. */
  setExportHandler(
    handler:
      | ((result: {
          blob: Blob;
          fileName: string;
          width: number;
          height: number;
        }) => Promise<boolean> | boolean)
      | null,
  ): void;
  /** Remembers the current adjustments and portrait look so Batch can reuse them on other photos. */
  saveLookTemplate(): void;
  undo(): void;
  redo(): void;
  resetEdits(): void;
  selectLayer(id: string | null): void;
  addLayer(layer: OverlayLayer, select?: boolean): void;
  updateLayer(id: string, patch: Partial<OverlayLayer>, live?: boolean): void;
  removeLayer(id: string): void;
  moveLayer(id: string, direction: 'up' | 'down'): void;
  setCompare(on: boolean): void;
  setBusy(busy: BusyState | null): void;
  toast(message: string, kind?: Toast['kind']): void;
  dismissToast(id: number): void;
  setAiSettings(patch: Partial<AiSettings>): void;
  setSettingsOpen(open: boolean): void;
  setEmbed(config: EmbedConfig | null): void;
  ensureFaces(): Promise<void>;
}

export type EditorStore = EditorData & EditorActions;

let history = new History<EditSnapshot | null>(null, HISTORY_DEPTH);
let pendingBase: EditSnapshot | null | undefined;
let toastCounter = 0;

/** Builds a fresh snapshot for a new image. */
function freshSnapshot(source: SourceImage): EditSnapshot {
  return {
    source,
    adjustments: defaultAdjustments(),
    filter: null,
    effect: null,
    overlays: [],
    portrait: defaultPortraitSettings(),
    userLut: null,
  };
}

/** Creates the full + preview canvases for an image source. */
function makeSource(full: HTMLCanvasElement, fileName: string, mimeType: string): SourceImage {
  return { full, preview: makePreviewCanvas(full, PREVIEW_MAX_EDGE), fileName, mimeType };
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  screen: 'home',
  activeTool: null,
  snapshot: null,
  canUndo: false,
  canRedo: false,
  selectedLayerId: null,
  faces: null,
  facesStatus: 'idle',
  compare: false,
  busy: null,
  toasts: [],
  aiSettings: loadAiSettings(),
  embed: null,
  settingsOpen: false,
  exportHandler: null,
  lookTemplate: null,

  async openFile(file, fileName) {
    const name = fileName ?? (file instanceof File ? file.name : 'image');
    set({ busy: { message: 'Opening photo…' } });
    try {
      const loaded = await loadImageFromBlob(file, name);
      const full = bitmapToCanvas(loaded.bitmap);
      loaded.bitmap.close();
      get().openCanvas(full, loaded.fileName, loaded.mimeType);
    } catch (error) {
      get().toast(error instanceof Error ? error.message : 'Could not open the photo.', 'error');
    } finally {
      set({ busy: null });
    }
  },

  async openUrl(url, fileName) {
    set({ busy: { message: 'Downloading photo…' } });
    try {
      const loaded = await loadImageFromUrl(url);
      const full = bitmapToCanvas(loaded.bitmap);
      loaded.bitmap.close();
      get().openCanvas(full, fileName ?? loaded.fileName, loaded.mimeType);
    } catch (error) {
      get().toast(error instanceof Error ? error.message : 'Could not open the photo.', 'error');
    } finally {
      set({ busy: null });
    }
  },

  openCanvas(canvas, fileName, mimeType = 'image/png') {
    // Guard against images too large for the GPU: cap the full-resolution copy at 8192px.
    const limit = 8192;
    let full = canvas;
    if (Math.max(canvas.width, canvas.height) > limit) {
      const size = fitWithin(canvas.width, canvas.height, limit);
      full = bitmapToCanvas(canvas, size.width, size.height);
      get().toast(`Very large photo scaled to ${size.width}×${size.height} for editing.`, 'info');
    }
    const snapshot = freshSnapshot(makeSource(full, fileName, mimeType));
    history = new History<EditSnapshot | null>(snapshot, HISTORY_DEPTH);
    pendingBase = undefined;
    set({
      snapshot,
      screen: 'editor',
      activeTool: null,
      selectedLayerId: null,
      faces: null,
      facesStatus: 'idle',
      canUndo: false,
      canRedo: false,
      compare: false,
    });
    void Promise.resolve().then(() => get().autoRetouch());
  },

  async autoRetouch() {
    const starting = get().snapshot;
    if (!starting) return;
    const source = starting.source;
    set({ busy: { message: 'Analysing light and retouching portrait…' }, facesStatus: 'loading' });
    try {
      const adjustments = analyzeAutoAdjustments(source.preview);
      let faces: Awaited<ReturnType<typeof detectFaces>> | null = null;
      let faceError: unknown = null;
      try {
        faces = await detectFaces(source.preview);
      } catch (error) {
        faceError = error;
      }
      const current = get().snapshot;
      if (!current || current.source !== source) return;
      const portrait = defaultPortraitSettings();
      if (faces?.length) {
        portrait.skin.smooth = 22;
        portrait.skin.whiten = 4;
        portrait.skin.eyes = 5;
        portrait.reshape.faceSlim = 6;
        portrait.reshape.jaw = 3;
      }
      get().commit({ adjustments: { ...current.adjustments, ...adjustments }, portrait });
      set({ faces, facesStatus: faces ? (faces.length > 0 ? 'ready' : 'none') : 'error' });
      if (faces?.length) {
        get().toast(
          'Automatic portrait retouch is ready. Fine-tune any adjustment whenever you like.',
          'success',
        );
      } else if (faceError) {
        get().toast(
          'Light correction is ready. Face retouch needs an internet connection the first time.',
          'info',
        );
      } else {
        get().toast(
          'Automatic light correction is ready. No face was detected in this photo.',
          'info',
        );
      }
    } catch (error) {
      if (get().snapshot?.source === source) {
        set({ faces: null, facesStatus: 'error' });
        get().toast(error instanceof Error ? error.message : 'Automatic retouch failed.', 'error');
      }
    } finally {
      if (get().snapshot?.source === source) set({ busy: null });
    }
  },

  goHome() {
    history = new History<EditSnapshot | null>(null, HISTORY_DEPTH);
    pendingBase = undefined;
    set({
      screen: 'home',
      snapshot: null,
      activeTool: null,
      selectedLayerId: null,
      faces: null,
      facesStatus: 'idle',
      canUndo: false,
      canRedo: false,
    });
  },

  setScreen(screen) {
    set({ screen });
  },

  setTool(tool) {
    set({
      activeTool: tool,
      selectedLayerId:
        tool === 'text' || tool === 'stickers' || tool === 'layers' ? get().selectedLayerId : null,
    });
  },

  updateLive(patch) {
    const present = history.present;
    if (!present) return;
    if (pendingBase === undefined) pendingBase = present;
    const next = { ...present, ...patch };
    history.replace(next);
    set({ snapshot: next });
  },

  commit(patch) {
    const live = history.present;
    if (!live) return;
    const base = pendingBase === undefined ? live : pendingBase;
    const next = { ...live, ...patch };
    history.replace(base);
    history.push(next);
    pendingBase = undefined;
    set({ snapshot: next, canUndo: history.canUndo, canRedo: history.canRedo });
  },

  commitSource(full, options) {
    const present = history.present;
    if (!present) return;
    const source = makeSource(
      full,
      options?.fileName ?? present.source.fileName,
      options?.mimeType ?? present.source.mimeType,
    );
    const next: EditSnapshot = {
      ...present,
      source,
      overlays: options?.keepOverlays ? present.overlays : [],
      ...(options?.resetLook
        ? {
            adjustments: defaultAdjustments(),
            filter: null,
            effect: null,
            portrait: defaultPortraitSettings(),
          }
        : {}),
    };
    history.replace(pendingBase === undefined ? present : pendingBase);
    history.push(next);
    pendingBase = undefined;
    set({
      snapshot: next,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      faces: null,
      facesStatus: 'idle',
      selectedLayerId: null,
    });
  },

  undo() {
    pendingBase = undefined;
    const previous = history.present;
    const next = history.undo();
    if (next === previous) return;
    const sourceChanged = previous?.source !== next?.source;
    set({
      snapshot: next,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      ...(sourceChanged ? { faces: null, facesStatus: 'idle' as const } : {}),
    });
  },

  redo() {
    pendingBase = undefined;
    const previous = history.present;
    const next = history.redo();
    if (next === previous) return;
    const sourceChanged = previous?.source !== next?.source;
    set({
      snapshot: next,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      ...(sourceChanged ? { faces: null, facesStatus: 'idle' as const } : {}),
    });
  },

  resetEdits() {
    const present = history.present;
    if (!present) return;
    get().commit({
      adjustments: defaultAdjustments(),
      filter: null,
      effect: null,
      overlays: [],
      portrait: defaultPortraitSettings(),
    });
  },

  selectLayer(id) {
    set({ selectedLayerId: id });
  },

  addLayer(layer, select = true) {
    const present = history.present;
    if (!present) return;
    get().commit({ overlays: [...present.overlays, layer] });
    if (select) set({ selectedLayerId: layer.id });
  },

  updateLayer(id, patch, live = false) {
    const present = history.present;
    if (!present) return;
    const overlays = present.overlays.map((l) =>
      l.id === id ? ({ ...l, ...patch } as OverlayLayer) : l,
    );
    if (live) get().updateLive({ overlays });
    else get().commit({ overlays });
  },

  removeLayer(id) {
    const present = history.present;
    if (!present) return;
    get().commit({ overlays: present.overlays.filter((l) => l.id !== id) });
    if (get().selectedLayerId === id) set({ selectedLayerId: null });
  },

  moveLayer(id, direction) {
    const present = history.present;
    if (!present) return;
    const overlays = [...present.overlays];
    const index = overlays.findIndex((l) => l.id === id);
    const target = direction === 'up' ? index + 1 : index - 1;
    if (index < 0 || target < 0 || target >= overlays.length) return;
    const [layer] = overlays.splice(index, 1);
    overlays.splice(target, 0, layer!);
    get().commit({ overlays });
  },

  setCompare(on) {
    set({ compare: on });
  },

  setBusy(busy) {
    set({ busy });
  },

  toast(message, kind = 'info') {
    const id = ++toastCounter;
    set({ toasts: [...get().toasts, { id, kind, message }] });
    setTimeout(() => get().dismissToast(id), kind === 'error' ? 7000 : 3500);
  },

  dismissToast(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  setAiSettings(patch) {
    const aiSettings = { ...get().aiSettings, ...patch };
    try {
      localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(aiSettings));
    } catch {
      // ignore storage errors (private mode)
    }
    set({ aiSettings });
  },

  setSettingsOpen(open) {
    set({ settingsOpen: open });
  },

  setEmbed(config) {
    set({ embed: config });
  },

  setExportHandler(handler) {
    set({ exportHandler: handler });
  },

  saveLookTemplate() {
    const present = history.present;
    if (!present) return;
    set({
      lookTemplate: {
        adjustments: present.adjustments,
        filter: present.filter,
        effect: present.effect,
        portrait: present.portrait,
      },
    });
  },

  async ensureFaces() {
    const { snapshot, facesStatus } = get();
    if (!snapshot || facesStatus === 'loading' || facesStatus === 'ready' || facesStatus === 'none')
      return;
    set({ facesStatus: 'loading' });
    try {
      const faces = await detectFaces(snapshot.source.preview);
      set({ faces, facesStatus: faces.length > 0 ? 'ready' : 'none' });
      if (faces.length === 0)
        get().toast(
          'No face found in this photo. Skin and reshape tools need a visible face; Liquify still works.',
          'info',
        );
    } catch (error) {
      set({ faces: null, facesStatus: 'error' });
      get().toast(error instanceof Error ? error.message : 'Face detection failed.', 'error');
    }
  },
}));

/** Convenience selector: the current snapshot or throws (used inside editor-only components). */
export function useSnapshot(): EditSnapshot {
  const snapshot = useEditorStore((s) => s.snapshot);
  if (!snapshot) throw new Error('No image is open.');
  return snapshot;
}
