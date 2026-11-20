import { useRef, useState } from 'react';
import { ChevronLeft, Download, ImagePlus } from 'lucide-react';
import {
  FILTER_CATALOG,
  Renderer,
  bitmapToCanvas,
  canvasToBlob,
  createZip,
  defaultPortraitSettings,
  defaultAdjustments,
  detectFaces,
  exportFileName,
  fitWithin,
  loadImageFromBlob,
  stackPreset,
  downloadBlob,
  type ExportFormat,
  type FaceLandmarks,
  type FilterDefinition,
  type PortraitSettings,
} from '@photoditor-buddy/core';
import { useEditorStore } from '../store/editorStore';
import type { EditSnapshot } from '../store/types';
import { resolveRenderState } from '../engine/resolveRenderState';
import { Button } from '../components/common/Button';
import { Chip, ChipRow } from '../components/common/Chip';
import { IconButton } from '../components/common/IconButton';
import { Section, Hint } from '../components/common/Section';
import { Slider } from '../components/common/Slider';

/** Applies one look (the last edited photo's look, or a chosen filter) to many photos and zips them. */
export function BatchScreen() {
  const setScreen = useEditorStore((s) => s.setScreen);
  const lookTemplate = useEditorStore((s) => s.lookTemplate);
  const setBusy = useEditorStore((s) => s.setBusy);
  const toast = useEditorStore((s) => s.toast);
  const [files, setFiles] = useState<File[]>([]);
  const [useTemplate, setUseTemplate] = useState(Boolean(lookTemplate));
  const [filter, setFilter] = useState<FilterDefinition | null>(null);
  const [format, setFormat] = useState<ExportFormat>('image/jpeg');
  const [maxEdge, setMaxEdge] = useState<number>(2048);
  const [quality, setQuality] = useState(90);
  const [portraitEnabled, setPortraitEnabled] = useState(true);
  const [smooth, setSmooth] = useState(lookTemplate?.portrait.skin.smooth ?? 22);
  const [faceSlim, setFaceSlim] = useState(lookTemplate?.portrait.reshape.faceSlim ?? 6);
  const [jaw, setJaw] = useState(lookTemplate?.portrait.reshape.jaw ?? 3);
  const [reuseLiquify, setReuseLiquify] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const popularFilters = FILTER_CATALOG.filter((f) =>
    ['Minimal', 'Film', 'Portrait', 'Japanese', 'Cinematic'].includes(f.category),
  );

  const run = async (): Promise<void> => {
    if (files.length === 0) return;
    const renderer = new Renderer(document.createElement('canvas'));
    const entries: { name: string; data: Uint8Array }[] = [];
    let faceDetectionWarning = false;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        setBusy({
          message: `Processing ${i + 1} / ${files.length}: ${file.name}`,
          progress: i / files.length,
        });
        try {
          const loaded = await loadImageFromBlob(file, file.name);
          const size = fitWithin(
            loaded.width,
            loaded.height,
            Math.min(maxEdge, renderer.maxTextureSize),
          );
          const source = bitmapToCanvas(loaded.bitmap, size.width, size.height);
          loaded.bitmap.close();
          renderer.setSource(source);
          const base =
            useTemplate && lookTemplate ? lookTemplate.adjustments : defaultAdjustments();
          const activeFilter =
            useTemplate && lookTemplate
              ? lookTemplate.filter
                ? (FILTER_CATALOG.find((f) => f.id === lookTemplate.filter!.id) ?? null)
                : null
              : filter;
          const intensity =
            useTemplate && lookTemplate?.filter ? lookTemplate.filter.intensity / 100 : 1;
          const adjustments = activeFilter
            ? stackPreset(base, activeFilter.preset, intensity)
            : base;
          const { buildRecipeLut } = await import('@photoditor-buddy/core');
          const lut = activeFilter?.lut ? buildRecipeLut(activeFilter.lut) : null;
          const portrait = createBatchPortraitSettings({
            enabled: portraitEnabled,
            useTemplate,
            template: lookTemplate?.portrait ?? null,
            smooth,
            faceSlim,
            jaw,
            reuseLiquify,
          });
          let faces: FaceLandmarks[] | null = null;
          if (portraitEnabled && hasFaceDependentSettings(portrait)) {
            try {
              faces = await detectFaces(source);
            } catch {
              faceDetectionWarning = true;
            }
          }
          const snapshot: EditSnapshot = {
            source: {
              full: source,
              preview: source,
              fileName: file.name,
              mimeType: file.type,
            },
            adjustments,
            filter: null,
            effect: useTemplate && lookTemplate ? lookTemplate.effect : null,
            overlays: [],
            portrait,
            userLut: null,
          };
          renderer.render({
            ...resolveRenderState(snapshot, faces),
            adjustments: lut
              ? { ...adjustments, lut: { id: activeFilter!.id, intensity: intensity * 100 } }
              : adjustments,
            lut,
          });
          const blob = await canvasToBlob(renderer.snapshot(), { format, quality: quality / 100 });
          entries.push({
            name: exportFileName(file.name, format),
            data: new Uint8Array(await blob.arrayBuffer()),
          });
        } catch (error) {
          toast(
            `Skipped ${file.name}: ${error instanceof Error ? error.message : 'error'}`,
            'error',
          );
        }
      }
      if (entries.length === 0) return;
      if (entries.length === 1) {
        downloadBlob(new Blob([entries[0]!.data as BlobPart], { type: format }), entries[0]!.name);
      } else {
        downloadBlob(createZip(entries), `luma-retouch-batch-${entries.length}.zip`);
      }
      toast(`Done: ${entries.length} photo${entries.length > 1 ? 's' : ''} exported.`, 'success');
      if (faceDetectionWarning)
        toast(
          'Some photos were exported without face retouch because face analysis was unavailable.',
          'info',
        );
    } finally {
      renderer.dispose();
      setBusy(null);
    }
  };

  return (
    <div className="h-full flex flex-col" data-testid="batch">
      <header className="h-12 shrink-0 flex items-center gap-1 px-2 border-b border-border bg-surface">
        <IconButton
          label="Back"
          icon={<ChevronLeft size={20} />}
          onClick={() => setScreen('home')}
        />
        <h1 className="font-semibold text-sm">Batch edit</h1>
      </header>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          setFiles([...files, ...Array.from(e.target.files ?? [])]);
          e.target.value = '';
        }}
        data-testid="batch-files"
      />
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl w-full mx-auto">
        <Section
          title="Photos"
          right={
            <Button
              size="sm"
              icon={<ImagePlus size={14} />}
              onClick={() => fileRef.current?.click()}
              data-testid="batch-add"
            >
              Add photos
            </Button>
          }
        >
          {files.length === 0 ? (
            <Hint>
              Choose the photos to process. They are handled one by one on your device and
              downloaded as a ZIP.
            </Hint>
          ) : (
            <ul className="text-xs text-muted flex flex-wrap gap-1">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="bg-surface-2 rounded-full px-2 py-1">
                  {f.name}
                </li>
              ))}
            </ul>
          )}
          {files.length > 0 && (
            <Button size="sm" variant="ghost" className="mt-1" onClick={() => setFiles([])}>
              Clear list
            </Button>
          )}
        </Section>
        <Section title="Look to apply">
          <ChipRow>
            {lookTemplate && (
              <Chip active={useTemplate} onClick={() => setUseTemplate(true)}>
                Look from my last edit
              </Chip>
            )}
            <Chip
              active={!useTemplate && filter === null}
              onClick={() => {
                setUseTemplate(false);
                setFilter(null);
              }}
            >
              No filter (convert/resize only)
            </Chip>
            {popularFilters.map((f) => (
              <Chip
                key={f.id}
                active={!useTemplate && filter?.id === f.id}
                onClick={() => {
                  setUseTemplate(false);
                  setFilter(f);
                }}
              >
                {f.name}
              </Chip>
            ))}
          </ChipRow>
          <Hint>
            Tip: edit one photo, open Export → "Batch…" to reuse its adjustments, portrait settings
            and effect here.
          </Hint>
        </Section>
        <Section title="Portrait retouch">
          <label className="flex items-center gap-2 text-sm py-1">
            <input
              type="checkbox"
              checked={portraitEnabled}
              onChange={(event) => setPortraitEnabled(event.target.checked)}
            />
            Apply on-device skin and face retouch
          </label>
          <Slider
            label="Smooth skin"
            min={0}
            max={100}
            defaultValue={22}
            value={smooth}
            onChange={setSmooth}
            disabled={!portraitEnabled}
          />
          <Slider
            label="Face slim"
            min={0}
            max={100}
            defaultValue={6}
            value={faceSlim}
            onChange={setFaceSlim}
            disabled={!portraitEnabled}
          />
          <Slider
            label="Jaw refinement"
            min={0}
            max={100}
            defaultValue={3}
            value={jaw}
            onChange={setJaw}
            disabled={!portraitEnabled}
          />
          <label className="flex items-center gap-2 text-sm py-1">
            <input
              type="checkbox"
              checked={reuseLiquify}
              onChange={(event) => setReuseLiquify(event.target.checked)}
              disabled={!lookTemplate?.portrait.liquify.length}
            />
            Reuse body liquify strokes from the last edit
          </label>
          <Hint>
            Face retouch adapts to detected faces. Body liquify reuses the same positions from your
            last edit, so use a matching pose and crop. Automatic leg or body reshaping is not
            available yet.
          </Hint>
        </Section>
        <Section title="Output">
          <ChipRow>
            {(
              [
                ['image/jpeg', 'JPG'],
                ['image/png', 'PNG'],
                ['image/webp', 'WebP'],
              ] as [ExportFormat, string][]
            ).map(([id, label]) => (
              <Chip key={id} active={format === id} onClick={() => setFormat(id)}>
                {label}
              </Chip>
            ))}
          </ChipRow>
          <ChipRow>
            {[4096, 2048, 1920, 1280, 1080].map((n) => (
              <Chip key={n} active={maxEdge === n} onClick={() => setMaxEdge(n)}>
                {n}px
              </Chip>
            ))}
          </ChipRow>
          {format !== 'image/png' && (
            <Slider
              label="Quality"
              min={40}
              max={100}
              defaultValue={90}
              value={quality}
              onChange={setQuality}
              format={(v) => `${v}%`}
            />
          )}
        </Section>
        <Button
          variant="primary"
          block
          size="lg"
          icon={<Download size={18} />}
          disabled={files.length === 0}
          onClick={() => void run()}
          data-testid="batch-run"
        >
          {files.length > 0
            ? `Process ${files.length} photo${files.length === 1 ? '' : 's'}`
            : 'Process photos'}
        </Button>
      </div>
    </div>
  );
}

