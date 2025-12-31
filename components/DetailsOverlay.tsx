
import React, { useState } from 'react';
import { Button } from './Button';
import { generateTTS, decodeBase64Audio, decodeAudioData } from '../services/gemini';

interface DetailsProps {
  title: string;
  subtitle?: string;
  photo: string;
  description: string;
  longDescription?: string;
  openingHours?: string;
  tips?: string[];
  readMoreLinks?: { label: string; url: string }[];
  onClose: () => void;
  onNavigate?: () => void;
}

export const DetailsOverlay: React.FC<DetailsProps> = ({ 
  title, subtitle, photo, description, longDescription, openingHours, tips, readMoreLinks, onClose, onNavigate 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const textToRead = longDescription || description;
      const base64 = await generateTTS(textToRead);
      if (base64) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const bytes = decodeBase64Audio(base64);
        const buffer = await decodeAudioData(bytes, audioCtx);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-slideUp">
      <div className="relative h-64 flex-shrink-0">
        <img src={photo} alt={title} className="w-full h-full object-cover" />
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 w-10 h-10 bg-black/30 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-all"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">{subtitle}</p>
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-12">
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">About</h3>
          <p className="text-slate-700 leading-relaxed font-medium">{description}</p>
          {longDescription && (
            <p className="text-slate-600 mt-4 leading-relaxed text-sm">{longDescription}</p>
          )}
        </section>

        {openingHours && (
          <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-2">
              <i className="fas fa-clock text-indigo-500"></i> Opening Hours
            </h3>
            <p className="text-sm text-slate-600">{openingHours}</p>
          </section>
        )}

        {tips && tips.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <i className="fas fa-lightbulb text-amber-500"></i> Pro Tips
            </h3>
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5"></div>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex gap-3">
          <Button 
            onClick={playAudio} 
            icon={isPlaying ? 'spinner fa-spin' : 'volume-up'}
            variant="outline"
            className="flex-1 py-3"
            disabled={isPlaying}
          >
            {isPlaying ? 'Playing...' : 'Hear Info'}
          </Button>
          {onNavigate && (
            <Button 
              onClick={onNavigate} 
              icon="location-arrow" 
              className="flex-1 py-3"
            >
              Get Directions
            </Button>
          )}
        </div>

        {readMoreLinks && readMoreLinks.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <i className="fas fa-external-link-alt text-indigo-500"></i> Further Reading
            </h3>
            <div className="space-y-2">
              {readMoreLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-slate-50 p-4 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{link.label}</span>
                    <i className="fas fa-arrow-up-right-from-square text-xs text-slate-400 group-hover:text-indigo-600 transition-colors"></i>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
