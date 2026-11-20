import { useEffect } from 'react';
import { installChineseUi } from './i18n/chinese';
import { useEditorStore } from './store/editorStore';
import { EditorShell } from './components/editor/EditorShell';
import { HomeScreen } from './screens/HomeScreen';
import { CollageScreen } from './screens/CollageScreen';
import { BatchScreen } from './screens/BatchScreen';
import { Toasts } from './components/common/Toasts';
import { BusyOverlay } from './components/common/BusyOverlay';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SettingsDialog } from './panels/SettingsDialog';
import { useEmbedBridge } from './embed/bridge';

export interface PhotoEditorProps {
  /** True when rendered inside `embed.html` (enables the postMessage bridge). */
  embed?: boolean;
}

/**
 * The complete editor application. Drop it into any React tree:
 * `<PhotoEditor />` fills its parent (give the parent a height).
 */
export function PhotoEditor({ embed = false }: PhotoEditorProps) {
  const screen = useEditorStore((s) => s.screen);
  const openFile = useEditorStore((s) => s.openFile);
  const settingsOpen = useEditorStore((s) => s.settingsOpen);
  const setSettingsOpen = useEditorStore((s) => s.setSettingsOpen);
  useEmbedBridge(embed);
  useEffect(() => installChineseUi(), []);
  useKeyboardShortcuts();
  return (
    <div className="h-full w-full bg-bg text-text overflow-hidden" data-testid="photoditor-buddy">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void openFile(file, file.name);
          event.target.value = '';
        }}
        data-testid="native-open-file-input"
      />
      <ErrorBoundary>
        {screen === 'home' && <HomeScreen />}
        {screen === 'editor' && <EditorShell />}
        {screen === 'collage' && <CollageScreen />}
        {screen === 'batch' && <BatchScreen />}
      </ErrorBoundary>
      {screen !== 'editor' && (
        <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      )}
      <Toasts />
      <BusyOverlay />
    </div>
  );
}

/** Ctrl/Cmd+Z undo, Shift+Ctrl/Cmd+Z redo, Delete removes the selected layer, Escape closes the tool. */
function useKeyboardShortcuts(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      )
        return;
      const s = useEditorStore.getState();
      if (s.screen !== 'editor') return;
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && s.selectedLayerId) {
        e.preventDefault();
        s.removeLayer(s.selectedLayerId);
      } else if (e.key === 'Escape') {
        s.setTool(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
