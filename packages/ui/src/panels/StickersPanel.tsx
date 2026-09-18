import { useRef, useState } from 'react';
import { FlipHorizontal2, Upload } from 'lucide-react';
import {
  STICKER_PACKS,
  createEmojiSticker,
  createImageSticker,
  loadImageFromBlob,
  bitmapToCanvas,
  type StickerLayer,
} from '@photoditor-buddy/core';
import { useEditorStore, useSnapshot } from '../store/editorStore';
import { Button } from '../components/common/Button';
import { Chip, ChipRow } from '../components/common/Chip';
import { IconButton } from '../components/common/IconButton';
import { PanelHeader, Hint } from '../components/common/Section';
import { LayerCommonControls } from './layerControls';

/** Emoji sticker packs plus custom image stickers (PNG with transparency, cut-outs). */
export function StickersPanel() {
  const snapshot = useSnapshot();
  const selectedId = useEditorStore((s) => s.selectedLayerId);
  const addLayer = useEditorStore((s) => s.addLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const toast = useEditorStore((s) => s.toast);
  const [pack, setPack] = useState(STICKER_PACKS[0]!.id);
  const fileRef = useRef<HTMLInputElement>(null);
  const layer =
    snapshot.overlays.find((l): l is StickerLayer => l.type === 'sticker' && l.id === selectedId) ??
    null;
  const items = STICKER_PACKS.find((p) => p.id === pack)?.items ?? [];

  const onUpload = async (file: File | undefined): Promise<void> => {
    if (!file) return;
    try {
      const loaded = await loadImageFromBlob(file, file.name);
      const canvas = bitmapToCanvas(
        loaded.bitmap,
        Math.min(loaded.width, 1024),
        Math.min(loaded.width, 1024) * (loaded.height / loaded.width),
      );
      loaded.bitmap.close();
      addLayer(createImageSticker(canvas));
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not load sticker.', 'error');
    }
  };

  return (
    <div data-testid="stickers-panel">
      <PanelHeader
        title="Stickers"
        right={
          <Button size="sm" icon={<Upload size={14} />} onClick={() => fileRef.current?.click()}>
            Image
          </Button>
        }
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onUpload(e.target.files?.[0])}
      />
      <ChipRow>
        {STICKER_PACKS.map((p) => (
          <Chip key={p.id} active={pack === p.id} onClick={() => setPack(p.id)}>
            {p.name}
          </Chip>
        ))}
      </ChipRow>
      <div className="grid grid-cols-5 gap-1 mt-1" data-testid="sticker-grid">
        {items.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="h-12 rounded-lg hover:bg-surface-3 text-2xl flex items-center justify-center"
            onClick={() => addLayer(createEmojiSticker(emoji))}
            aria-label={`Add sticker ${emoji}`}
          >
            <span className={emoji.length > 4 ? 'text-xs' : ''}>{emoji}</span>
          </button>
        ))}
      </div>
      {layer ? (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted">Selected sticker</span>
            <IconButton
              label="Flip"
              size="sm"
              icon={<FlipHorizontal2 size={14} />}
              active={layer.flipHorizontal}
              onClick={() => updateLayer(layer.id, { flipHorizontal: !layer.flipHorizontal })}
            />
          </div>
          <LayerCommonControls layer={layer} sizeKey="size" />
        </div>
      ) : (
        <Hint>
          Tap a sticker to add it, then drag it on the photo. Upload a PNG for your own stickers
          (try the AI "Remove background" tool first to make a cut-out).
        </Hint>
      )}
    </div>
  );
}
