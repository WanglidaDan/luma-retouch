import { useEffect, useMemo, useState } from 'react';
import { KeyRound, Play, Trash2, Undo2 } from 'lucide-react';
import {
  AI_TASKS,
  AI_TASK_CATEGORIES,
  GEMINI_MODELS,
  OPENAI_MODELS,
  chooseProvider,
  runAiTask,
  type AiTask,
  type AiTaskCategory,
  type AiTaskOption,
} from '@photoditor-buddy/ai';
import { keyVault, useEditorStore, useSnapshot } from '../store/editorStore';
import { useInteractionStore } from '../store/interactionStore';
import { renderPreviewComposite } from '../engine/exportImage';
import { AiBadge } from '../components/common/AiBadge';
import { Button } from '../components/common/Button';
import { Chip, ChipRow } from '../components/common/Chip';
import { Slider } from '../components/common/Slider';
import { PanelHeader, Hint, Section } from '../components/common/Section';
import { LucideIcon } from '../components/editor/ToolRail';

/**
 * AI tools. Cloud tasks use the user's own key (Gemini by default, OpenAI for painted masks);
 * local tasks download a free model once and run on the device.
 */
export function AiPanel() {
  const snapshot = useSnapshot();
  const faces = useEditorStore((s) => s.faces);
  const aiSettings = useEditorStore((s) => s.aiSettings);
  const setSettingsOpen = useEditorStore((s) => s.setSettingsOpen);
  const setBusy = useEditorStore((s) => s.setBusy);
  const toast = useEditorStore((s) => s.toast);
  const commitSource = useEditorStore((s) => s.commitSource);
  const undo = useEditorStore((s) => s.undo);
  const canUndo = useEditorStore((s) => s.canUndo);
  const i = useInteractionStore();
  const setInteraction = useInteractionStore((s) => s.set);
  const [category, setCategory] = useState<AiTaskCategory>('Fix');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const task = useMemo(() => AI_TASKS.find((t) => t.id === taskId) ?? null, [taskId]);
  const tasks = AI_TASKS.filter((t) => t.category === category);
  // Mask painting is on while a masking task is selected; the mask is cleared when leaving the tool.
  const usesMask = Boolean(task?.usesMask);
  useEffect(() => {
    setInteraction({ aiMaskPainting: usesMask });
    return () => setInteraction({ aiMaskPainting: false });
  }, [usesMask, setInteraction]);
  useEffect(() => () => setInteraction({ aiMask: null, aiMaskPainting: false }), [setInteraction]);

  const hasMask = Boolean(i.aiMask) && i.aiMaskVersion > 0;

  const run = async (task: AiTask, text: string, option: AiTaskOption | null): Promise<void> => {
    if (task.needsPrompt && !text.trim() && task.id !== 'ai-remove') {
      toast('Please describe what you want first.', 'info');
      return;
    }
    const controller = new AbortController();
    setBusy({
      message: task.runtime === 'local' ? 'Preparing…' : 'Sending to AI…',
      cancel: () => controller.abort(),
    });
    try {
      const image = renderPreviewComposite(snapshot, faces, true);
      const result = await runAiTask({
        task,
        image,
        text,
        option: option ?? undefined,
        mask: task.usesMask && hasMask ? i.aiMask : null,
        settings: aiSettings,
        vault: keyVault,
        signal: controller.signal,
        onProgress: (p) =>
          setBusy({ message: p.stage, progress: p.progress, cancel: () => controller.abort() }),
      });
      commitSource(result.canvas, {
        keepOverlays: true,
        resetLook: true,
        mimeType: task.local === 'remove-background' ? 'image/png' : undefined,
      });
      i.set({ aiMask: null });
      setLastRun(`${task.name} · ${result.model}`);
      toast(
        `${task.name} done${result.note ? `: ${result.note.slice(0, 120)}` : ''}. Undo brings the previous version back.`,
        'success',
      );
    } catch (error) {
      const err = error as { code?: string; message?: string };
      if (err.code === 'cancelled') toast('Cancelled.', 'info');
      else {
        toast(err.message ?? 'The AI request failed.', 'error');
        if (err.code === 'missing-key' || err.code === 'invalid-key') setSettingsOpen(true);
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div data-testid="ai-panel">
      <PanelHeader
        title="AI tools"
        badge={<AiBadge />}
        right={
          <Button
            size="sm"
            variant="ghost"
            icon={<KeyRound size={14} />}
            onClick={() => setSettingsOpen(true)}
            data-testid="ai-keys"
          >
            Keys
          </Button>
        }
      />
      {!keyVault.has('gemini') && !keyVault.has('openai') && (
        <div className="rounded-xl border border-border bg-surface-2 p-2 text-xs mb-2">
          Cloud AI tools need your own API key (Gemini or OpenAI). Keys stay on this device. Free
          on-device tools work without a key.
          <div className="mt-1">
            <Button size="sm" variant="ai" onClick={() => setSettingsOpen(true)}>
              Add a key
            </Button>
          </div>
        </div>
      )}
      <ChipRow>
        {AI_TASK_CATEGORIES.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
            {c}
          </Chip>
        ))}
      </ChipRow>
      <div className="grid grid-cols-2 gap-2 mt-1" data-testid="ai-task-grid">
        {tasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            active={taskId === t.id}
            onClick={() => setTaskId(taskId === t.id ? null : t.id)}
          />
        ))}
      </div>
      {task && (
        <TaskForm
          key={task.id}
          task={task}
          hasMask={hasMask}
          onRun={(text, option) => void run(task, text, option)}
          onClearMask={() => i.set({ aiMask: null, aiMaskVersion: 0 })}
          undoButton={
            lastRun && canUndo ? (
              <Button icon={<Undo2 size={16} />} onClick={undo} title="Undo the last AI result">
                Undo
              </Button>
            ) : null
          }
        />
      )}
    </div>
  );
}

