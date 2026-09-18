import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Plus } from 'lucide-react';
import { FONT_OPTIONS, createTextLayer, fontStack, type TextLayer } from '@photoditor-buddy/core';
import { useEditorStore, useSnapshot } from '../store/editorStore';
import { Button } from '../components/common/Button';
import { Chip, ChipRow } from '../components/common/Chip';
import { ColorPicker } from '../components/common/ColorPicker';
import { IconButton } from '../components/common/IconButton';
import { Slider } from '../components/common/Slider';
import { PanelHeader, Hint, Section } from '../components/common/Section';
import { LayerCommonControls } from './layerControls';

/** Text layers: add, edit content, font, colour, outline, background, shadow, curve. */
export function TextPanel() {
  const snapshot = useSnapshot();
  const selectedId = useEditorStore((s) => s.selectedLayerId);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const addLayer = useEditorStore((s) => s.addLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const textLayers = snapshot.overlays.filter((l): l is TextLayer => l.type === 'text');
  const layer = textLayers.find((l) => l.id === selectedId) ?? null;
  const patch = (p: Partial<TextLayer>, live = false): void => {
    if (layer) updateLayer(layer.id, p, live);
  };

  return (
    <div data-testid="text-panel">
      <PanelHeader
        title="Text"
        right={
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => addLayer(createTextLayer())}
            data-testid="add-text"
          >
            Add text
          </Button>
        }
      />
      {textLayers.length > 1 && (
        <ChipRow>
          {textLayers.map((l, i) => (
            <Chip key={l.id} active={l.id === selectedId} onClick={() => selectLayer(l.id)}>
              {l.text.slice(0, 14) || `Text ${i + 1}`}
            </Chip>
          ))}
        </ChipRow>
      )}
      {!layer && (
        <Hint>
          Tap "Add text", then drag it on the photo. Pinch (or use the sliders) to resize and
          rotate.
        </Hint>
      )}
      {layer && (
        <div>
          <textarea
            className="w-full bg-surface-2 border border-border rounded-xl p-2 text-sm min-h-[64px] focus:outline-none focus:border-accent"
            value={layer.text}
            onChange={(e) => patch({ text: e.target.value }, true)}
            onBlur={(e) => patch({ text: e.target.value })}
            aria-label="Text content"
            data-testid="text-content"
          />
          <Section title="Font">
            <ChipRow>
              {FONT_OPTIONS.map((f) => (
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
            <div className="flex gap-1 mt-1">
              <IconButton
                label="Bold"
                icon={<Bold size={16} />}
                active={layer.bold}
                onClick={() => patch({ bold: !layer.bold })}
              />
              <IconButton
                label="Italic"
                icon={<Italic size={16} />}
                active={layer.italic}
                onClick={() => patch({ italic: !layer.italic })}
              />
              <span className="w-2" />
              <IconButton
                label="Align left"
                icon={<AlignLeft size={16} />}
                active={layer.align === 'left'}
                onClick={() => patch({ align: 'left' })}
              />
              <IconButton
                label="Align centre"
                icon={<AlignCenter size={16} />}
                active={layer.align === 'center'}
                onClick={() => patch({ align: 'center' })}
              />
              <IconButton
                label="Align right"
                icon={<AlignRight size={16} />}
                active={layer.align === 'right'}
                onClick={() => patch({ align: 'right' })}
              />
            </div>
          </Section>
          <ColorPicker
            label="Text colour"
            value={layer.color}
            onChange={(c) => patch({ color: c })}
          />
          <ColorPicker
            label="Background"
            value={layer.background ?? ''}
            allowNone
            onChange={(c) => patch({ background: c || null })}
          />
          <ColorPicker
            label="Outline"
            value={layer.strokeColor ?? ''}
            allowNone
            onChange={(c) =>
              patch({
                strokeColor: c || null,
                strokeWidth: c ? Math.max(layer.strokeWidth, 0.08) : 0,
              })
            }
          />
          {layer.strokeColor && (
            <Slider
              label="Outline width"
              min={1}
              max={30}
              defaultValue={8}
              value={Math.round(layer.strokeWidth * 100)}
              onChange={(v) => patch({ strokeWidth: v / 100 }, true)}
              onCommit={(v) => patch({ strokeWidth: v / 100 })}
            />
          )}
          <Slider
            label="Letter spacing"
            min={-10}
            max={50}
            value={Math.round(layer.letterSpacing * 100)}
            onChange={(v) => patch({ letterSpacing: v / 100 }, true)}
            onCommit={(v) => patch({ letterSpacing: v / 100 })}
          />
          <Slider
            label="Line height"
            min={80}
            max={200}
            defaultValue={120}
            value={Math.round(layer.lineHeight * 100)}
            format={(v) => `${v}%`}
            onChange={(v) => patch({ lineHeight: v / 100 }, true)}
            onCommit={(v) => patch({ lineHeight: v / 100 })}
          />
          <Slider
            label="Curve"
            min={-100}
            max={100}
            value={layer.curve}
            onChange={(v) => patch({ curve: v }, true)}
            onCommit={(v) => patch({ curve: v })}
            description="Bends a single line of text on an arc."
          />
          <label className="flex items-center gap-2 text-xs py-1">
            <input
              type="checkbox"
              checked={layer.shadow}
              onChange={(e) => patch({ shadow: e.target.checked })}
            />{' '}
            Drop shadow
          </label>
          <LayerCommonControls layer={layer} sizeKey="fontSize" />
        </div>
      )}
    </div>
  );
}
