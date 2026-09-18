import { Undo2, Trash2 } from 'lucide-react';
import type { BrushKind, DoodleLayer } from '@photoditor-buddy/core';
import { useEditorStore, useSnapshot } from '../store/editorStore';
import { useInteractionStore } from '../store/interactionStore';
import { Button } from '../components/common/Button';
import { Chip, ChipRow } from '../components/common/Chip';
import { ColorPicker } from '../components/common/ColorPicker';
import { Slider } from '../components/common/Slider';
import { PanelHeader, Hint } from '../components/common/Section';

const BRUSHES: { id: BrushKind; label: string }[] = [
  { id: 'pen', label: 'Pen' },
  { id: 'marker', label: 'Marker' },
  { id: 'neon', label: 'Neon' },
  { id: 'dashed', label: 'Dashed' },
  { id: 'eraser', label: 'Eraser' },
];

/** Free-hand drawing with several brushes. Strokes live on one doodle layer. */
export function DoodlePanel() {
  const snapshot = useSnapshot();
  const commit = useEditorStore((s) => s.commit);
  const i = useInteractionStore();
  const layer = snapshot.overlays.find((l): l is DoodleLayer => l.type === 'doodle') ?? null;
  const setStrokes = (strokes: DoodleLayer['strokes']): void => {
    if (!layer) return;
    commit({
      overlays: snapshot.overlays.map((l) => (l.id === layer.id ? { ...layer, strokes } : l)),
    });
  };
  return (
    <div data-testid="doodle-panel">
      <PanelHeader
        title="Doodle"
        right={
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              icon={<Undo2 size={14} />}
              disabled={!layer?.strokes.length}
              onClick={() => layer && setStrokes(layer.strokes.slice(0, -1))}
              data-testid="doodle-undo"
            >
              Undo stroke
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
        {BRUSHES.map((b) => (
          <Chip
            key={b.id}
            active={i.brushKind === b.id}
            onClick={() => i.set({ brushKind: b.id })}
            data-testid={`brush-${b.id}`}
          >
            {b.label}
          </Chip>
        ))}
      </ChipRow>
      <ColorPicker value={i.brushColor} onChange={(c) => i.set({ brushColor: c })} />
      <Slider
        label="Brush size"
        min={2}
        max={150}
        defaultValue={30}
        value={Math.round(i.brushSize * 1000)}
        onChange={(v) => i.set({ brushSize: v / 1000 })}
      />
      <Slider
        label="Opacity"
        min={5}
        max={100}
        defaultValue={100}
        value={Math.round(i.brushOpacity * 100)}
        onChange={(v) => i.set({ brushOpacity: v / 100 })}
      />
      <Hint>
        Draw directly on the photo. Neon glows, Marker is semi-transparent, Eraser removes doodle
        strokes only.
      </Hint>
    </div>
  );
}
