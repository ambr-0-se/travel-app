
import React, { useState, useEffect } from 'react';
import { ItineraryItem } from '../types';
import { generateTTS, decodeBase64Audio, decodeAudioData } from '../services/gemini';
import { Button } from './Button';

interface Props {
  item: ItineraryItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ItineraryItem>) => void;
  onViewDetails: (item: ItineraryItem) => void;
}

export const ItineraryCard: React.FC<Props> = ({ item, onDelete, onUpdate, onViewDetails }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editLocation, setEditLocation] = useState(item.location);

  // Sync state if item changes from outside (e.g. reload)
  useEffect(() => {
    setEditTitle(item.title);
    setEditLocation(item.location);
  }, [item.title, item.location]);

  const playAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const base64 = await generateTTS(item.description);
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

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(item.id, { title: editTitle, location: editLocation });
    setIsEditing(false);
  };

  const toggleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing) {
      // Revert if canceling
      setEditTitle(item.title);
      setEditLocation(item.location);
    }
    setIsEditing(!isEditing);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // User requested a confirmation prompt before deletion
    const confirmed = window.confirm(`Are you sure you want to remove "${item.title}" from your plan?`);
    if (confirmed) {
      onDelete(item.id);
    }
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'hotel': return 'hotel';
      case 'activity': return 'camera';
      case 'flight': return 'plane';
      case 'mass': return 'cross';
      case 'transport': return 'car';
      default: return 'map-marker-alt';
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'hotel': return 'bg-blue-100 text-blue-600';
      case 'activity': return 'bg-emerald-100 text-emerald-600';
      case 'flight': return 'bg-indigo-100 text-indigo-600';
      case 'mass': return 'bg-purple-100 text-purple-600';
      case 'transport': return 'bg-orange-100 text-orange-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="relative pl-8 pb-8 last:pb-0" onClick={() => !isEditing && onViewDetails(item)}>
      <div className="absolute left-[11px] top-2 bottom-0 w-[2px] bg-slate-200 last:hidden"></div>
      
      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 ${getTypeColor().split(' ')[0]}`}>
        <i className={`fas fa-${getTypeIcon()} text-[10px]`}></i>
      </div>

      <div className={`bg-white rounded-2xl shadow-sm border ${isEditing ? 'border-indigo-400' : 'border-slate-100'} overflow-hidden hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]`}>
        <img src={item.photo} alt={item.title} className="w-full h-32 object-cover bg-slate-100" />
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 mr-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.time}</span>
              {isEditing ? (
                <div className="mt-1 space-y-2">
                  <input 
                    type="text" 
                    className="w-full text-sm font-bold bg-slate-50 border border-indigo-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    placeholder="Event Name"
                  />
                  <input 
                    type="text" 
                    className="w-full text-xs bg-slate-50 border border-indigo-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500" 
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Location"
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">{item.title}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <i className="fas fa-location-dot text-[10px]"></i> {item.location}
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getTypeColor()}`}>
                {item.type}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={toggleEdit}
                  className={`${isEditing ? 'text-indigo-600' : 'text-slate-300'} hover:text-indigo-500 transition-colors p-1`}
                  title="Edit Event"
                >
                  <i className={`fas fa-${isEditing ? 'times' : 'pen-to-square'} text-xs`}></i>
                </button>
                {!isEditing && (
                  <button 
                    onClick={handleDelete}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    title="Delete Event"
                  >
                    <i className="fas fa-trash-alt text-xs"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{item.description}</p>

          <div className="flex gap-2">
            {isEditing ? (
              <Button 
                variant="primary" 
                onClick={handleSave} 
                icon="check"
                className="flex-1 text-[10px] py-1.5"
              >
                Save Changes
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={playAudio} 
                  icon={isPlaying ? 'spinner fa-spin' : 'volume-up'}
                  className="flex-1 text-[10px] py-1.5"
                  disabled={isPlaying}
                >
                  {isPlaying ? 'Playing...' : 'Hear Info'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={(e) => { e.stopPropagation(); onViewDetails(item); }} 
                  icon="circle-info"
                  className="flex-1 text-[10px] py-1.5"
                >
                  Details
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
