import { useEffect, useRef, useState, useCallback } from "react";
import { generateCardPng } from "./components/generateCardPng";
import CardPreview, { type Metadata } from "./components/CardPreview";
// ...existing imports...
import InfoSections from "./components/InfoSections";
import Footer from "./components/Footer";

const MATERIALS = ["PLA", "PLA+", "PETG", "ABS", "ASA", "TPU", "Nylon", "Resin"];
const SLICERS = ["PrusaSlicer", "Cura", "Bambu Studio", "OrcaSlicer", "Simplify3D", "Lychee", "Other"];
const PRINT_MODES = ["Standard", "Draft", "High Quality", "Speed", "Silk", "Vase Mode"];
const PRINT_FEATURES = [
  "Adaptive Layers", "Ironing", "Using Supports", "Fuzzy Skin", "Gyroid Infill", 
  "Variable Layer Height", "Seam Painting", "Tree Supports", "Organic Supports",
  "Linear Advance", "Pressure Advance", "Multi-Color", "Soluble Supports", 
  "Lightning Infill", "Arachne Perimeter", "Support Blockers", "Overhang Perimeters"
];
const MODELING_SOFTWARE = ["Fusion 360", "Blender", "Tinkercad", "SolidWorks", "SketchUp", "FreeCAD", "OpenSCAD", "OnShape", "Rhino", "Maya", "3ds Max", "Other"];
const MODEL_SOURCES = ["Thingiverse", "Printables", "MyMiniFactory", "Cults3D", "Thangs", "CGTrader", "TurboSquid", "Etsy", "Gumroad", "Other"];
const COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Gray", value: "#808080" },
  { name: "Red", value: "#ff3b30" },
  { name: "Orange", value: "#ff9500" },
  { name: "Yellow", value: "#ffcc00" },
  { name: "Green", value: "#34c759" },
  { name: "Blue", value: "#0a84ff" },
  { name: "Purple", value: "#8e44ad" },
  { name: "Pink", value: "#ff2d55" },
];

