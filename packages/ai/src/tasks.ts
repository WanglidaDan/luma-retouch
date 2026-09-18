import type { AiRuntime, AspectRatio, ImageSize } from './types';

/** Categories used to group AI tools in the panel. */
export type AiTaskCategory = 'Fix' | 'Remove & Replace' | 'Portrait' | 'Style' | 'Scene' | 'Create';

/** Choice offered by a task (e.g. art styles). */
export interface AiTaskOption {
  id: string;
  label: string;
  /** Text merged into the prompt. */
  prompt: string;
}

/** One AI feature. Everything the UI needs to render its card and build a request. */
export interface AiTask {
  id: string;
  name: string;
  category: AiTaskCategory;
  description: string;
  runtime: AiRuntime;
  /** Lucide icon name used in the UI. */
  icon: string;
  /** The user types something (e.g. what to remove). */
  needsPrompt: boolean;
  promptPlaceholder?: string;
  /** The user paints a mask (used by OpenAI masked edits and the local eraser). */
  usesMask: boolean;
  options?: AiTaskOption[];
  /** Builds the final instruction sent to the model. */
  buildPrompt: (input: { text: string; option?: AiTaskOption }) => string;
  /** Requested output aspect ratio for cloud tasks (Expand uses this). */
  aspectRatio?: AspectRatio;
  size?: ImageSize;
  /** Which local function runs this task. */
  local?: 'remove-background' | 'upscale' | 'erase';
}

const KEEP =
  'Keep everything else exactly the same: same person, same pose, same framing, same lighting and colours. Output only the edited photo, no text.';

function task(t: AiTask): AiTask {
  return t;
}

