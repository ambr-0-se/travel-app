
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { getGeminiChatResponse } from '../services/gemini';
import { ChatMessage, DailySchedule, ItineraryItem, GeoLocation } from '../types';
import { Button } from './Button';

interface Props {
  itinerary: DailySchedule[];
}

export const AIAssistant: React.FC<Props> = ({ itinerary }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'ready' | 'denied' | 'error' | 'unsupported'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Compute context: today's schedule, done vs upcoming, next up
  const context = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySchedule = itinerary.find(day => day.date === today);
    
    if (!todaySchedule) {
      return { today: null, done: [], upcoming: [], nextUp: null };
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const done: ItineraryItem[] = [];
    const upcoming: ItineraryItem[] = [];

    todaySchedule.items.forEach(item => {
      const [hours, minutes] = item.time.split(':').map(Number);
      const itemTimeMinutes = hours * 60 + minutes;
      
      if (itemTimeMinutes < currentTimeMinutes) {
        done.push(item);
      } else {
        upcoming.push(item);
      }
    });

    const nextUp = upcoming.length > 0 ? upcoming[0] : null;

    return { today: todaySchedule, done, upcoming, nextUp };
  }, [itinerary]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await getGeminiChatResponse(text, history, itinerary, location);
      setMessages(prev => [...prev, { role: 'model', text: response || 'I had trouble processing that.', timestamp: Date.now() }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: 'Error connecting to the travel guide.', timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setLocationStatus('ready');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setLocationStatus('denied');
        else setLocationStatus('error');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  };

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      // Logic would stop recognition
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Voice recognition not supported in this browser.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.start();
      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSend(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
      <div className="px-6 pt-4 pb-2 border-b border-slate-100 bg-white">
        <h2 className="text-xl font-bold text-slate-800">Travel Assistant</h2>
        <p className="text-xs text-slate-500">I know your schedule and local spots!</p>
      </div>

      {context.today && (
        <div className="px-4 pt-3 pb-2 bg-slate-50 border-b border-slate-100">
          <div className="bg-white rounded-xl p-3 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today</span>
              <span className="text-xs text-slate-500">{context.today.title}</span>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-slate-600">{context.done.length} Done</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span className="text-slate-600">{context.upcoming.length} Upcoming</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                {locationStatus === 'ready' && location ? (
                  <span><i className="fas fa-location-dot text-indigo-500 mr-1"></i>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}{location.accuracy ? ` (±${Math.round(location.accuracy)}m)` : ''}</span>
                ) : locationStatus === 'requesting' ? (
                  <span><i className="fas fa-spinner fa-spin text-slate-400 mr-1"></i>Getting location…</span>
                ) : locationStatus === 'denied' ? (
                  <span><i className="fas fa-ban text-slate-400 mr-1"></i>Location permission denied</span>
                ) : locationStatus === 'unsupported' ? (
                  <span><i className="fas fa-circle-xmark text-slate-400 mr-1"></i>Location not supported</span>
                ) : (
                  <span><i className="fas fa-location-crosshairs text-slate-400 mr-1"></i>Location not shared</span>
                )}
              </div>
              <button
                onClick={requestLocation}
                className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-all disabled:opacity-60"
                disabled={locationStatus === 'requesting'}
              >
                Use my location
              </button>
            </div>
            {context.nextUp && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <i className="fas fa-clock text-indigo-500 text-[10px]"></i>
                  <span className="text-xs font-medium text-slate-700">Next: {context.nextUp.time} - {context.nextUp.title}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10 px-8 text-slate-400">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-robot text-2xl"></i>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">Welcome, Explorer!</p>
            <p className="text-xs leading-relaxed">Ask me about your itinerary, restaurants in Muscat, or cultural tips for Dubai.</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {['What is next on my schedule?', 'Suggest dinner in Dubai.', 'Is snorkeling safe today?'].map(q => (
                <button 
                  key={q} 
                  onClick={() => handleSend(q)}
                  className="text-[10px] bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-indigo-400 hover:text-indigo-600 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 px-4 py-2 rounded-2xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 safe-bottom">
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleVoice}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500'}`}
          >
            <i className={`fas fa-${isListening ? 'microphone-slash' : 'microphone'}`}></i>
          </button>
          <input 
            type="text" 
            placeholder="Type your question..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="w-12 h-12 bg-indigo-600 text-white flex items-center justify-center rounded-full disabled:opacity-50"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
