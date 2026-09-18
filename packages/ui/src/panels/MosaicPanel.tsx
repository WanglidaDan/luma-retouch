import { Undo2, Trash2 } from 'lucide-react';
import type { MosaicLayer, MosaicStyle } from '@photoditor-buddy/core';
import { useEditorStore, useSnapshot } from '../store/editorStore';
import { useInteractionStore } from '../store/interactionStore';
import { Button } from '../components/common/Button';
import { Chip, ChipRow } from '../components/common/Chip';
import { Slider } from '../components/common/Slider';
import { PanelHeader, Hint } from '../components/common/Section';

const STYLES: { id: MosaicStyle; label: string }[] = [
  { id: 'pixel', label: 'Pixels' },
  { id: 'blur', label: 'Blur' },
  { id: 'hex', label: 'Hexagons' },
  { id: 'crystal', label: 'Crystal' },
];

/** Paint a mosaic / blur over faces, plates and private details. */
export function MosaicPanel() {
  const snapshot = useSnapshot();
  const commit = useEditorStore((s) => s.commit);
  const i = useInteractionStore();
  const layer = snapshot.overlays.find((l): l is MosaicLayer => l.type === 'mosaic') ?? null;
  const setStrokes = (strokes: MosaicLayer['strokes']): void => {
    if (!layer) return;
    commit({
      overlays: snapshot.overlays.map((l) => (l.id === layer.id ? { ...layer, strokes } : l)),
    });
  };
  return (
    <div data-testid="mosaic-panel">
      <PanelHeader
        title="Mosaic"
        right={
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              icon={<Undo2 size={14} />}
              disabled={!layer?.strokes.length}
              onClick={() => layer && setStrokes(layer.strokes.slice(0, -1))}
              data-testid="mosaic-undo"
            >
              Undo
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<Trash2 size={14} />}
              disabled={!layer?.strokes.length}
              onClick={() => setStrokes([])}
            >
              Clear
            </Button>
          </div>
        }
      />
      <ChipRow>
        {STYLES.map((s) => (
          <Chip
            key={s.id}
            active={i.mosaicStyle === s.id}
            onClick={() => i.set({ mosaicStyle: s.id })}
            data-testid={`mosaic-${s.id}`}
          >
            {s.label}
          </Chip>
        ))}
      </ChipRow>
      <Slider
        label="Brush size"
        min={5}
        max={200}
        defaultValue={30}
        value={Math.round(i.brushSize * 1000)}
        onChange={(v) => i.set({ brushSize: v / 1000 })}
      />
      <Slider
        label="Block size"
        min={5}
        max={80}
        defaultValue={20}
        value={Math.round(i.mosaicBlock * 1000)}
        onChange={(v) => i.set({ mosaicBlock: v / 1000 })}
      />
      <Hint>
        Paint over the part to hide. Mosaic is applied to the real photo when you export, so it
        cannot be removed by others.
      </Hint>
    </div>
  );
}
