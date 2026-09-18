import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Trash2, Undo2 } from 'lucide-react';
import {
  MAKEUP_DEFINITIONS,
  RESHAPE_DEFINITIONS,
  SKIN_DEFINITIONS,
  defaultPortraitSettings,
  type PortraitSettings,
} from '@photoditor-buddy/core';
import { useEditorStore, useSnapshot } from '../store/editorStore';
import { useInteractionStore, type BeautyMode } from '../store/interactionStore';
import { AiBadge } from '../components/common/AiBadge';
import { Button } from '../components/common/Button';
import { Chip, ChipRow } from '../components/common/Chip';
import { ColorPicker } from '../components/common/ColorPicker';
import { Slider } from '../components/common/Slider';
import { Tabs } from '../components/common/Tabs';
import { PanelHeader, Hint } from '../components/common/Section';

const TABS: { id: BeautyMode; label: string }[] = [
  { id: 'skin', label: 'Skin' },
  { id: 'reshape', label: 'Reshape' },
  { id: 'makeup', label: 'Makeup' },
  { id: 'liquify', label: 'Liquify' },
  { id: 'blemish', label: 'Blemish' },
];

/**
 * Portrait retouching. Face landmarks are detected on-device (MediaPipe, free); skin, reshape
 * and makeup need a face, while Liquify works on any photo.
 */
