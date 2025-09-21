export interface Metadata {
  speed?: string;
  layer_height?: string;
  progress?: string;
  estimated_time?: string;
  [key: string]: string | undefined;
}

interface CardPreviewProps {
  imageUrl: string;
  title: string;
  printer: string;
  metadata: Metadata;
  description?: string;
  appleStyle?: boolean;
  accentColor?: string; // CSS color
  layout?: "standard" | "compact" | "wide" | "gallery";
  aspectRatio?: string; // e.g. '16/9', '1/1'
  imageFit?: "cover" | "contain";
  galleryImages?: string[]; // for gallery layout
  watermark?: boolean;
  enabledFeatures?: string[];
  showAuthorCredit?: boolean;
  modelingSoftware?: string;
  modelSource?: string;
}

export default function CardPreview({
  imageUrl,
  title,
  printer,
  metadata,
  description,
  appleStyle,
  accentColor = "#ffffff",
  layout = "standard",
  aspectRatio = "16/9",
  imageFit = "cover",
  galleryImages,
  watermark,
  enabledFeatures = [],
  showAuthorCredit = false,
  modelingSoftware = "",
  modelSource = "",
}: CardPreviewProps) {
  // Unit mapping for metadata fields
  const getValueWithUnit = (key: string, value: string) => {
    const unitMap: Record<string, string> = {
      speed: 'mm/s',
      layer_height: 'mm',
      estimated_time: 'h',
      nozzle_temp: '°C',
      bed_temp: '°C',
      progress: '%'
    };
    
    const unit = unitMap[key];
    return unit ? `${value}${unit}` : value;
  };

  // Material-specific colors
  const getMaterialColor = (material: string) => {
    const colors: Record<string, string> = {
      'PLA': '#4ade80',
      'PLA+': '#22c55e',
      'PETG': '#06b6d4',
      'ABS': '#f59e0b',
      'ASA': '#ef4444',
      'TPU': '#a855f7',
      'Nylon': '#6366f1',
      'Resin': '#ec4899'
    };
    return colors[material] || '#94a3b8';
  };

  // Temperature status indicators
  const getTempStatus = (temp: string, type: 'nozzle' | 'bed') => {
    const tempNum = parseInt(temp);
    if (type === 'nozzle') {
      if (tempNum >= 250) return { color: '#ef4444', status: 'HIGH' };
      if (tempNum >= 200) return { color: '#f59e0b', status: 'MED' };
      return { color: '#22c55e', status: 'LOW' };
    } else {
      if (tempNum >= 80) return { color: '#ef4444', status: 'HIGH' };
      if (tempNum >= 60) return { color: '#f59e0b', status: 'MED' };
      return { color: '#22c55e', status: 'LOW' };
    }
  };

  // Progress status
  const getProgressStatus = (progress: string) => {
    const progressNum = parseInt(progress);
    if (progressNum === 100) return { text: 'Completed', color: '#22c55e' };
    if (progressNum >= 75) return { text: 'Nearly Done', color: '#06b6d4' };
    if (progressNum >= 50) return { text: 'In Progress', color: '#f59e0b' };
    if (progressNum >= 25) return { text: 'Starting', color: '#a855f7' };
    return { text: 'Beginning', color: '#94a3b8' };
  };

  if (appleStyle) {
    const displayEntries = Object.entries(metadata).filter(([, v]) => v);
    const arParts = aspectRatio.split("/");
    let aspectStyle: any = {};
    if (arParts.length === 2) {
      const w = parseFloat(arParts[0]);
      const h = parseFloat(arParts[1]);
      if (w > 0 && h > 0) {
        aspectStyle = { aspectRatio: `${w} / ${h}` };
      }
    }
    const imgClass = imageFit === "contain" ? "object-contain" : "object-cover";
    const gallery = layout === "gallery";
    const imgs = gallery
      ? galleryImages && galleryImages.length
        ? galleryImages
        : [imageUrl]
      : [imageUrl];
    const rootWidth =
      layout === "wide"
        ? "w-[620px]"
        : layout === "compact"
        ? "w-[320px]"
        : "w-[388px]";
    const imageHeight =
      layout === "wide" ? "h-60" : layout === "compact" ? "h-40" : "h-48";
    const padY = layout === "compact" ? "py-5" : "py-7";

    const materialColor = metadata.material ? getMaterialColor(metadata.material) : null;
    const progressStatus = metadata.progress ? getProgressStatus(metadata.progress) : null;
    const nozzleTempStatus = metadata.nozzle_temp ? getTempStatus(metadata.nozzle_temp, 'nozzle') : null;
    const bedTempStatus = metadata.bed_temp ? getTempStatus(metadata.bed_temp, 'bed') : null;

    return (
      <div
        className={`relative ${rootWidth} rounded-[32px] bg-[#1c1c1f] border border-gray-600 p-0 overflow-hidden flex flex-col`}
        style={{ ["--accent" as any]: accentColor }}
      >
        <div
          className={`w-full bg-[#101012] relative overflow-hidden ${
            gallery ? "grid grid-cols-2 gap-px" : ""
          }`}
          style={gallery ? aspectStyle : {}}
        >
          {imgs.map((src, i) => (
            <div
              key={i}
              className={`flex items-center justify-center relative overflow-hidden ${
                gallery ? "aspect-square" : imageHeight
              }`}
            >
              <img
                src={src}
                alt="Preview"
                className={`w-full h-full ${imgClass} object-center`}
              />
              
              {/* Material badge with color coding */}
              {metadata.material && i === 0 && (
                <div 
                  className="absolute top-3 right-3 px-2 py-1 rounded-full font-semibold text-[11px] tracking-wide text-white shadow-lg"
                  style={{ backgroundColor: materialColor || undefined }}
                >
                  {metadata.material}
                </div>
              )}

              {/* Slicer badge */}
              {metadata.slicer && i === 0 && !metadata.material && (
                <div className="absolute top-3 right-3 bg-zinc-800/90 px-2 py-1 rounded-full font-medium text-[10px] tracking-wide text-zinc-200 border border-zinc-600">
                  {metadata.slicer}
                </div>
              )}

              {/* Progress indicator */}
              {metadata.progress && progressStatus && i === 0 && (
                <div 
                  className="absolute top-3 left-3 px-2 py-1 rounded-full font-medium text-[10px] tracking-wide text-white shadow-lg"
                  style={{ backgroundColor: progressStatus.color }}
                >
                  {progressStatus.text}
                </div>
              )}

              {/* Print mode indicator */}
              {metadata.print_mode && i === 0 && !metadata.progress && (
                <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded-full font-medium text-[10px] tracking-wide text-white border border-white/20">
                  {metadata.print_mode}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className={`w-full flex flex-col items-center px-8 ${padY}`}>
          <h2
            className={`font-semibold text-white mb-1.5 text-center tracking-tight leading-tight font-[system-ui] ${
              layout === "compact" ? "text-[22px]" : "text-[28px]"
            }`}
            style={{ color: accentColor }}
          >
            {title}
          </h2>
          
          <div className="text-[14px] text-zinc-400 mb-3 flex items-center gap-2">
            <span>
              {metadata.progress !== "100" ? "Printing" : "Printed"} on{" "}
              <span className="text-zinc-200 font-medium">{printer}</span>
            </span>
          </div>

          {description && (
            <p
              className={`mb-4 text-[13px] text-zinc-400/90 leading-relaxed text-center ${
                layout === "wide" ? "max-w-md" : "max-w-xs"
              }`}
            >
              {description}
            </p>
          )}
          
          {enabledFeatures.length > 0 && (
            <div className="w-full mb-4">
              <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-2 text-center">
                Features Enabled
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {enabledFeatures.map(feature => (
                  <span
                    key={feature}
                    className="px-2 py-1 bg-zinc-800/60 border border-zinc-700/50 rounded-full text-[10px] font-medium text-zinc-300 tracking-wide"
                    style={{ borderColor: `${accentColor}20`, backgroundColor: `${accentColor}10` }}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div
            className={`w-full mt-1 grid ${
              layout === "wide" ? "grid-cols-3" : "grid-cols-2"
            } gap-x-5 gap-y-2`}
          >
            {displayEntries.map(([k, v]) => {
              const isTemp = k === 'nozzle_temp' || k === 'bed_temp';
              const tempStatus = isTemp ? (k === 'nozzle_temp' ? nozzleTempStatus : bedTempStatus) : null;
              const isHighlighted = ["speed", "layer_height", "progress", "estimated_time"].includes(k);
              
              return (
                <div key={k} className="flex flex-col text-[12px] tracking-wide">
                  <span className="capitalize text-zinc-500 font-medium leading-snug flex items-center gap-1">
                    {k.replace(/_/g, " ")}
                    {/* Temperature status dot */}
                    {tempStatus && (
                      <span 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: tempStatus.color }}
                      />
                    )}
                  </span>
                  <span
                    className="text-[14px] text-zinc-100 font-semibold leading-tight flex items-center gap-1"
                    style={{ color: isHighlighted ? accentColor : (tempStatus?.color || undefined) }}
                  >
                    {getValueWithUnit(k, v ?? "")}
                    {/* Speed indicator */}
                    {k === 'speed' && parseInt(v ?? '0') > 100 && (
                      <span className="text-[9px] bg-orange-500/20 text-orange-300 px-1 rounded">FAST</span>
                    )}
                    {/* High temp indicator */}
                    {tempStatus?.status === 'HIGH' && (
                      <span className="text-[9px] bg-red-500/20 text-red-300 px-1 rounded">HOT</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {(watermark || (showAuthorCredit && modelingSoftware) || (!showAuthorCredit && modelSource)) && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-between items-center px-3">
            <div className="text-[11px] tracking-wide text-zinc-500/70">
              {showAuthorCredit && modelingSoftware && (
                <span>Designed in {modelingSoftware}</span>
              )}
              {!showAuthorCredit && modelSource && (
                <span>Model from {modelSource}</span>
              )}
            </div>
            <div className="text-[11px] tracking-wide text-zinc-500/70">
              {watermark && "card.peakprinting.top"}
            </div>
          </div>
        )}
      </div>
    );
  }
  // fallback: old style
  return (
    <div className="bg-white rounded-xl p-6 w-[350px] flex flex-col items-center text-[#3d2c1e] border border-[#e7e3dc]">
      <img
        src={imageUrl}
        alt="Preview"
        className="rounded-lg w-full h-48 object-cover border-2 border-[#e7e3dc] mb-4"
      />
      <h2 className="text-2xl font-bold mb-1 text-center text-[#3d2c1e]">
        {title}
      </h2>
      <div className="text-sm text-[#7c6a58] mb-2">
        Printer: <span className="font-semibold">{printer}</span>
      </div>
      {description && (
        <div className="mb-2 text-xs text-[#a89c8e] italic">{description}</div>
      )}
      <div className="w-full mt-2">
        {Object.entries(metadata).map(
          ([k, v]) =>
            v && (
              <div
                key={k}
                className="flex justify-between text-xs border-b border-[#ece7e0] py-1"
              >
                <span className="capitalize text-[#7c6a58]">
                  {k.replace(/_/g, " ")}:
                </span>
                <span>{getValueWithUnit(k, v ?? "")}</span>
              </div>
            )
        )}
      </div>
    </div>
  );
}