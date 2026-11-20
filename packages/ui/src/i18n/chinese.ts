const COPY: Record<string, string> = {
  'A focused portrait workflow': '专注人像修图流程',
  'AI tools': 'AI 工具',
  'Natural skin': '自然磨皮',
  'Face shaping': '脸型塑形',
  'Private by default': '默认保护隐私',
  'Built for delivery': '面向摄影交付',
  'On-device': '本机运行',
  'Soft, edge-aware retouching that preserves expression and texture.':
    '柔和细腻地修饰皮肤，同时保留表情与肌肤纹理。',
  'Subtle face and jaw refinement, ready to adjust per person.':
    '自然调整脸型与下颌，并可针对每张照片微调。',
  'Portrait detection and adjustments run directly on your Mac.':
    '人像检测与修图均直接在 Mac 本机运行。',
  'Undoable edits, before and after, and batch export.': '支持撤销、前后对比和批量导出。',
  'Natural Skin': '自然肤色',
  'Soft Glow': '柔和光晕',
  'Warm Studio': '暖调影棚',
  'Cool Studio': '冷调影棚',
  Editorial: '时尚大片',
  'Beauty Bright': '明亮人像',
  Tan: '小麦肤色',
  Porcelain: '瓷肌',
  'Moody Portrait': '氛围人像',
  'Film Portrait': '胶片人像',
  'Auto Pop': '自动增强',
  Brighten: '提亮',
  Darken: '压暗',
  Warm: '暖调',
  Cool: '冷调',
  Punch: '增强对比',
  Soften: '柔化',
  Crisp: '清晰',
  'Mono Lite': '轻柔黑白',
  Vivid: '鲜艳',
  Muted: '低饱和',
  Airy: '空气感',
  'Fresh Green': '清新绿',
  Sakura: '樱花粉',
  'Milk Tea': '奶茶色',
  Ceramic: '陶瓷感',
  'Summer Haze': '夏日薄雾',
  'Quiet Street': '静谧街景',
  'Morning Light': '晨光',
  'Lo-Fi Tokyo': '低保真东京',
  'Teal & Orange': '青橙色调',
  Blockbuster: '电影大片',
  Desert: '沙漠色调',
  Matrix: '黑客帝国',
  Japanese: '日系',
  Cinematic: '电影感',
  Minimal: '简约',
  Film: '胶片',
  Portrait: '人像',
  Add: '添加',
  'Add a key': '添加密钥',
  'Add between 1 and 9 photos.': '请添加 1 到 9 张照片。',
  'Add photos': '添加照片',
  'Add text': '添加文字',
  'Adds your name or brand to the photo, in a corner or repeated across the whole image.':
    '在照片角落添加署名或品牌，也可平铺到整张照片。',
  Adjust: '调整',
  'Align centre': '居中对齐',
  'Align left': '左对齐',
  'Align right': '右对齐',
  Angle: '角度',
  'Anything (BiRefNet, larger)': '通用主体（BiRefNet，模型较大）',
  Apply: '应用',
  'Apply on-device skin and face retouch': '使用本机 AI 磨皮与瘦脸',
  'Apply these edits to many photos': '将这些修图效果应用到多张照片',
  'Aspect ratio': '宽高比',
  Auto: '自动',
  'Auto retouch': '自动修图',
  'Automatic finish': '自动润饰',
  'Automatic portrait retouch is ready. Fine-tune any adjustment whenever you like.':
    '人像自动修饰已完成。你可以随时微调各项参数。',
  'Light correction is ready. Face retouch needs an internet connection the first time.':
    '光线调整已完成。首次使用人脸修饰需要联网加载模型。',
  'Automatic light correction is ready. No face was detected in this photo.':
    '自动光线调整已完成。这张照片没有检测到人脸。',
  'Automatic retouch failed.': '自动修图失败。',
  'Face detection failed.': '人脸检测失败。',
  'Could not open the photo.': '无法打开照片。',
  'Opening photo…': '正在打开照片…',
  'Downloading photo…': '正在下载照片…',
  'Loading photos…': '正在加载照片…',
  'Rendering full resolution…': '正在渲染原始分辨率…',
  'Applying crop…': '正在应用裁剪…',
  'Sending to AI…': '正在发送给 AI…',
  'Preparing…': '正在准备…',
  'Please describe what you want first.': '请先描述你想要的效果。',
  'Cancelled.': '已取消。',
  'The AI request failed.': 'AI 请求失败。',
  'Export failed.': '导出失败。',
  'Crop failed.': '裁剪失败。',
  'Could not read the LUT file.': '无法读取 LUT 文件。',
  'Loaded:': '已加载：',
  quality: '画质',
  key: '密钥',
  photo: '照片',
  px: '像素',
  Back: '返回',
  'Back to home': '返回首页',
  Background: '背景',
  Balance: '平衡',
  'Batch edit': '批量修图',
  'Batch…': '批量处理…',
  Beauty: '人像美化',
  'Block size': '方块大小',
  Bold: '粗体',
  'Bring forward': '上移一层',
  'Bring your own key: each request goes straight from your browser to the provider. Nothing is sent to us. Keys are saved in this browser only.':
    '请使用你自己的密钥：请求会从本机直接发送到服务商，不会经过我们的服务器。密钥仅保存在本机。',
  'Brush size': '画笔大小',
  Cancel: '取消',
  'Choose the photos to process. They are handled one by one on your device and downloaded as a ZIP.':
    '选择要处理的照片。照片会在本机逐张处理，并打包为 ZIP 下载。',
  Clear: '清除',
  'Clear list': '清空列表',
  'Clear mask': '清除蒙版',
  Close: '关闭',
  'Close panel': '关闭面板',
  'Cloud AI tools need your own API key (Gemini or OpenAI). Keys stay on this device. Free on-device tools work without a key.':
    '云端 AI 需要你自己的 Gemini 或 OpenAI API 密钥，密钥保存在本机。免费的本机 AI 功能无需密钥。',
  Collage: '拼图',
  Colour: '颜色',
  'Colour balance': '色彩平衡',
  'Continue in editor': '继续在编辑器中处理',
  'Corner radius': '圆角',
  'Crop & rotate': '裁剪与旋转',
  Curve: '曲线',
  'Custom colour': '自定义颜色',
  Delete: '删除',
  'Delete layer': '删除图层',
  Direction: '方向',
  Dismiss: '关闭提示',
  Doodle: '涂鸦',
  Down: '下移',
  'Drag on the photo: Push moves pixels along your finger, Bulge enlarges, Pinch shrinks, Restore undoes locally. Works on bodies, clothes, anything.':
    '在照片上拖动进行液化：推动可移动像素，膨胀可放大，收缩可变窄，还原可恢复笔触区域。适用于身体、衣物等部位。',
  'Drag points, tap the line to add one, double-tap a point to remove it.':
    '拖动曲线控制点进行调整；点击曲线可添加控制点，双击控制点可删除。',
  'Draw directly on the photo. Neon glows, Marker is semi-transparent, Eraser removes doodle strokes only.':
    '直接在照片上绘制。霓虹笔带发光效果，记号笔半透明，橡皮仅擦除涂鸦笔迹。',
  'Drop shadow': '投影',
  Duplicate: '复制',
  Effects: '特效',
  Export: '导出',
  'Face retouch adapts to detected faces. Body liquify reuses the same positions from your last edit, so use a matching pose and crop. Automatic leg or body reshaping is not available yet.':
    '磨皮和瘦脸会根据检测到的人脸自动适配。身形液化会复用上次编辑的相同位置，请使用姿势和裁切一致的照片。目前还不支持自动瘦身或修腿。',
  'Face slim': '瘦脸',
  'File name': '文件名',
  Filters: '滤镜',
  'Filters stack on top of your Adjust sliders. Tap the same filter again to keep it and tune the strength.':
    '滤镜会叠加在基础调整之上。再次点击当前滤镜即可保留滤镜并调整强度。',
  'Finding faces (first time downloads a small model)…':
    '正在检测人脸（首次使用会下载一个小型模型）…',
  'First import downloads the face model once. Your photo stays on this Mac.':
    '首次导入时会下载人脸检测模型。照片始终保留在这台 Mac 上。',
  Flip: '翻转',
  'Flip horizontal': '水平翻转',
  'Flip vertical': '垂直翻转',
  Font: '字体',
  Format: '格式',
  Frames: '相框',
  'Free background removal model': '免费背景移除模型',
  'Free on-device AI: face landmarks (MediaPipe), background removal (MODNet / BiRefNet), 2× upscaling (Swin2SR), object eraser (LaMa). Models download once from Hugging Face / Google and are cached.':
    '免费本机 AI：人脸关键点（MediaPipe）、移除背景（MODNet / BiRefNet）、2 倍放大（Swin2SR）、物体擦除（LaMa）。模型从 Hugging Face / Google 下载一次后会缓存在本机。',
  'Free. The model downloads once and is cached in this browser.':
    '免费。模型仅需下载一次，并会缓存在本机。',
  Gap: '间距',
  'Gemini (cheaper, no mask)': 'Gemini（费用较低，不支持蒙版）',
  'Gemini model': 'Gemini 模型',
  'Get a key': '获取密钥',
  'Highlight hue': '高光色相',
  'Highlight strength': '高光强度',
  'Hold to compare with original': '按住对比原图',
  Horizontal: '横向',
  Image: '图像',
  'Import and auto retouch': '导入并自动修图',
  Instruction: '修图描述',
  Italic: '斜体',
  'JPG, PNG, WebP or HEIC · processed locally': '支持 JPG、PNG、WebP、HEIC · 在本机处理',
  'Jaw refinement': '下颌修饰',
  Keys: '密钥',
  'LUT files (.cube) are colour looks made in DaVinci Resolve, Lightroom or downloaded from LUT packs. Load one and it is applied on top of your adjustments.':
    'LUT（.cube）是由 DaVinci Resolve、Lightroom 制作或从预设包下载的色彩风格文件。加载后会叠加在当前调整之上。',
  'LUT strength': 'LUT 强度',
  Layers: '图层',
  Layout: '版式',
  'Letter spacing': '字间距',
  'Line height': '行高',
  'Load .cube LUT': '加载 .cube LUT',
  'Look from my last edit': '沿用上次修图效果',
  'Look to apply': '选择要应用的效果',
  'Luma Retouch': 'Luma 人像精修',
  'Luma balances light, finds faces and applies a restrained skin finish automatically. Keep the result, or fine-tune every detail.':
    'Luma 会自动平衡光线、检测人脸并进行自然磨皮。你可以直接使用结果，也可以继续微调细节。',
  'Mac Portrait Studio': 'Mac 人像工作室',
  Margin: '边距',
  Matte: '哑光',
  Mosaic: '马赛克',
  'No colour': '无颜色',
  'No filter (convert/resize only)': '不使用滤镜（仅转换格式或调整尺寸）',
  'Non-destructive': '非破坏性编辑',
  Opacity: '不透明度',
  'Open source (MIT). Your photos never leave your device unless you use a cloud AI tool.':
    'MIT 开源。除非使用云端 AI 工具，否则照片不会离开你的设备。',
  'OpenAI (exact masks)': 'OpenAI（支持精确蒙版）',
  'OpenAI model': 'OpenAI 模型',
  Original: '原始尺寸',
  Outline: '描边',
  'Outline width': '描边宽度',
  Output: '输出',
  'Paint over the part to hide. Mosaic is applied to the real photo when you export, so it cannot be removed by others.':
    '涂抹需要隐藏的区域。导出时马赛克会直接应用到照片中，其他人无法移除。',
  'Painted masks always go to OpenAI when you have an OpenAI key, because Gemini has no mask input.':
    '如果已设置 OpenAI 密钥，涂抹的蒙版会始终发送给 OpenAI，因为 Gemini 不支持蒙版输入。',
  'People (MODNet, ~25 MB)': '人物（MODNet，约 25 MB）',
  Perspective: '透视',
  'Perspective previews when you release the slider.': '松开滑块后显示透视调整效果。',
  Photos: '照片',
  'Pick a colour band, then shift its hue, strength or brightness without touching other colours.':
    '选择一个颜色范围，单独调整它的色相、强度或亮度，不影响其他颜色。',
  'Pick a frame style. You can change its colour and thickness afterwards.':
    '选择相框样式。添加后还可以调整颜色和粗细。',
  'Portrait preview': '人像预览',
  'Portrait retouch': '人像修饰',
  Position: '位置',
  'Preferred provider for prompt tasks': '描述类任务的首选服务商',
  Process: '开始处理',
  'Process photos': '开始处理照片',
  Quality: '画质',
  Redo: '重做',
  Remove: '移除',
  'Remove LUT': '移除 LUT',
  'Remove all keys from this browser': '从本机移除所有密钥',
  'Remove photo': '移除照片',
  'Replace photo': '替换照片',
  Reset: '重置',
  'Reset all edits': '重置所有编辑',
  'Reset curve': '重置曲线',
  Retry: '重试',
  'Reuse body liquify strokes from the last edit': '复用上次的身形液化笔触',
  'Rotate & flip': '旋转与翻转',
  'Rotate 90°': '旋转 90°',
  Rotation: '旋转',
  'S-curve': 'S 曲线',
  Save: '保存',
  'Selected sticker': '已选贴纸',
  'Send backward': '下移一层',
  Settings: '设置',
  'Shadow hue': '阴影色相',
  'Shadow strength': '阴影强度',
  Size: '尺寸',
  'Skin · light · face shape': '磨皮 · 光线 · 脸型',
  "Smaller uploads are faster on mobile data. The AI result is at the model's own resolution.":
    '较小的上传尺寸在移动网络下更快。AI 结果的分辨率取决于模型本身。',
  'Smooth skin': '磨皮',
  'Something went wrong in this panel.': '此面板发生错误。',
  'Source code and documentation:': '源代码与文档：',
  'Split toning': '分离色调',
  'Spot size': '瑕疵范围',
  Stickers: '贴纸',
  Straighten: '拉直',
  Strength: '强度',
  'Tap "Add text", then drag it on the photo. Pinch (or use the sliders) to resize and rotate.':
    '点击“添加文字”，然后在照片上拖动。双指缩放或使用滑块调整大小和旋转角度。',
  'Tap a pimple or spot to smooth it away. No face needed.':
    '点击痘痘或斑点即可修复，无需检测到人脸。',
  'Tap a sticker to add it, then drag it on the photo. Upload a PNG for your own stickers (try the AI "Remove background" tool first to make a cut-out).':
    '点击贴纸即可添加，然后拖动到照片上的合适位置。也可以上传 PNG 自定义贴纸（可先用 AI“移除背景”制作抠图）。',
  'Tap a thumbnail to replace it.': '点击缩略图即可替换照片。',
  'Tap the photo to move the focus point.': '点击照片可移动焦点位置。',
  Text: '文字',
  'Text colour': '文字颜色',
  'Text content': '文字内容',
  'Text, stickers, doodles, mosaic, frames and watermarks appear here. The photo itself is always the bottom layer.':
    '文字、贴纸、涂鸦、马赛克、相框和水印会显示在此处。照片本身始终位于最底层。',
  Thickness: '粗细',
  'Tile across photo': '平铺整张照片',
  'Tip: edit one photo, open Export → "Batch…" to reuse its adjustments, portrait settings and effect here.':
    '提示：先编辑一张照片，再打开“导出 → 批量处理…”，即可在此复用调整、人像参数和特效。',
  'Tone curve': '色调曲线',
  Tools: '工具',
  'Try again': '重试',
  'Try sample photo': '试用示例照片',
  Type: '类型',
  Undo: '撤销',
  'Undo spot': '撤销瑕疵修复',
  'Undo stroke': '撤销笔触',
  'Undo the last AI result': '撤销上次 AI 结果',
  Up: '上移',
  'Upload size for cloud AI': '云端 AI 上传尺寸',
  Vertical: '纵向',
  'Vertical (long screenshot)': '纵向（长图）',
  Watermark: '水印',
  'Watermark text': '水印文字',
  'Your portrait retouch starts as soon as you import.': '导入照片，即刻开始人像精修。',
  'Something went wrong. Try again.': '发生错误，请重试。',
  'Loading…': '正在加载…',
};

