import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PhotoEditor, useEditorStore, useInteractionStore } from '@photoditor-buddy/ui';
import * as core from '@photoditor-buddy/core';

/** Test hook: with `?e2e` in the URL editor stores and core are exposed for end-to-end tests. */
if (window.location.search.includes('e2e')) {
  (window as unknown as { __pb: unknown }).__pb = {
    store: useEditorStore,
    interaction: useInteractionStore,
    core,
  };
}

/** Standalone app entry point. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PhotoEditor />
  </StrictMode>,
);