export function BeautyPanel() {
  const snapshot = useSnapshot();
  const facesStatus = useEditorStore((s) => s.facesStatus);
  const faces = useEditorStore((s) => s.faces);
  const ensureFaces = useEditorStore((s) => s.ensureFaces);
  const updateLive = useEditorStore((s) => s.updateLive);
  const commit = useEditorStore((s) => s.commit);
  const i = useInteractionStore();
  const setInteraction = useInteractionStore((s) => s.set);
  const [mode, setMode] = useState<BeautyMode>(i.beautyMode);
  const p = snapshot.portrait;

  useEffect(() => {
    void ensureFaces();
  }, [ensureFaces]);
  useEffect(() => {
    setInteraction({ beautyMode: mode });
    return () => setInteraction({ beautyMode: 'skin' });
  }, [mode, setInteraction]);

  const patch = (fn: (draft: PortraitSettings) => void, live: boolean): void => {
    const next = structuredClone(p);
    fn(next);
    if (live) updateLive({ portrait: next });
    else commit({ portrait: next });
  };
  const needsFace = mode === 'skin' || mode === 'reshape' || mode === 'makeup';
  const hasFace = facesStatus === 'ready' && (faces?.length ?? 0) > 0;

  return (
    <div data-testid="beauty-panel">
      <PanelHeader
        title="Beauty"
        badge={<AiBadge kind="local" />}
        right={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => commit({ portrait: defaultPortraitSettings() })}
          >
            Reset
          </Button>
        }
      />
      <Tabs tabs={TABS} value={mode} onChange={setMode} />
      {needsFace && facesStatus === 'loading' && (
        <div className="flex items-center gap-2 text-xs text-muted py-2">
          <Loader2 size={14} className="animate-spin" /> Finding faces (first time downloads a small
          model)…
        </div>
      )}
      {needsFace && (facesStatus === 'none' || facesStatus === 'error') && (
        <div className="text-xs text-muted py-2 flex items-center justify-between gap-2">
          <span>
            {facesStatus === 'none' ? 'No face detected in this photo.' : 'Face detection failed.'}
          </span>
          <Button
            size="sm"
            icon={<RefreshCw size={12} />}
            onClick={() => {
              useEditorStore.setState({ facesStatus: 'idle' });
              void ensureFaces();
            }}
          >
            Retry
          </Button>
        </div>
      )}
      {needsFace && hasFace && (
        <div className="text-[11px] text-success mb-1">
          {faces!.length === 1 ? '1 face found' : `${faces!.length} faces found`}
        </div>
      )}

      {mode === 'skin' && (
        <div className={hasFace ? '' : 'opacity-50 pointer-events-none'}>
          {SKIN_DEFINITIONS.map((d) => (
            <Slider
              key={d.key}
              label={d.label}
              description={d.description}
              min={0}
              max={100}
              value={p.skin[d.key]}
              onChange={(v) =>
                patch((x) => {
                  x.skin[d.key] = v;
                }, true)
              }
              onCommit={(v) =>
                patch((x) => {
                  x.skin[d.key] = v;
                }, false)
              }
            />
          ))}
        </div>
      )}
      {mode === 'reshape' && (
        <div className={hasFace ? '' : 'opacity-50 pointer-events-none'}>
          {RESHAPE_DEFINITIONS.map((d) => (
            <Slider
              key={d.key}
              label={d.label}
              description={d.description}
              min={-100}
              max={100}
              value={p.reshape[d.key]}
              onChange={(v) =>
                patch((x) => {
                  x.reshape[d.key] = v;
                }, true)
              }
              onCommit={(v) =>
                patch((x) => {
                  x.reshape[d.key] = v;
                }, false)
              }
            />
          ))}
        </div>
      )}
      {mode === 'makeup' && (
        <div className={hasFace ? '' : 'opacity-50 pointer-events-none'}>
          {MAKEUP_DEFINITIONS.map((d) => (
            <div key={d.key} className="mb-1">
              <ColorPicker
                label={d.label}
                value={p.makeup[d.key].color}
                swatches={d.swatches}
                onChange={(c) =>
                  patch((x) => {
                    x.makeup[d.key].color = c;
                    if (x.makeup[d.key].opacity === 0) x.makeup[d.key].opacity = 60;
                  }, false)
                }
              />
              <Slider
                label={`${d.label} strength`}
                min={0}
                max={100}
                value={p.makeup[d.key].opacity}
                onChange={(v) =>
                  patch((x) => {
                    x.makeup[d.key].opacity = v;
                  }, true)
                }
                onCommit={(v) =>
                  patch((x) => {
                    x.makeup[d.key].opacity = v;
                  }, false)
                }
              />
            </div>
          ))}
        </div>
      )}
      {mode === 'liquify' && (
        <div>
          <ChipRow>
            {(['push', 'bulge', 'pinch', 'restore'] as const).map((m) => (
              <Chip key={m} active={i.liquifyMode === m} onClick={() => i.set({ liquifyMode: m })}>
                {m[0]!.toUpperCase() + m.slice(1)}
              </Chip>
            ))}
          </ChipRow>
          <Slider
            label="Brush size"
            min={2}
            max={30}
            defaultValue={8}
            value={Math.round(i.liquifyRadius * 100)}
            onChange={(v) => i.set({ liquifyRadius: v / 100 })}
          />
          <Slider
            label="Strength"
            min={5}
            max={100}
            defaultValue={50}
            value={Math.round(i.liquifyStrength * 100)}
            onChange={(v) => i.set({ liquifyStrength: v / 100 })}
          />
          <div className="flex gap-2 mt-1">
            <Button
              size="sm"
              icon={<Undo2 size={14} />}
              disabled={p.liquify.length === 0}
              onClick={() =>
                patch((x) => {
                  x.liquify = x.liquify.slice(0, -1);
                }, false)
              }
            >
              Undo stroke
            </Button>
            <Button
              size="sm"
              icon={<Trash2 size={14} />}
              disabled={p.liquify.length === 0}
              onClick={() =>
                patch((x) => {
                  x.liquify = [];
                }, false)
              }
            >
              Clear
            </Button>
          </div>
          <Hint>
            Drag on the photo: Push moves pixels along your finger, Bulge enlarges, Pinch shrinks,
            Restore undoes locally. Works on bodies, clothes, anything.
          </Hint>
        </div>
      )}
      {mode === 'blemish' && (
        <div>
          <Slider
            label="Spot size"
            min={5}
            max={80}
            defaultValue={30}
            value={Math.round(i.brushSize * 1000)}
            onChange={(v) => i.set({ brushSize: v / 1000 })}
          />
          <Slider
            label="Strength"
            min={0}
            max={100}
            defaultValue={100}
            value={p.skin.blemish}
            onChange={(v) =>
              patch((x) => {
                x.skin.blemish = v;
              }, true)
            }
            onCommit={(v) =>
              patch((x) => {
                x.skin.blemish = v;
              }, false)
            }
          />
          <div className="flex gap-2 mt-1">
            <Button
              size="sm"
              icon={<Undo2 size={14} />}
              disabled={p.blemishSpots.length === 0}
              onClick={() =>
                patch((x) => {
                  x.blemishSpots = x.blemishSpots.slice(0, -1);
                }, false)
              }
            >
              Undo spot
            </Button>
            <Button
              size="sm"
              icon={<Trash2 size={14} />}
              disabled={p.blemishSpots.length === 0}
              onClick={() =>
                patch((x) => {
                  x.blemishSpots = [];
                }, false)
              }
            >
              Clear
            </Button>
          </div>
          <Hint>Tap a pimple or spot to smooth it away. No face needed.</Hint>
        </div>
      )}
    </div>
  );
}
