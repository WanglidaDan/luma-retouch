import {
  FONT_OPTIONS,
  createWatermarkLayer,
  fontStack,
  type WatermarkAnchor,
  type WatermarkLayer,
} from '@photoditor-buddy/core';
import { useEditorStore, useSnapshot } from '../store/editorStore';
import { Button } from '../components/common/Button';
import { Chip, ChipRow } from '../components/common/Chip';
import { ColorPicker } from '../components/common/ColorPicker';
import { Slider } from '../components/common/Slider';
import { PanelHeader, Hint, Section } from '../components/common/Section';

const ANCHORS: WatermarkAnchor[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

/** Text watermark: corner placement or tiled diagonally. */
export function WatermarkPanel() {
  const snapshot = useSnapshot();
  const addLayer = useEditorStore((s) => s.addLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const removeLayer = useEditorStore((s) => s.removeLayer);
  const layer = snapshot.overlays.find((l): l is WatermarkLayer => l.type === 'watermark') ?? null;
  const patch = (p: Partial<WatermarkLayer>, live = false): void => {
    if (layer) updateLayer(layer.id, p, live);
  };
  return (
    <div data-testid="watermark-panel">
      <PanelHeader
        title="Watermark"
        right={
          layer ? (
            <Button size="sm" variant="ghost" onClick={() => removeLayer(layer.id)}>
              Remove
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={() => addLayer(createWatermarkLayer(), false)}
              data-testid="add-watermark"
            >
              Add
            </Button>
          )
        }
      />
      {!layer && (
        <Hint>
          Adds your name or brand to the photo, in a corner or repeated across the whole image.
        </Hint>
      )}
      {layer && (
        <div>
          <input
            className="w-full bg-surface-2 border border-border rounded-xl px-3 h-10 text-sm focus:outline-none focus:border-accent"
            value={layer.text}
            onChange={(e) => patch({ text: e.target.value }, true)}
            onBlur={(e) => patch({ text: e.target.value })}
            aria-label="Watermark text"
            data-testid="watermark-text"
          />
          <Section title="Position" className="mt-2">
            <div className="grid grid-cols-3 gap-1 w-32">
              {ANCHORS.map((a) => (
                <button
                  key={a}
                  type="button"
                  aria-label={a}
                  aria-pressed={layer.anchor === a && !layer.tile}
                  className={`h-9 rounded-md border ${layer.anchor === a && !layer.tile ? 'bg-accent border-accent' : 'bg-surface-2 border-border'}`}
                  onClick={() => patch({ anchor: a, tile: false })}
                />
              ))}
            </div>
            <Chip active={layer.tile} onClick={() => patch({ tile: !layer.tile })} className="mt-2">
              Tile across photo
            </Chip>
          </Section>
          <ChipRow>
            {FONT_OPTIONS.slice(0, 8).map((f) => (
              <Chip
                key={f.family}
                active={layer.fontFamily === f.family}
                onClick={() => patch({ fontFamily: f.family })}
                style={{ fontFamily: fontStack(f.family) }}
              >
                {f.label}
              </Chip>
            ))}
          </ChipRow>
          <ColorPicker label="Colour" value={layer.color} onChange={(c) => patch({ color: c })} />
          <Slider
            label="Size"
            min={10}
            max={150}
            defaultValue={30}
            value={Math.round(layer.fontSize * 1000)}
            onChange={(v) => patch({ fontSize: v / 1000 }, true)}
            onCommit={(v) => patch({ fontSize: v / 1000 })}
          />
          <Slider
            label="Opacity"
            min={5}
            max={100}
            defaultValue={60}
            value={Math.round(layer.opacity * 100)}
            onChange={(v) => patch({ opacity: v / 100 }, true)}
            onCommit={(v) => patch({ opacity: v / 100 })}
          />
          <Slider
            label="Margin"
            min={0}
            max={150}
            defaultValue={30}
            value={Math.round(layer.margin * 1000)}
            onChange={(v) => patch({ margin: v / 1000 }, true)}
            onCommit={(v) => patch({ margin: v / 1000 })}
          />
        </div>
      )}
    </div>
  );
}
