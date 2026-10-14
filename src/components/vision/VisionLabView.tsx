import React, { useState } from 'react';
import { usePace } from '../../context/PaceContext';
import { AspectRatioType, VisionPoster } from '../../types';
import {
  Sparkles,
  Download,
  Trash2,
  Maximize2,
  RefreshCw,
  Zap,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

export const VisionLabView: React.FC = () => {
  const { visionPosters, addVisionPoster, deleteVisionPoster } = usePace();

  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState(
    'Cinematic athlete in starting blocks under midnight stadium lights with sharp electric lime neon lines, hyper-focused, dramatic sports aesthetic'
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');
  const [quality, setQuality] = useState<'standard' | 'studio'>('standard');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedPoster, setSelectedPoster] = useState<VisionPoster | null>(null);
  const [error, setError] = useState<string | null>(null);

  const aspectRatios: { value: AspectRatioType; label: string; desc: string }[] = [
    { value: '1:1', label: '1:1', desc: 'Square / Avatar' },
    { value: '2:3', label: '2:3', desc: 'Athletic Poster' },
    { value: '3:2', label: '3:2', desc: 'Landscape 3:2' },
    { value: '3:4', label: '3:4', desc: 'Portrait Card' },
    { value: '4:3', label: '4:3', desc: 'Display 4:3' },
    { value: '9:16', label: '9:16', desc: 'Mobile Story / Lockscreen' },
    { value: '16:9', label: '16:9', desc: 'Widescreen Hero' },
    { value: '21:9', label: '21:9', desc: 'Ultra-wide Panoramic' },
  ];

  const presets = [
    {
      label: 'Pre-Race Adrenaline',
      prompt:
        'Cinematic sprinter in starting blocks under midnight stadium floodlights with sharp electric lime neon lane lines, hyper-focused, mist and dramatic sports photography',
    },
    {
      label: 'Midnight Study Grind',
      prompt:
        'Minimalist dark charcoal desk setup at night, illuminated open academic textbook, glowing digital stopwatch, subtle electric lime accent lighting, intense focus',
    },
    {
      label: 'Championship Victory',
      prompt:
        'Athletic champion crossing finish line with pure emotion and power, electric lime stadium ribbon, motion speed blur, dramatic contrast',
    },
    {
      label: 'Heavy Power PR',
      prompt:
        'Weightlifter chalking hands before heavy lift inside dark minimalist strength gym, dust particles glowing in electric lime spotlight, heroic physique',
    },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          quality,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate visual asset');
      }

      setGeneratedImage(data.imageUrl);

      // Auto save to vision board
      const finalTitle = title.trim() || 'Focus Motivation';
      await addVisionPoster({
        title: finalTitle,
        prompt: prompt.trim(),
        aspectRatio,
        imageUrl: data.imageUrl,
        modelUsed: data.modelUsed || (quality === 'studio' ? 'gemini-3-pro-image' : 'gemini-nano-banana-2.1'),
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Verify key or quota.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (imgUrl: string, name: string) => {
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `${name.toLowerCase().replace(/\s+/g, '_')}_poster.jpg`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#ccff00]" />
            ATHLETIC VISION & MOTIVATION LAB
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Generate custom athletic motivation posters, lockscreens, and visual cards with exact aspect ratio control
          </p>
        </div>
      </div>

      {/* Generation Console */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0c0c11] p-5 sm:p-7 shadow-xl">
        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Preset Buttons */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Select Motivation Preset
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setPrompt(p.prompt);
                    setTitle(p.label);
                  }}
                  className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-[#ccff00] transition active:scale-95"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Custom Prompt Input */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Poster Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Iron Focus"
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Visual Prompt Directive *
              </label>
              <input
                type="text"
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your athletic vision, mood, lighting, sport..."
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#ccff00] focus:outline-none"
              />
            </div>
          </div>

          {/* Aspect Ratio Selector (Affordance with all 8 ratios) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Aspect Ratio Specification (Mandatory Requirement)
              </label>
              <span className="text-xs font-bold text-[#ccff00]">Active: {aspectRatio}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {aspectRatios.map((item) => {
                const isSelected = aspectRatio === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setAspectRatio(item.value)}
                    className={`rounded-xl border p-2.5 text-center transition flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'border-[#ccff00] bg-zinc-800/90 shadow-md shadow-[#ccff00]/10 text-white'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <span
                      className={`text-xs font-black ${
                        isSelected ? 'text-[#ccff00]' : 'text-zinc-200'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="text-[9px] text-zinc-500 truncate w-full">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Quality Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label
              onClick={() => setQuality('standard')}
              className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                quality === 'standard'
                  ? 'border-[#ccff00] bg-zinc-900/90'
                  : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <input
                type="radio"
                name="quality"
                checked={quality === 'standard'}
                onChange={() => setQuality('standard')}
                className="mt-0.5 accent-[#ccff00]"
              />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Standard High-Performance
                  <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] text-[#ccff00]">
                    gemini-nano-banana-2.1
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Optimal for daily athletic motivation and fast generation
                </div>
              </div>
            </label>

            <label
              onClick={() => setQuality('studio')}
              className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                quality === 'studio'
                  ? 'border-[#ccff00] bg-zinc-900/90'
                  : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <input
                type="radio"
                name="quality"
                checked={quality === 'studio'}
                onChange={() => setQuality('studio')}
                className="mt-0.5 accent-[#ccff00]"
              />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Studio Quality Master
                  <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] text-amber-400">
                    gemini-3-pro-image-preview
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  2K ultra-fine resolution for posters and wallpapers
                </div>
              </div>
            </label>
          </div>

          {error && (
            <div className="rounded-lg bg-red-950/60 border border-red-800 p-3 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Submit Trigger */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={generating}
              className="flex items-center gap-2 rounded-xl bg-[#ccff00] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:bg-[#b8e600] transition active:scale-95 shadow-lg shadow-[#ccff00]/20 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Visual...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 fill-black" />
                  <span>Generate Motivation Asset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Vision Board Gallery Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#ccff00]" />
            Saved Athletic Vision Board ({visionPosters.length})
          </h2>
          <span className="text-[11px] text-zinc-400">Click any visual to enlarge</span>
        </div>

        {visionPosters.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/40">
            <Sparkles className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-400">Your vision board is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visionPosters.map((poster) => (
              <div
                key={poster.id}
                className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-md transition hover:border-[#ccff00]/60"
              >
                <div
                  className="cursor-pointer overflow-hidden max-h-[320px] flex items-center justify-center bg-black"
                  onClick={() => setSelectedPoster(poster)}
                >
                  <img
                    src={poster.imageUrl}
                    alt={poster.title}
                    referrerPolicy="no-referrer"
                    className="w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white truncate max-w-[180px]">
                      {poster.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-bold text-[#ccff00]">
                        {poster.aspectRatio}
                      </span>
                      <span>{new Date(poster.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownload(poster.imageUrl, poster.title)}
                      className="rounded p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      title="Download image"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteVisionPoster(poster.id)}
                      className="rounded p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                      title="Delete poster"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Lightbox for Enlarge */}
      {selectedPoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <img
              src={selectedPoster.imageUrl}
              alt={selectedPoster.title}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] w-auto rounded-xl object-contain shadow-2xl border border-zinc-800"
            />
            <div className="mt-4 flex items-center justify-between w-full px-2 text-white">
              <div>
                <h3 className="text-sm font-bold">{selectedPoster.title}</h3>
                <p className="text-xs text-zinc-400">{selectedPoster.prompt}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownload(selectedPoster.imageUrl, selectedPoster.title)}
                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-700 flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
                <button
                  onClick={() => setSelectedPoster(null)}
                  className="rounded-lg bg-[#ccff00] px-4 py-1.5 text-xs font-bold text-black"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
