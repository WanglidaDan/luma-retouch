import type { ToolId } from './store/types';

/** Tool rail entries in display order. `icon` is a lucide-react icon name resolved in ToolRail. */
export interface ToolDefinition {
  id: ToolId;
  label: string;
  icon: string;
  /** Marks tools that involve an AI model (cloud or on-device). */
  ai?: 'cloud' | 'local';
}

export const TOOLS: readonly ToolDefinition[] = [
  { id: 'adjust', label: 'Adjust', icon: 'SlidersHorizontal' },
  { id: 'filters', label: 'Filters', icon: 'Aperture' },
  { id: 'crop', label: 'Crop', icon: 'Crop' },
  { id: 'beauty', label: 'Beauty', icon: 'Smile', ai: 'local' },
  { id: 'ai', label: 'AI', icon: 'Sparkles', ai: 'cloud' },
  { id: 'effects', label: 'Effects', icon: 'Wand2' },
  { id: 'text', label: 'Text', icon: 'Type' },
  { id: 'stickers', label: 'Stickers', icon: 'Sticker' },
  { id: 'frames', label: 'Frames', icon: 'Frame' },
  { id: 'doodle', label: 'Doodle', icon: 'Brush' },
  { id: 'mosaic', label: 'Mosaic', icon: 'Grid3x3' },
  { id: 'watermark', label: 'Watermark', icon: 'Stamp' },
  { id: 'layers', label: 'Layers', icon: 'Layers' },
];