function App() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [title, setTitle] = useState("");
  const [printer, setPrinter] = useState("");
  const [description, setDescription] = useState("");
  const [metadata, setMetadata] = useState<Metadata>({
    speed: "",
    layer_height: "",
    progress: "",
    estimated_time: "",
    nozzle_temp: "",
    bed_temp: "",
    material: "",
    print_mode: "",
    slicer: "",
    color: "",
  });
  const [pngUrl, setPngUrl] = useState<string>("");
  const [scale, setScale] = useState<number>(1);
  const cardRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [accentColor, setAccentColor] = useState<string>("#ffffff");
  const ACCENTS = ['#ffffff','#0a84ff','#34c759','#ffcc00','#ff3b30','#ff2d55','#8e44ad','#ff9500'];
  const [layout, setLayout] = useState<'standard'|'compact'|'wide'|'gallery'>('standard');
  const [aspectRatio, setAspectRatio] = useState<string>('16/9');
  const [imageFit, setImageFit] = useState<'cover'|'contain'>('cover');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [showAuthorCredit, setShowAuthorCredit] = useState<boolean>(false);
  const [modelingSoftware, setModelingSoftware] = useState<string>("");
  const [modelSource, setModelSource] = useState<string>("");
  const requiredOk = {
    image: !!imageUrl,
    title: !!title.trim(),
    printer: !!printer.trim(),
    speed: !!metadata.speed,
    layer_height: !!metadata.layer_height
  };

  // Decode share param if present OR load persisted state
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const packed = params.get('card');
      if (packed) {
        const json = atob(packed);
        const parsed = JSON.parse(json);
        setTitle(parsed.title || '');
        setPrinter(parsed.printer || '');
        setDescription(parsed.description || '');
        setMetadata((prev) => ({ ...prev, ...(parsed.metadata || {}) }));
        // Intentionally do not load image from URL share (privacy / size)
      } else {
        const saved = localStorage.getItem('printCardState');
        if (saved) {
          const parsed = JSON.parse(saved);
          setTitle(parsed.title || '');
          setPrinter(parsed.printer || '');
          setDescription(parsed.description || '');
          setMetadata((prev) => ({ ...prev, ...(parsed.metadata || {}) }));
          if (parsed.imageUrl) setImageUrl(parsed.imageUrl);
          if (parsed.accentColor) setAccentColor(parsed.accentColor);
          if (parsed.layout) setLayout(parsed.layout);
          if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
          if (parsed.imageFit) setImageFit(parsed.imageFit);
          if (Array.isArray(parsed.galleryImages)) setGalleryImages(parsed.galleryImages);
          if (Array.isArray(parsed.enabledFeatures)) setEnabledFeatures(parsed.enabledFeatures);
          if (typeof parsed.showAuthorCredit === 'boolean') setShowAuthorCredit(parsed.showAuthorCredit);
          if (parsed.modelingSoftware) setModelingSoftware(parsed.modelingSoftware);
          if (parsed.modelSource) setModelSource(parsed.modelSource);
        }
      }
    } catch {}
  }, []);

  // Persist state
  useEffect(() => {
    const payload = { title, printer, description, metadata, imageUrl, accentColor, layout, aspectRatio, imageFit, galleryImages, enabledFeatures, showAuthorCredit, modelingSoftware, modelSource };
    try { localStorage.setItem('printCardState', JSON.stringify(payload)); } catch {}
  }, [title, printer, description, metadata, imageUrl, accentColor, layout, aspectRatio, imageFit, galleryImages, enabledFeatures, showAuthorCredit, modelingSoftware, modelSource]);


  // Handle image upload
  const setImageFromFile = (file: File | null) => {
    if (!file) {
      setImageUrl("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      setPngUrl("");
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFromFile(file);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0,4);
    if (!files.length) { setGalleryImages([]); return; }
    const readers = files.map(f => new Promise<string>(res => { const r = new FileReader(); r.onload=()=>res(r.result as string); r.readAsDataURL(f); }));
    Promise.all(readers).then(urls => { setGalleryImages(urls); setPngUrl(""); });
  };

  // Handle metadata change
  const handleMetaTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
    setPngUrl("");
  };

  const handleMetaNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow empty string or numeric/decimal only
    if (value === "" || /^\d*(\.\d{0,3})?$/.test(value)) {
      setMetadata((prev) => ({ ...prev, [name]: value }));
      setPngUrl("");
    }
  };

  const blockInvalidKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Drag & drop
  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (dropRef.current) dropRef.current.classList.add('ring-2', 'ring-white/40');
  }, []);
  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (dropRef.current) dropRef.current.classList.remove('ring-2', 'ring-white/40');
  }, []);
  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (dropRef.current) dropRef.current.classList.remove('ring-2', 'ring-white/40');
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) setImageFromFile(file);
  }, []);

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    el.addEventListener('dragover', onDragOver as any);
    el.addEventListener('dragleave', onDragLeave as any);
    el.addEventListener('drop', onDrop as any);
    return () => {
      el.removeEventListener('dragover', onDragOver as any);
      el.removeEventListener('dragleave', onDragLeave as any);
      el.removeEventListener('drop', onDrop as any);
    };
  }, [onDragOver, onDragLeave, onDrop]);

  // Download PNG
  const handleDownload = async () => {
    if (!cardRef.current) return;
    const blob = await generateCardPng(cardRef.current, { scale });
    const url = URL.createObjectURL(blob);
    setPngUrl(url);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "card"}.png`;
    a.click();
  };

  const buildMetadataText = () => {
    const lines: string[] = [];
    if (title) lines.push(`Title: ${title}`);
    if (printer) lines.push(`Printer: ${printer}`);
    if (description) lines.push(`Description: ${description}`);
    Object.entries(metadata).filter(([, v]) => v).forEach(([k, v]) => lines.push(`${k.replace(/_/g, ' ')}: ${v}`));
    return lines.join('\n');
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const blob = await generateCardPng(cardRef.current, { scale });
      const file = new File([blob], `${title || 'print-card'}.png`, { type: 'image/png' });
      const navAny = navigator as any;
      if (navAny.canShare && navAny.canShare({ files: [file] })) {
        await navAny.share({ title: title || '3D Print Card', text: '3D Print Specs', files: [file] });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: title || '3D Print Card', text: buildMetadataText() });
        return;
      }
      await navigator.clipboard.writeText(buildMetadataText());
      alert('Sharing not supported. Metadata copied to clipboard.');
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') console.error('Share failed', err);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    try {
      const blob = await generateCardPng(cardRef.current, { scale });
      const item = new (window as any).ClipboardItem({ 'image/png': blob });
      await (navigator as any).clipboard.write([item]);
      alert('Image copied to clipboard');
    } catch {
      alert('Clipboard image copy not supported in this browser');
    }
  };

  const handleCreateShareUrl = () => {
    try {
      const state = { title, printer, description, metadata, accentColor, layout, aspectRatio, imageFit, enabledFeatures, showAuthorCredit, modelingSoftware, modelSource };
      const json = JSON.stringify(state);
      const encoded = btoa(json);
      const url = `${window.location.origin}${window.location.pathname}?card=${encoded}`;
      setShareUrl(url);
      navigator.clipboard.writeText(url).catch(() => {});
    } catch {}
  };

  // Smart suggestion for PETG
  const showPetgSuggest = !metadata.material && metadata.nozzle_temp === '230' && metadata.bed_temp === '80';

  function handleFeatureToggle(feature: string): void {
    setEnabledFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
    setPngUrl("");
  }
  return (
    <div className="min-h-screen w-full bg-[#0e0e10] text-white flex flex-col items-center font-[system-ui] selection:bg-white/90 selection:text-black scroll-smooth">
      <header className="w-full sticky top-0 z-40 backdrop-blur bg-black/40 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-500 shadow-inner" />
            <span className="text-sm tracking-wide font-semibold text-zinc-200">card.peakprinting.top</span>
          </div>
          <nav className="hidden md:flex gap-8 text-[13px] text-zinc-400">
            <a href="#tool" className="hover:text-zinc-200 transition">Generator</a>
            <a href="#about" className="hover:text-zinc-200 transition">About</a>
            <a href="#features" className="hover:text-zinc-200 transition">Features</a>
            <a href="#how" className="hover:text-zinc-200 transition">How It Works</a>
          </nav>
        </div>
      </header>
      <main className="w-full flex flex-col items-center">
        <section id="hero" className="pt-20 pb-16 w-full px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400 mb-6">Showcase Your 3D Prints<br className="hidden md:block" /> Beautifully</h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">Generate elegant, shareable spec cards for your 3D prints in an instant.</p>
          </div>
        </section>
        <section id="tool" className="w-full px-6 pb-24">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-14 items-start">
            <form className="flex-1 bg-[#141416]/80 backdrop-blur-xl rounded-3xl ring-1 ring-white/5 shadow-2xl p-8 flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
              <div className="grid gap-6">
                <div className="relative">
                  <label className="text-[13px] font-medium text-zinc-300">Image <span className="text-red-400">*</span></label>
                  <div ref={dropRef} className="mt-2 group relative flex flex-col items-center justify-center gap-2 w-full border border-dashed rounded-2xl px-4 py-10 text-center cursor-pointer transition bg-black/20 border-white/15 hover:border-white/40">
                    <input name="image" type="file" accept="image/*" required onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <span className="text-xs tracking-wide text-zinc-400">Drag & Drop or Click to Upload</span>
                    {imageUrl && <span className="text-[11px] text-zinc-500 truncate max-w-[200px]">Image selected</span>}
                  </div>
                  {requiredOk.image && <span className="absolute top-0 right-0 text-green-400 text-xs">✔</span>}
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="text-[13px] font-medium text-zinc-300">Title <span className="text-red-400">*</span></label>
                    <input name="title" type="text" required value={title} onChange={e => { setTitle(e.target.value); setPngUrl(""); }} className="mt-2 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20" />
                    {requiredOk.title && <span className="absolute top-0 right-0 text-green-400 text-xs">✔</span>}
                  </div>
                  <div className="relative">
                    <label className="text-[13px] font-medium text-zinc-300">Printer Name <span className="text-red-400">*</span></label>
                    <input name="printer" type="text" required value={printer} onChange={e => { setPrinter(e.target.value); setPngUrl(""); }} className="mt-2 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20" />
                    {requiredOk.printer && <span className="absolute top-0 right-0 text-green-400 text-xs">✔</span>}
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-zinc-300">Description</label>
                  <textarea name="description" value={description} onChange={e => { setDescription(e.target.value); setPngUrl(""); }} className="mt-2 w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-white/20" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6 pt-2">
                <div className="relative">
                  <label className="text-[12px] uppercase tracking-wider text-zinc-400">Speed (mm/s) *</label>
                  <input name="speed" inputMode="decimal" required value={metadata.speed} onChange={handleMetaNumberChange} onKeyDown={blockInvalidKey} placeholder="60" className="mt-2 w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/15" />
                  {requiredOk.speed && <span className="absolute top-0 right-0 text-green-400 text-xs">✔</span>}
                </div>
                <div className="relative">
                  <label className="text-[12px] uppercase tracking-wider text-zinc-400">Layer Height (mm) *</label>
                  <input name="layer_height" inputMode="decimal" required value={metadata.layer_height} onChange={handleMetaNumberChange} onKeyDown={blockInvalidKey} placeholder="0.2" className="mt-2 w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/15" />
                  {requiredOk.layer_height && <span className="absolute top-0 right-0 text-green-400 text-xs">✔</span>}
                </div>
                <div>
                  <label className="text-[12px] uppercase tracking-wider text-zinc-400">Progress (%)</label>
                  <input name="progress" inputMode="numeric" value={metadata.progress} onChange={handleMetaNumberChange} onKeyDown={blockInvalidKey} placeholder="80" className="mt-2 w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/15" />
                </div>
                <div>
                  <label className="text-[12px] uppercase tracking-wider text-zinc-400">Est. Time (h)</label>
                  <input name="estimated_time" inputMode="decimal" value={metadata.estimated_time} onChange={handleMetaNumberChange} onKeyDown={blockInvalidKey} placeholder="2.5" className="mt-2 w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/15" />
                </div>
                <div>
                  <label className="text-[12px] uppercase tracking-wider text-zinc-400">Nozzle Temp (°C)</label>
                  <input name="nozzle_temp" inputMode="numeric" value={metadata.nozzle_temp} onChange={handleMetaNumberChange} onKeyDown={blockInvalidKey} placeholder="210" className="mt-2 w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/15" />
                </div>
                <div>
                  <label className="text-[12px] uppercase tracking-wider text-zinc-400">Bed Temp (°C)</label>
                  <input name="bed_temp" inputMode="numeric" value={metadata.bed_temp} onChange={handleMetaNumberChange} onKeyDown={blockInvalidKey} placeholder="60" className="mt-2 w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/15" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="text-[12px] uppercase tracking-wider text-zinc-400">Material</label>
                  <select name="material" value={metadata.material} onChange={handleMetaTextChange} className="mt-2 w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/15">
                    <option value="">Select</option>
                    {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  {showPetgSuggest && (
                    <button type="button" onClick={()=>{ setMetadata(p=>({...p, material:'PETG'})); }} className="absolute -bottom-5 left-0 text-[10px] text-amber-300 hover:text-amber-200">Suggest PETG?</button>
                  )}
                </div>
                <div>
                  <label className="text-[12px] uppercase tracking-wider text-zinc-400">Print Mode</label>
                  <select name="print_mode" value={metadata.print_mode} onChange={handleMetaTextChange} className="mt-2 w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/15">
                    <option value="">Select</option>
                    {PRINT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] uppercase tracking-wider text-zinc-400">Slicer</label>
                  <select name="slicer" value={metadata.slicer} onChange={handleMetaTextChange} className="mt-2 w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/15">
                    <option value="">Select</option>
                    {SLICERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[12px] uppercase tracking-wider text-zinc-400">Filament Color</label>
                <div className="mt-3 flex flex-wrap gap-3">
                  {COLORS.map(c => (
                    <button type="button" key={c.name} onClick={() => { setMetadata(prev => ({ ...prev, color: c.name })); setPngUrl(""); }} className={`relative w-8 h-8 rounded-full ring-2 transition ${metadata.color === c.name ? 'ring-white scale-110' : 'ring-white/10 hover:ring-white/40'} focus:outline-none`} style={{ background: c.value }} aria-label={c.name} />
                  ))}
                </div>
                {metadata.color && <div className="mt-2 text-xs text-zinc-400">Selected: <span className="text-zinc-200 font-medium">{metadata.color}</span></div>}
              </div>
              <div>
                <label className="text-[12px] uppercase tracking-wider text-zinc-400">Accent Color</label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ACCENTS.map(c => (
                    <button key={c} type="button" onClick={() => setAccentColor(c)} className={`w-7 h-7 rounded-full ring-2 ${accentColor===c?'ring-white scale-110':'ring-white/10 hover:ring-white/40'} transition`} style={{ background: c }} />
                  ))}
                  <label className="w-7 h-7 rounded-full ring-2 ring-white/10 hover:ring-white/40 transition overflow-hidden cursor-pointer relative">
                    <input type="color" value={accentColor} onChange={e=>setAccentColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <span className="absolute inset-0" style={{ background: accentColor }} />
                  </label>
                </div>
                <div className="mt-2 text-[11px] text-zinc-500 tracking-wide">Live accent for title & badges</div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-[12px] uppercase tracking-wider text-zinc-400">Layout</label>
                  <select value={layout} onChange={e=>setLayout(e.target.value as any)} className="mt-2 w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/15">
                    <option value="standard">Standard</option>
                    <option value="compact">Compact</option>
                    <option value="wide">Wide</option>
                    <option value="gallery">Gallery</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] uppercase tracking-wider text-zinc-400">Aspect</label>
                  <select value={aspectRatio} onChange={e=>setAspectRatio(e.target.value)} className="mt-2 w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/15">
                    <option value="16/9">16:9</option>
                    <option value="4/3">4:3</option>
                    <option value="1/1">1:1</option>
                    <option value="3/4">3:4</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] uppercase tracking-wider text-zinc-400">Image Fit</label>
                  <select value={imageFit} onChange={e=>setImageFit(e.target.value as any)} className="mt-2 w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/15">
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                  </select>
                </div>
              </div>
              {layout==='gallery' && (
                <div>
                  <label className="text-[12px] uppercase tracking-wider text-zinc-400">Gallery Images (max 4)</label>
                  <input multiple accept="image/*" onChange={handleGalleryChange} type="file" className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm" />
                  {galleryImages.length>0 && <div className="mt-2 text-[10px] text-zinc-500">{galleryImages.length} selected</div>}
                </div>
              )}
              <div>
                <label className="text-[12px] uppercase tracking-wider text-zinc-400">Print Features</label>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRINT_FEATURES.map(feature => (
                    <label key={feature} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabledFeatures.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="w-3 h-3 rounded border border-white/20 bg-zinc-900/60 checked:bg-white checked:border-white focus:outline-none focus:ring-1 focus:ring-white/20"
                      />
                      <span className="text-[11px] text-zinc-300">{feature}</span>
                    </label>
                  ))}
                </div>
                {enabledFeatures.length > 0 && (
                  <div className="mt-2 text-[10px] text-zinc-500">{enabledFeatures.length} features selected</div>
                )}
              </div>

              <div>
                <label className="text-[12px] uppercase tracking-wider text-zinc-400">Model Credits</label>
                <div className="mt-3 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAuthorCredit}
                      onChange={(e) => {
                        setShowAuthorCredit(e.target.checked);
                        if (e.target.checked) setModelSource("");
                      }}
                      className="w-3 h-3 rounded border border-white/20 bg-zinc-900/60 checked:bg-white checked:border-white focus:outline-none focus:ring-1 focus:ring-white/20"
                    />
                    <span className="text-[11px] text-zinc-300">I designed this model</span>
                  </label>
                </div>
                {showAuthorCredit ? (
                  <div className="mt-3">
                    <select
                      value={modelingSoftware}
                      onChange={(e) => setModelingSoftware(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/15"
                    >
                      <option value="">Select modeling software</option>
                      {MODELING_SOFTWARE.map(software => (
                        <option key={software} value={software}>{software}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="mt-3">
                    <label className="text-[11px] text-zinc-400 mb-2 block">Model source (optional)</label>
                    <select
                      value={modelSource}
                      onChange={(e) => setModelSource(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/15"
                    >
                      <option value="">Select source</option>
                      {MODEL_SOURCES.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </form>
            
            <div className="flex-1 flex flex-col items-center gap-4">
              {imageUrl && title && printer && metadata.speed && metadata.layer_height && (
                <>
                  <div ref={cardRef} className="mt-2">
                    <CardPreview
                      imageUrl={imageUrl}
                      title={title}
                      printer={printer}
                      description={description}
                      metadata={metadata}
                      appleStyle
                      accentColor={accentColor}
                      watermark
                      layout={layout}
                      aspectRatio={aspectRatio}
                      imageFit={imageFit}
                      galleryImages={galleryImages}
                      enabledFeatures={enabledFeatures}
                      showAuthorCredit={showAuthorCredit}
                      modelingSoftware={modelingSoftware}
                      modelSource={modelSource}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-3 mt-6">
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={handleDownload}
                        type="button"
                        className="bg-white text-black/90 py-2.5 px-6 rounded-2xl font-semibold text-xs tracking-wide shadow hover:shadow-lg hover:bg-zinc-200 active:scale-[.98] transition"
                      >
                        Download PNG
                      </button>
                      <button
                        onClick={handleShare}
                        type="button"
                        className="bg-zinc-800/70 text-zinc-200 py-2.5 px-6 rounded-2xl font-medium text-xs tracking-wide border border-white/10 hover:bg-zinc-700 active:scale-[.98] transition"
                      >
                        Share
                      </button>
                      <button
                        onClick={handleCopyImage}
                        type="button"
                        className="bg-zinc-800/70 text-zinc-200 py-2.5 px-6 rounded-2xl font-medium text-xs tracking-wide border border-white/10 hover:bg-zinc-700 active:scale-[.98] transition"
                      >
                        Copy Image
                      </button>
                      <button
                        onClick={handleCreateShareUrl}
                        type="button"
                        className="bg-zinc-800/70 text-zinc-200 py-2.5 px-6 rounded-2xl font-medium text-xs tracking-wide border border-white/10 hover:bg-zinc-700 active:scale-[.98] transition"
                      >
                        Share URL
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <label className="uppercase tracking-wider">Scale</label>
                      <select value={scale} onChange={(e) => setScale(Number(e.target.value))} className="bg-zinc-900/70 border border-white/10 rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-white/20">
                        <option value={1}>1x</option>
                        <option value={2}>2x</option>
                        <option value={3}>3x</option>
                      </select>
                    </div>
                    {shareUrl && (
                      <div className="mt-1 max-w-[260px] text-center">
                        <input
                          readOnly
                          value={shareUrl}
                          className="w-full bg-zinc-900/50 border border-white/10 rounded px-2 py-1 text-[10px] text-zinc-300 focus:outline-none"
                          onFocus={(e) => e.currentTarget.select()}
                        />
                        <div className="text-[10px] text-zinc-500 mt-1">Link copied to clipboard</div>
                      </div>
                    )}
                  </div>
                  {pngUrl && (
                    <a href={pngUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-zinc-400 underline hover:text-zinc-200">Open PNG in new tab</a>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
        <InfoSections />
      </main>
      <Footer />
    </div>
  );
}

export default App;