/** Prompt, options, mask brush and the Run button for one task. Keyed by task id so state resets per task. */
function TaskForm({
  task,
  hasMask,
  onRun,
  onClearMask,
  undoButton,
}: {
  task: AiTask;
  hasMask: boolean;
  onRun: (text: string, option: AiTaskOption | null) => void;
  onClearMask: () => void;
  undoButton: React.ReactNode;
}) {
  const aiSettings = useEditorStore((s) => s.aiSettings);
  const i = useInteractionStore();
  const [text, setText] = useState('');
  const [option, setOption] = useState<AiTaskOption | null>(task.options?.[0] ?? null);
  const providerId =
    task.runtime === 'cloud' ? chooseProvider(task, hasMask, aiSettings, keyVault) : null;
  const providerHasKey = providerId ? keyVault.has(providerId) : true;
  const modelLabel =
    providerId === 'gemini'
      ? GEMINI_MODELS.find((m) => m.id === aiSettings.geminiModel)
      : providerId === 'openai'
        ? OPENAI_MODELS.find((m) => m.id === aiSettings.openAiModel)
        : null;
  return (
    <Section title={task.name} className="mt-3">
      <Hint>{task.description}</Hint>
      {task.needsPrompt && (
        <textarea
          className="w-full mt-2 bg-surface-2 border border-border rounded-xl p-2 text-sm min-h-[56px] focus:outline-none focus:border-accent"
          placeholder={task.promptPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Instruction"
          data-testid="ai-prompt"
        />
      )}
      {task.options && (
        <ChipRow className="mt-1">
          {task.options.map((o) => (
            <Chip key={o.id} active={option?.id === o.id} onClick={() => setOption(o)}>
              {o.label}
            </Chip>
          ))}
        </ChipRow>
      )}
      {task.usesMask && (
        <div className="mt-2">
          <div className="text-xs text-muted mb-1">
            {task.runtime === 'local'
              ? 'Paint over the object to remove.'
              : 'Optional: paint over the area to change (more precise).'}
          </div>
          <Slider
            label="Brush size"
            min={5}
            max={200}
            defaultValue={30}
            value={Math.round(i.brushSize * 1000)}
            onChange={(v) => i.set({ brushSize: v / 1000 })}
          />
          <Button size="sm" icon={<Trash2 size={14} />} disabled={!hasMask} onClick={onClearMask}>
            Clear mask
          </Button>
        </div>
      )}
      {task.runtime === 'cloud' && (
        <div className="text-[11px] text-muted mt-2">
          {providerHasKey
            ? `Runs on ${providerId === 'gemini' ? 'Gemini' : 'OpenAI'} · ${modelLabel?.label ?? ''} · ${modelLabel?.price ?? ''}`
            : 'Needs an API key (Settings → AI keys).'}
          {task.usesMask &&
            hasMask &&
            providerId === 'gemini' &&
            ' · Gemini has no true mask input; your mask is described in the prompt. Add an OpenAI key for exact masks.'}
        </div>
      )}
      {task.runtime === 'local' && (
        <div className="text-[11px] text-muted mt-2">
          Free. The model downloads once and is cached in this browser.
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <Button
          block
          variant={task.runtime === 'cloud' ? 'ai' : 'primary'}
          icon={<Play size={16} />}
          onClick={() => onRun(text, option)}
          disabled={task.runtime === 'cloud' && !providerHasKey}
          data-testid="ai-run"
        >
          {task.runtime === 'cloud' ? 'Generate' : 'Run'}
        </Button>
        {undoButton}
      </div>
    </Section>
  );
}

function TaskCard({
  task,
  active,
  onClick,
}: {
  task: AiTask;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      data-testid={`ai-task-${task.id}`}
      className={`text-left rounded-xl border p-2 transition ${active ? 'border-accent bg-accent/10' : 'border-border bg-surface-2 hover:bg-surface-3'}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-1">
        <LucideIcon name={task.icon} size={18} className={active ? 'text-accent' : 'text-muted'} />
        <AiBadge kind={task.runtime} />
      </div>
      <div className="text-xs font-semibold mt-1 leading-tight">{task.name}</div>
    </button>
  );
}
