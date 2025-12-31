import React, { useEffect, useMemo, useState } from 'react';
import { JournalEntry } from '../types';
import { Button } from './Button';
import { SafeImage } from './SafeImage';

const STORAGE_KEY = 'explorer_journal_v1';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch {
        setEntries([]);
      }
    }
  }, []);

  const saveEntries = (next: JournalEntry[]) => {
    setEntries(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const canSave = useMemo(() => {
    return title.trim().length > 0 || text.trim().length > 0 || images.length > 0;
  }, [title, text, images.length]);

  const resetDraft = () => {
    setTitle('');
    setText('');
    setImages([]);
  };

  const handlePickImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setSaving(true);
    try {
      const selected = Array.from(files);
      const urls = await Promise.all(selected.map(readFileAsDataUrl));
      setImages(prev => [...prev, ...urls]);
    } finally {
      setSaving(false);
    }
  };

  const createEntry = async () => {
    if (!canSave) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      title: title.trim() || 'Journal Entry',
      text: text.trim(),
      imageDataUrls: images,
    };
    const next = [entry, ...entries];
    saveEntries(next);
    resetDraft();
    setIsAdding(false);
  };

  const removeEntry = (id: string) => {
    const ok = window.confirm('Delete this journal entry?');
    if (!ok) return;
    saveEntries(entries.filter(e => e.id !== id));
  };

  return (
    <div className="p-6 pb-24 animate-fadeIn max-w-lg mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Journal</h2>
          <p className="text-xs text-slate-500">Save moments with photos and notes.</p>
        </div>
        <Button onClick={() => { setIsAdding(true); }} icon="plus" className="rounded-2xl">
          Add
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <i className="fas fa-book-open text-4xl mb-3 opacity-20"></i>
          <p className="text-sm font-medium text-slate-600">No journal entries yet</p>
          <p className="text-xs mt-1">Tap “Add” to create your first one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {entry.imageDataUrls?.length > 0 && (
                <div className="grid grid-cols-3 gap-1 bg-slate-100">
                  {entry.imageDataUrls.slice(0, 6).map((src, idx) => (
                    <SafeImage key={idx} src={src} alt={entry.title} className="w-full h-24 object-cover" />
                  ))}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-800 truncate">{entry.title}</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{formatDate(entry.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
                {entry.text && (
                  <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-[110] bg-white flex flex-col animate-slideUp">
          <div className="p-6 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setIsAdding(false); resetDraft(); }}
                className="w-10 h-10 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all"
                title="Close"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <h3 className="text-lg font-bold text-slate-800">New Journal</h3>
              <div className="w-10 h-10" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Camel ride at Wahiba Sands"
                className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write what happened today…"
                rows={6}
                className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Photos</label>
                <label className={`text-xs font-bold px-3 py-2 rounded-full border transition-all cursor-pointer ${saving ? 'opacity-60' : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'}`}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePickImages(e.target.files)}
                    disabled={saving}
                  />
                  <i className="fas fa-image mr-2"></i>
                  Add photos
                </label>
              </div>

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {images.map((src, idx) => (
                    <div key={idx} className="relative">
                      <SafeImage src={src} alt={`Selected ${idx + 1}`} className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                      <button
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                        title="Remove"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={createEntry}
              disabled={!canSave || saving}
              className="w-full py-4 rounded-2xl text-lg shadow-xl shadow-indigo-100"
              icon={saving ? 'spinner fa-spin' : 'check'}
            >
              Save Journal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};


