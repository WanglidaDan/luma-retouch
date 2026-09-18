import { ArrowDown, ArrowUp, Eye, EyeOff, Lock, LockOpen, Trash2 } from 'lucide-react';
import type { OverlayLayer } from '@photoditor-buddy/core';
import { useEditorStore, useSnapshot } from '../store/editorStore';
import { IconButton } from '../components/common/IconButton';
import { PanelHeader, Hint } from '../components/common/Section';
import { Slider } from '../components/common/Slider';

function describe(layer: OverlayLayer): string {
  switch (layer.type) {
    case 'text':
      return `Text: ${layer.text.slice(0, 20) || '(empty)'}`;
    case 'sticker':
      return layer.kind === 'emoji' ? `Sticker ${layer.emoji}` : 'Image sticker';
    case 'doodle':
      return `Doodle (${layer.strokes.length} strokes)`;
    case 'mosaic':
      return `Mosaic (${layer.strokes.length} strokes)`;
    case 'frame':
      return `Frame: ${layer.frameId}`;
    case 'watermark':
      return `Watermark: ${layer.text}`;
  }
}

/** Lists every overlay layer (top first) with order, lock, hide and delete controls. */
export function LayersPanel() {
  const snapshot = useSnapshot();
  const selectedId = useEditorStore((s) => s.selectedLayerId);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const removeLayer = useEditorStore((s) => s.removeLayer);
  const moveLayer = useEditorStore((s) => s.moveLayer);
  const layers = [...snapshot.overlays].reverse();
  const selected = snapshot.overlays.find((l) => l.id === selectedId);
  return (
    <div data-testid="layers-panel">
      <PanelHeader title="Layers" />
      {layers.length === 0 && (
        <Hint>
          Text, stickers, doodles, mosaic, frames and watermarks appear here. The photo itself is
          always the bottom layer.
        </Hint>
      )}
      <ul className="flex flex-col gap-1">
        {layers.map((l) => (
          <li
            key={l.id}
            className={`flex items-center gap-1 rounded-xl px-2 h-11 border ${l.id === selectedId ? 'border-accent bg-accent/10' : 'border-border bg-surface-2'}`}
          >
            <button
              type="button"
              className="flex-1 text-left text-xs truncate"
              onClick={() => selectLayer(l.id)}
            >
              {describe(l)}
            </button>
            <IconButton
              size="sm"
              label={l.opacity === 0 ? 'Show' : 'Hide'}
              icon={l.opacity === 0 ? <EyeOff size={14} /> : <Eye size={14} />}
              onClick={() => updateLayer(l.id, { opacity: l.opacity === 0 ? 1 : 0 })}
            />
            <IconButton
              size="sm"
              label={l.locked ? 'Unlock' : 'Lock'}
              icon={l.locked ? <Lock size={14} /> : <LockOpen size={14} />}
              onClick={() => updateLayer(l.id, { locked: !l.locked })}
            />
            <IconButton
              size="sm"
              label="Up"
              icon={<ArrowUp size={14} />}
              onClick={() => moveLayer(l.id, 'up')}
            />
            <IconButton
              size="sm"
              label="Down"
              icon={<ArrowDown size={14} />}
              onClick={() => moveLayer(l.id, 'down')}
            />
            <IconButton
              size="sm"
              label="Delete"
              icon={<Trash2 size={14} />}
              className="text-danger"
              onClick={() => removeLayer(l.id)}
            />
          </li>
        ))}
      </ul>
      {selected && (
        <div className="mt-2">
          <Slider
            label="Opacity"
            min={0}
            max={100}
            defaultValue={100}
            value={Math.round(selected.opacity * 100)}
            onChange={(v) => updateLayer(selected.id, { opacity: v / 100 }, true)}
            onCommit={(v) => updateLayer(selected.id, { opacity: v / 100 })}
          />
        </div>
      )}
    </div>
  );
}