/** The AI tool catalogue. Tasks marked `cloud` need a Gemini or OpenAI key; `local` ones are free. */
export const AI_TASKS: readonly AiTask[] = [
  // Fix
  task({
    id: 'local-remove-bg',
    name: 'Remove background',
    category: 'Remove & Replace',
    description: 'Cut out the subject with a transparent background. Free, runs on your device.',
    runtime: 'local',
    icon: 'Scissors',
    needsPrompt: false,
    usesMask: false,
    local: 'remove-background',
    buildPrompt: () => '',
  }),
  task({
    id: 'local-upscale',
    name: 'Upscale 2×',
    category: 'Fix',
    description: 'Doubles the resolution and sharpens details. Free, runs on your device.',
    runtime: 'local',
    icon: 'Maximize2',
    needsPrompt: false,
    usesMask: false,
    local: 'upscale',
    buildPrompt: () => '',
  }),
  task({
    id: 'local-erase',
    name: 'Eraser (offline)',
    category: 'Remove & Replace',
    description:
      'Paint over an object to remove it. Free, runs on your device (large download, best on desktop).',
    runtime: 'local',
    icon: 'Eraser',
    needsPrompt: false,
    usesMask: true,
    local: 'erase',
    buildPrompt: () => '',
  }),
  task({
    id: 'ai-enhance',
    name: 'HD Enhance',
    category: 'Fix',
    description: 'Re-renders the photo at higher resolution with cleaner detail.',
    runtime: 'cloud',
    icon: 'Sparkles',
    needsPrompt: false,
    usesMask: false,
    size: '2K',
    buildPrompt: () =>
      `Enhance this photo to high resolution: sharpen fine details, reduce noise and compression artifacts, fix soft focus, and improve clarity naturally. ${KEEP}`,
  }),
  task({
    id: 'ai-restore',
    name: 'Restore old photo',
    category: 'Fix',
    description: 'Repairs scratches, fading, creases and blur in old photographs.',
    runtime: 'cloud',
    icon: 'History',
    needsPrompt: false,
    usesMask: false,
    buildPrompt: () =>
      `Restore this old photograph: remove scratches, dust, creases, stains and fading; recover faces and details; fix blur. Keep it photorealistic and faithful to the original. ${KEEP}`,
  }),
  task({
    id: 'ai-colorize',
    name: 'Colorize',
    category: 'Fix',
    description: 'Adds realistic colour to black-and-white photos.',
    runtime: 'cloud',
    icon: 'Palette',
    needsPrompt: false,
    usesMask: false,
    buildPrompt: () =>
      `Colorize this black-and-white photograph with realistic, natural colours appropriate to the era and scene. ${KEEP}`,
  }),
  task({
    id: 'ai-exposure',
    name: 'Fix lighting',
    category: 'Fix',
    description: 'Corrects under/over-exposure, harsh shadows and colour casts.',
    runtime: 'cloud',
    icon: 'SunMedium',
    needsPrompt: false,
    usesMask: false,
    buildPrompt: () =>
      `Fix the lighting of this photo: correct exposure, recover blown highlights and dark shadows, remove colour casts, balance white balance. Natural result. ${KEEP}`,
  }),
  task({
    id: 'ai-unblur',
    name: 'Deblur',
    category: 'Fix',
    description: 'Sharpens motion blur and out-of-focus shots.',
    runtime: 'cloud',
    icon: 'Focus',
    needsPrompt: false,
    usesMask: false,
    buildPrompt: () =>
      `Remove blur from this photo and make it sharp and in focus, recovering detail in faces and textures. ${KEEP}`,
  }),
  // Remove & Replace
  task({
    id: 'ai-remove',
    name: 'AI Remove',
    category: 'Remove & Replace',
    description: 'Describe (or paint) what to remove: people, objects, text, watermarks, wires.',
    runtime: 'cloud',
    icon: 'Eraser',
    needsPrompt: true,
    promptPlaceholder: 'e.g. the person on the left, the watermark, power lines',
    usesMask: true,
    buildPrompt: ({ text }) =>
      `Remove ${text || 'the marked object'} from this photo and fill the area realistically with matching background. ${KEEP}`,
  }),
  task({
    id: 'ai-replace',
    name: 'AI Replace',
    category: 'Remove & Replace',
    description: 'Swap something for something else, e.g. "replace the mug with a plant".',
    runtime: 'cloud',
    icon: 'Replace',
    needsPrompt: true,
    promptPlaceholder: 'e.g. replace the red car with a blue bicycle',
    usesMask: true,
    buildPrompt: ({ text }) =>
      `${text}. Match the lighting, perspective and shadows so it looks real. ${KEEP}`,
  }),
  task({
    id: 'ai-background',
    name: 'Change background',
    category: 'Remove & Replace',
    description: 'Keep the subject, put it in a new place.',
    runtime: 'cloud',
    icon: 'Image',
    needsPrompt: true,
    promptPlaceholder: 'e.g. a sunny beach, a modern office, plain white studio',
    usesMask: false,
    buildPrompt: ({ text }) =>
      `Replace the background with ${text || 'a clean studio background'}. Keep the main subject exactly as it is, with matching lighting and natural edges. Output only the photo.`,
  }),
  task({
    id: 'ai-expand',
    name: 'AI Expand',
    category: 'Remove & Replace',
    description: 'Extends the photo beyond its edges (outpainting).',
    runtime: 'cloud',
    icon: 'Expand',
    needsPrompt: false,
    usesMask: false,
    options: [
      { id: '16:9', label: 'Wide 16:9', prompt: '' },
      { id: '4:3', label: 'Landscape 4:3', prompt: '' },
      { id: '1:1', label: 'Square', prompt: '' },
      { id: '3:4', label: 'Portrait 3:4', prompt: '' },
      { id: '9:16', label: 'Tall 9:16', prompt: '' },
      { id: '21:9', label: 'Cinema 21:9', prompt: '' },
    ],
    buildPrompt: () =>
      'Extend this photo outwards to fill the new frame: continue the scene naturally beyond the current edges with matching content, perspective, lighting and style. Do not change or crop the original area. Output only the photo.',
  }),
  task({
    id: 'ai-text-remove',
    name: 'Remove text',
    category: 'Remove & Replace',
    description: 'Erases captions, stickers and watermarks.',
    runtime: 'cloud',
    icon: 'Type',
    needsPrompt: false,
    usesMask: false,
    buildPrompt: () =>
      `Remove all text, captions, logos, stickers and watermarks from this photo and fill the area realistically. ${KEEP}`,
  }),
  // Portrait
  task({
    id: 'ai-retouch',
    name: 'AI Retouch',
    category: 'Portrait',
    description: 'Natural skin retouch, eye bags, stray hairs, glare on glasses.',
    runtime: 'cloud',
    icon: 'Smile',
    needsPrompt: false,
    usesMask: false,
    buildPrompt: () =>
      `Retouch the person naturally: even skin tone, reduce blemishes and under-eye bags, tidy stray hairs, remove glare from glasses. Keep real skin texture and identity. ${KEEP}`,
  }),
  task({
    id: 'ai-hairstyle',
    name: 'Hairstyle',
    category: 'Portrait',
    description: 'Try a new hairstyle or hair colour.',
    runtime: 'cloud',
    icon: 'Scissors',
    needsPrompt: true,
    promptPlaceholder: 'e.g. short bob, long curly hair, platinum blonde',
    usesMask: false,
    buildPrompt: ({ text }) =>
      `Change the person's hairstyle to ${text}. Keep the face, expression and everything else identical. Photorealistic. Output only the photo.`,
  }),
  task({
    id: 'ai-outfit',
    name: 'Outfit',
    category: 'Portrait',
    description: 'Change clothes: suit, dress, uniform, casual.',
    runtime: 'cloud',
    icon: 'Shirt',
    needsPrompt: true,
    promptPlaceholder: 'e.g. navy business suit with white shirt',
    usesMask: false,
    buildPrompt: ({ text }) =>
      `Change the person's clothing to ${text}. Keep the face, pose, body and background identical. Photorealistic fabric and fit. Output only the photo.`,
  }),
  task({
    id: 'ai-id-photo',
    name: 'ID photo',
    category: 'Portrait',
    description: 'Passport-style: plain background, formal top, neutral expression kept.',
    runtime: 'cloud',
    icon: 'IdCard',
    needsPrompt: false,
    usesMask: false,
    options: [
      { id: 'white', label: 'White', prompt: 'a plain pure white background' },
      { id: 'blue', label: 'Blue', prompt: 'a plain light blue background' },
      { id: 'red', label: 'Red', prompt: 'a plain red background' },
      { id: 'grey', label: 'Grey', prompt: 'a plain light grey background' },
    ],
    aspectRatio: '3:4',
    buildPrompt: ({ option }) =>
      `Turn this into a formal ID / passport photo: ${option?.prompt ?? 'a plain white background'}, even frontal lighting, the person wearing a smart plain top, head and shoulders centred, no shadows. Keep the face and expression exactly the same. Output only the photo.`,
  }),
  task({
    id: 'ai-makeup',
    name: 'AI Makeup',
    category: 'Portrait',
    description: 'Full makeup looks applied naturally.',
    runtime: 'cloud',
    icon: 'Wand2',
    needsPrompt: false,
    usesMask: false,
    options: [
      { id: 'natural', label: 'Natural', prompt: 'soft natural everyday makeup' },
      {
        id: 'glam',
        label: 'Glam',
        prompt: 'glamorous evening makeup with defined eyes and bold lips',
      },
      {
        id: 'korean',
        label: 'Korean',
        prompt: 'Korean-style dewy makeup with gradient lips and straight brows',
      },
      { id: 'smoky', label: 'Smoky', prompt: 'smoky eye makeup with nude lips' },
      { id: 'none', label: 'Remove', prompt: 'no makeup at all, clean bare skin' },
    ],
    buildPrompt: ({ option }) =>
      `Apply ${option?.prompt ?? 'natural makeup'} to the person's face. Keep identity, skin texture and everything else the same. ${KEEP}`,
  }),
  task({
    id: 'ai-smile',
    name: 'Expression',
    category: 'Portrait',
    description: 'Add a smile, open closed eyes, look at the camera.',
    runtime: 'cloud',
    icon: 'Laugh',
    needsPrompt: false,
    usesMask: false,
    options: [
      { id: 'smile', label: 'Smile', prompt: 'a gentle natural smile' },
      { id: 'big-smile', label: 'Big smile', prompt: 'a happy open smile' },
      { id: 'eyes', label: 'Open eyes', prompt: 'both eyes open and looking at the camera' },
      { id: 'serious', label: 'Neutral', prompt: 'a calm neutral expression' },
    ],
    buildPrompt: ({ option }) =>
      `Change the person's expression to ${option?.prompt ?? 'a natural smile'}. Keep identity and everything else the same. ${KEEP}`,
  }),
  // Style
  task({
    id: 'ai-style',
    name: 'Art styles',
    category: 'Style',
    description: 'Turn the photo into anime, oil painting, sketch, 3D and more.',
    runtime: 'cloud',
    icon: 'Brush',
    needsPrompt: false,
    usesMask: false,
    options: [
      { id: 'anime', label: 'Anime', prompt: 'Japanese anime illustration style' },
      {
        id: 'ghibli',
        label: 'Ghibli',
        prompt: 'hand-painted Studio-Ghibli-inspired animation style',
      },
      {
        id: 'oil',
        label: 'Oil painting',
        prompt: 'classical oil painting with visible brush strokes',
      },
      { id: 'watercolor', label: 'Watercolour', prompt: 'soft watercolour painting' },
      { id: 'sketch', label: 'Pencil sketch', prompt: 'detailed pencil sketch on paper' },
      { id: '3d', label: '3D cartoon', prompt: 'Pixar-style 3D animated character render' },
      {
        id: 'comic',
        label: 'Comic',
        prompt: 'American comic book style with bold ink lines and halftone',
      },
      { id: 'pixel', label: 'Pixel art', prompt: '16-bit pixel art' },
      { id: 'popart', label: 'Pop art', prompt: 'Warhol-style pop art with flat bold colours' },
      { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'neon-lit cyberpunk digital art' },
      { id: 'clay', label: 'Claymation', prompt: 'stop-motion clay figure style' },
      { id: 'lego', label: 'Toy bricks', prompt: 'built from plastic toy bricks' },
    ],
    buildPrompt: ({ option }) =>
      `Redraw this photo in ${option?.prompt ?? 'anime style'}, keeping the same composition, people and their recognisable features. Output only the image.`,
  }),
  task({
    id: 'ai-avatar',
    name: 'AI Avatar',
    category: 'Style',
    description: 'Stylised profile pictures from a selfie.',
    runtime: 'cloud',
    icon: 'UserRound',
    needsPrompt: false,
    usesMask: false,
    aspectRatio: '1:1',
    options: [
      { id: 'cartoon', label: 'Cartoon', prompt: 'a clean vector cartoon avatar' },
      { id: 'fantasy', label: 'Fantasy', prompt: 'an epic fantasy character portrait' },
      { id: 'astronaut', label: 'Astronaut', prompt: 'an astronaut portrait in a space suit' },
      { id: 'royal', label: 'Royal', prompt: 'a renaissance royal oil portrait' },
      { id: 'superhero', label: 'Superhero', prompt: 'a superhero movie poster portrait' },
      { id: 'vintage', label: 'Vintage', prompt: 'a 1950s studio portrait' },
    ],
    buildPrompt: ({ option }) =>
      `Create ${option?.prompt ?? 'a cartoon avatar'} of this person, square profile-picture framing, keeping their recognisable features. Output only the image.`,
  }),
  task({
    id: 'ai-filter-clone',
    name: 'Match a look',
    category: 'Style',
    description: 'Describe a colour grade or mood and apply it.',
    runtime: 'cloud',
    icon: 'SwatchBook',
    needsPrompt: true,
    promptPlaceholder: 'e.g. moody teal-and-orange film look, bright airy Japanese style',
    usesMask: false,
    buildPrompt: ({ text }) =>
      `Apply this colour grade / mood to the photo: ${text}. Only change colours, tones and lighting mood; do not change any content. Output only the photo.`,
  }),
  // Scene
  task({
    id: 'ai-sky',
    name: 'Sky replace',
    category: 'Scene',
    description: 'Swap a dull sky for sunset, blue sky, night stars…',
    runtime: 'cloud',
    icon: 'CloudSun',
    needsPrompt: false,
    usesMask: false,
    options: [
      { id: 'blue', label: 'Blue sky', prompt: 'a clear bright blue sky with a few soft clouds' },
      { id: 'sunset', label: 'Sunset', prompt: 'a dramatic golden-orange sunset sky' },
      { id: 'night', label: 'Starry night', prompt: 'a starry night sky with the Milky Way' },
      { id: 'storm', label: 'Storm', prompt: 'a dramatic dark stormy sky' },
      { id: 'pink', label: 'Pink dusk', prompt: 'a soft pink and purple dusk sky' },
      { id: 'clouds', label: 'Fluffy clouds', prompt: 'a sky full of big fluffy white clouds' },
    ],
    buildPrompt: ({ option }) =>
      `Replace the sky with ${option?.prompt ?? 'a clear blue sky'} and adjust the scene lighting and reflections to match. Keep everything else the same. Output only the photo.`,
  }),
  task({
    id: 'ai-relight',
    name: 'Relight',
    category: 'Scene',
    description: 'Change the light: golden hour, studio flash, neon, window light.',
    runtime: 'cloud',
    icon: 'Lightbulb',
    needsPrompt: false,
    usesMask: false,
    options: [
      { id: 'golden', label: 'Golden hour', prompt: 'warm golden-hour sunlight from the side' },
      { id: 'studio', label: 'Studio', prompt: 'soft professional studio lighting' },
      { id: 'flash', label: 'Flash', prompt: 'direct on-camera flash look' },
      { id: 'window', label: 'Window', prompt: 'soft natural window light' },
      { id: 'neon', label: 'Neon', prompt: 'pink and blue neon lighting' },
      { id: 'dramatic', label: 'Dramatic', prompt: 'moody dramatic low-key lighting' },
    ],
    buildPrompt: ({ option }) =>
      `Relight this photo with ${option?.prompt ?? 'soft studio lighting'}, with realistic shadows and highlights. Keep the content identical. Output only the photo.`,
  }),
  task({
    id: 'ai-season',
    name: 'Season / weather',
    category: 'Scene',
    description: 'Turn summer into snow, add rain, cherry blossoms, autumn leaves.',
    runtime: 'cloud',
    icon: 'Snowflake',
    needsPrompt: false,
    usesMask: false,
    options: [
      { id: 'snow', label: 'Snow', prompt: 'a snowy winter day' },
      { id: 'autumn', label: 'Autumn', prompt: 'autumn with golden and red leaves' },
      { id: 'spring', label: 'Blossom', prompt: 'spring with cherry blossoms' },
      { id: 'rain', label: 'Rain', prompt: 'a rainy day with wet reflective surfaces' },
      { id: 'fog', label: 'Fog', prompt: 'a misty foggy morning' },
      { id: 'night', label: 'Night', prompt: 'night time with city lights' },
    ],
    buildPrompt: ({ option }) =>
      `Change the scene to ${option?.prompt ?? 'a snowy winter day'} while keeping the people, objects and composition the same. Output only the photo.`,
  }),
  task({
    id: 'ai-product',
    name: 'Product shot',
    category: 'Scene',
    description: 'Clean e-commerce background with studio shadows.',
    runtime: 'cloud',
    icon: 'Package',
    needsPrompt: true,
    promptPlaceholder: 'e.g. white studio, marble table, wooden desk with plants',
    usesMask: false,
    buildPrompt: ({ text }) =>
      `Turn this into a professional product photo: place the product on ${text || 'a clean white studio background'} with realistic soft shadows and reflections. Keep the product exactly the same. Output only the photo.`,
  }),
  // Create
  task({
    id: 'ai-custom',
    name: 'Custom instruction',
    category: 'Create',
    description:
      'Tell the AI anything: "make it look like winter", "add a hat", "turn day into night".',
    runtime: 'cloud',
    icon: 'MessageSquare',
    needsPrompt: true,
    promptPlaceholder: 'Describe the change you want',
    usesMask: true,
    buildPrompt: ({ text }) => `${text}. Output only the edited photo.`,
  }),
  task({
    id: 'ai-poster',
    name: 'Poster',
    category: 'Create',
    description: 'Turns the photo into a designed poster with a headline.',
    runtime: 'cloud',
    icon: 'LayoutTemplate',
    needsPrompt: true,
    promptPlaceholder: 'Headline text, e.g. SUMMER SALE',
    usesMask: false,
    aspectRatio: '3:4',
    buildPrompt: ({ text }) =>
      `Design a stylish poster using this photo as the main image, with the headline "${text || 'HELLO'}" in bold modern typography and a clean layout. Output only the poster.`,
  }),
  task({
    id: 'ai-sticker',
    name: 'Sticker',
    category: 'Create',
    description: 'Cut-out sticker with a white border, cartoon style.',
    runtime: 'cloud',
    icon: 'Sticker',
    needsPrompt: false,
    usesMask: false,
    aspectRatio: '1:1',
    buildPrompt: () =>
      'Turn the main subject into a die-cut sticker: cartoon style, thick white outline, plain white background around it. Output only the image.',
  }),
];

/** Category names in display order. */
export const AI_TASK_CATEGORIES: readonly AiTaskCategory[] = [
  'Fix',
  'Remove & Replace',
  'Portrait',
  'Style',
  'Scene',
  'Create',
];

/** Finds a task by id. */
export function findTask(id: string): AiTask | undefined {
  return AI_TASKS.find((t) => t.id === id);
}