const ATTRIBUTE_NAMES = ['aria-label', 'title', 'placeholder', 'alt'];

/** Translates visible editor copy for the standalone Chinese Mac app. */
export function installChineseUi(): () => void {
  if (new URLSearchParams(window.location.search).get('locale') !== 'zh-CN') return () => {};
  document.documentElement.lang = 'zh-CN';

  const translateText = (value: string): string => {
    const normalized = value.replace(/\s+/g, ' ').trim();
    const translated = COPY[normalized];
    if (translated) {
      const leading = value.match(/^\s*/)?.[0] ?? '';
      const trailing = value.match(/\s*$/)?.[0] ?? '';
      return `${leading}${translated}${trailing}`;
    }
    const processing = normalized.match(/^Processing (\d+ \/ \d+): (.+)$/);
    if (processing) return `正在处理 ${processing[1]}：${processing[2]}`;
    const processCount = normalized.match(/^Process (\d+) photos?$/);
    if (processCount) return `开始处理 ${processCount[1]} 张照片`;
    const exported = normalized.match(/^Done: (\d+) photos? exported\.$/);
    if (exported) return `处理完成：已导出 ${exported[1]} 张照片。`;
    const skipped = normalized.match(/^Skipped (.+): (.+)$/);
    if (skipped) return `已跳过 ${skipped[1]}：${skipped[2]}`;
    return value;
  };

  const translateNode = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      const translated = translateText(node.textContent);
      if (translated !== node.textContent) node.textContent = translated;
      return;
    }
    if (node instanceof Element) {
      for (const name of ATTRIBUTE_NAMES) {
        const value = node.getAttribute(name);
        if (value) {
          const translated = translateText(value);
          if (translated !== value) node.setAttribute(name, translated);
        }
      }
      node.childNodes.forEach(translateNode);
    }
  };

  document.body.childNodes.forEach(translateNode);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'characterData') translateNode(record.target);
      else record.addedNodes.forEach(translateNode);
      if (record.type === 'attributes') translateNode(record.target);
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRIBUTE_NAMES,
  });
  return () => observer.disconnect();
}
