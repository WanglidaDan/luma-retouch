import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Settings, Sparkles } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { createSampleImage } from '../engine/sampleImage';
import { Button } from '../components/common/Button';
import { AiBadge } from '../components/common/AiBadge';

const HIGHLIGHTS: { title: string; text: string; ai?: 'cloud' | 'local' }[] = [
  {
    title: 'Natural skin',
    text: 'Soft, edge-aware retouching that preserves expression and texture.',
    ai: 'local',
  },
  {
    title: 'Face shaping',
    text: 'Subtle face and jaw refinement, ready to adjust per person.',
    ai: 'local',
  },
  {
    title: 'Private by default',
    text: 'Portrait detection and adjustments run directly on your Mac.',
    ai: 'local',
  },
  { title: 'Built for delivery', text: 'Undoable edits, before and after, and batch export.' },
];

/** Mac-first landing screen for importing a portrait into automatic retouch. */
export function HomeScreen() {
  const openFile = useEditorStore((s) => s.openFile);
  const openCanvas = useEditorStore((s) => s.openCanvas);
  const setScreen = useEditorStore((s) => s.setScreen);
  const setSettingsOpen = useEditorStore((s) => s.setSettingsOpen);
  const embed = useEditorStore((s) => s.embed);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent): void => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) =>
        f.type.startsWith('image/'),
      );
      if (file) void openFile(file, file.name || 'pasted-image.png');
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [openFile]);

  /** Opens the bundled sample photo; if it cannot be fetched (offline build), draws a picture instead. */
  const openSamplePhoto = async (): Promise<void> => {
    try {
      const response = await fetch(new URL('sample.jpg', document.baseURI).toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await openFile(await response.blob(), 'sample-photo.jpg');
    } catch {
      openCanvas(createSampleImage(), 'sample-photo.jpg', 'image/jpeg');
    }
  };

  const onDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setDragging(false);
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'));
    if (file) void openFile(file);
  };

  return (
    <div
      className={`h-full overflow-y-auto ${dragging ? 'bg-accent/10' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      data-testid="home"
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void openFile(f);
          e.target.value = '';
        }}
        data-testid="open-file-input"
      />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-7 sm:py-10">
        <div className="flex items-center justify-between mb-14 sm:mb-20">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-accent text-accent-contrast flex items-center justify-center font-black tracking-tight">
              LR
            </span>
            <span className="font-semibold tracking-tight text-lg">Luma Retouch</span>
          </div>
          {!embed && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Settings size={16} />}
              onClick={() => setSettingsOpen(true)}
              data-testid="home-settings"
            >
              Settings
            </Button>
          )}
        </div>
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center mb-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Mac Portrait Studio
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.04] tracking-[-0.045em] mb-5 max-w-2xl">
              Your portrait retouch starts as soon as you import.
            </h1>
            <p className="text-muted text-sm sm:text-base mb-8 max-w-lg leading-relaxed">
              Luma balances light, finds faces and applies a restrained skin finish automatically.
              Keep the result, or fine-tune every detail.
            </p>
            <button
              type="button"
              data-testid="open-photo"
              className="group flex items-center gap-4 rounded-2xl bg-accent text-accent-contrast px-5 py-4 text-left shadow-[0_14px_50px_rgba(214,255,103,0.12)] transition hover:brightness-105 active:scale-[0.99]"
              onClick={() => fileRef.current?.click()}
            >
              <span className="h-11 w-11 rounded-xl bg-black/10 flex items-center justify-center">
                <ImagePlus size={21} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">Import and auto retouch</span>
                <span className="block text-xs opacity-70 mt-0.5">
                  JPG, PNG, WebP or HEIC · processed locally
                </span>
              </span>
              <span className="ml-3 text-xl transition-transform group-hover:translate-x-1">↗</span>
            </button>
            <p className="text-[11px] text-muted mt-3 ml-1">
              First import downloads the face model once. Your photo stays on this Mac.
            </p>
          </div>
          <div className="relative min-h-[250px] sm:min-h-[330px] rounded-[28px] overflow-hidden border border-border bg-surface">
            <img
              src="./sample.jpg"
              alt="Portrait preview"
              className="absolute inset-0 h-full w-full object-cover opacity-65"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/5 to-black/10" />
            <div className="absolute left-5 right-5 bottom-5 flex items-end justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/65 mb-1">
                  Automatic finish
                </div>
                <div className="font-medium text-white text-lg">Skin · light · face shape</div>
              </div>
              <div className="rounded-full border border-white/20 bg-black/25 backdrop-blur px-3 py-1.5 text-[11px] text-white/90">
                Non-destructive
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-5 mb-3">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted font-semibold">
            A focused portrait workflow
          </h2>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              data-testid="open-sample"
              className="rounded-lg px-2 sm:px-3 py-2 text-[11px] sm:text-xs text-muted hover:text-text transition"
              onClick={() => void openSamplePhoto()}
            >
              Try sample photo
            </button>
            <button
              type="button"
              data-testid="open-collage"
              className="rounded-lg px-2 sm:px-3 py-2 text-[11px] sm:text-xs text-muted hover:text-text transition"
              onClick={() => setScreen('collage')}
            >
              Collage
            </button>
            <button
              type="button"
              data-testid="open-batch"
              className="rounded-lg border border-border px-2 sm:px-3 py-2 text-[11px] sm:text-xs text-text hover:border-accent transition"
              onClick={() => setScreen('batch')}
            >
              Batch edit
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-7">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="rounded-xl bg-surface/70 border border-border/80 p-3 sm:p-4"
            >
              <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm">
                {h.ai === 'cloud' ? <Sparkles size={14} className="text-accent" /> : null}
                {h.title}
                {h.ai && <AiBadge kind={h.ai} />}
              </div>
              <div className="text-[11px] sm:text-xs text-muted mt-1.5 leading-relaxed">
                {h.text}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted mt-8">
          Open source (MIT). Your photos never leave your device unless you use a cloud AI tool.
        </p>
      </div>
    </div>
  );
}