/** Builds batch portrait settings, adapting face controls while optionally reusing body strokes. */
function createBatchPortraitSettings(options: {
  enabled: boolean;
  useTemplate: boolean;
  template: PortraitSettings | null;
  smooth: number;
  faceSlim: number;
  jaw: number;
  reuseLiquify: boolean;
}): PortraitSettings {
  if (!options.enabled) return defaultPortraitSettings();
  const portrait =
    options.useTemplate && options.template
      ? structuredClone(options.template)
      : defaultPortraitSettings();
  portrait.skin.smooth = options.smooth;
  portrait.reshape.faceSlim = options.faceSlim;
  portrait.reshape.jaw = options.jaw;
  if (!options.useTemplate || !options.template) {
    portrait.skin.whiten = 4;
    portrait.skin.eyes = 5;
  }
  if (!(options.reuseLiquify && options.template)) portrait.liquify = [];
  portrait.blemishSpots = [];
  return portrait;
}

/** Indicates whether face detection is needed for skin or face shape adjustments. */
function hasFaceDependentSettings(portrait: PortraitSettings): boolean {
  return (
    Object.values(portrait.skin).some((value) => value > 0) ||
    Object.values(portrait.reshape).some((value) => value !== 0) ||
    Object.values(portrait.makeup).some((item) => item.opacity > 0)
  );
}
