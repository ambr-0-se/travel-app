
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INITIAL_ITINERARY } from './constants';
import { DailySchedule, ItineraryItem } from './types';
import { ItineraryCard } from './components/ItineraryCard';
import { FinancialManager } from './components/FinancialManager';
import { AIAssistant } from './components/AIAssistant';
import { KnowledgeHub } from './components/KnowledgeHub';
import { DetailsOverlay } from './components/DetailsOverlay';
import { Journal } from './components/Journal';
import { getWeatherData, WeatherData } from './services/weather';

const ITINERARY_STORAGE_KEY = 'explorer_itinerary_v6';
const ITINERARY_SEED_VERSION_KEY = 'explorer_itinerary_seed_version';
// Bump this number whenever you change INITIAL_ITINERARY in constants.tsx and want it to apply to existing users (when online).
const ITINERARY_SEED_VERSION = 3;

// When we intentionally remove a seed item, we must ensure it doesn't get resurrected from saved localStorage.
const REMOVED_SEED_ITEM_IDS = new Set<string>([
  '25', // 2025-12-29 Muscat City Tour
]);

function mergeSeedIntoSaved(seed: DailySchedule[], saved: DailySchedule[]): DailySchedule[] {
  const savedByDate = new Map(saved.map(d => [d.date, d]));
  const merged: DailySchedule[] = [];

  for (const seedDay of seed) {
    const savedDay = savedByDate.get(seedDay.date);
    if (!savedDay) {
      merged.push(seedDay);
      continue;
    }

    const seedIds = new Set(seedDay.items.map(i => i.id));
    const userAddedItems = savedDay.items.filter(i => !seedIds.has(i.id) && !REMOVED_SEED_ITEM_IDS.has(i.id));

    // Prefer latest seed metadata, but keep user-added items appended.
    merged.push({
      ...seedDay,
      items: [...seedDay.items, ...userAddedItems],
    });
  }

  // Keep any extra saved days not present in seed (if user added days in the future).
  const seedDates = new Set(seed.map(d => d.date));
  for (const extra of saved) {
    if (!seedDates.has(extra.date)) merged.push(extra);
  }

  return merged;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'ai' | 'hub' | 'journal'>('itinerary');
  const [itinerary, setItinerary] = useState<DailySchedule[]>(INITIAL_ITINERARY);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedDetailItem, setSelectedDetailItem] = useState<ItineraryItem | null>(null);
  const [weatherCache, setWeatherCache] = useState<Record<string, WeatherData>>({});
  const didAutoSelectDayRef = useRef(false);

  useEffect(() => {
    const savedRaw = localStorage.getItem(ITINERARY_STORAGE_KEY);
    const savedSeedVersion = Number(localStorage.getItem(ITINERARY_SEED_VERSION_KEY) || '0');

    // One-time cleanup of older key (v5)
    if (localStorage.getItem('explorer_itinerary_v5')) {
      localStorage.removeItem('explorer_itinerary_v5');
    }

    if (!savedRaw) {
      localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(INITIAL_ITINERARY));
      localStorage.setItem(ITINERARY_SEED_VERSION_KEY, String(ITINERARY_SEED_VERSION));
      setItinerary(INITIAL_ITINERARY);
      return;
    }

    const saved = JSON.parse(savedRaw) as DailySchedule[];

    // Offline: keep the last saved plan.
    if (!navigator.onLine) {
      setItinerary(saved);
      return;
    }

    // Online: if seed version changed, merge latest seed into saved data.
    if (savedSeedVersion !== ITINERARY_SEED_VERSION) {
      const merged = mergeSeedIntoSaved(INITIAL_ITINERARY, saved);
      localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(merged));
      localStorage.setItem(ITINERARY_SEED_VERSION_KEY, String(ITINERARY_SEED_VERSION));
      setItinerary(merged);
      return;
    }

    // Online + same seed version: use saved.
    setItinerary(saved);
  }, []);

  // Auto-detect "today" and open that day's itinerary (or nearest upcoming day)
  useEffect(() => {
    if (didAutoSelectDayRef.current) return;
    if (!itinerary || itinerary.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const exactIdx = itinerary.findIndex(d => d.date === today);
    if (exactIdx >= 0) {
      setSelectedDayIndex(exactIdx);
      didAutoSelectDayRef.current = true;
      return;
    }

    // If not found, go to the next upcoming day; otherwise, last day.
    const todayTime = new Date(today).getTime();
    const nextIdx = itinerary.findIndex(d => new Date(d.date).getTime() > todayTime);
    setSelectedDayIndex(nextIdx >= 0 ? nextIdx : itinerary.length - 1);
    didAutoSelectDayRef.current = true;
  }, [itinerary]);

  const inferWeatherLocation = (day: DailySchedule): string => {
    // Prefer day title as a strong signal
    const title = day.title || '';
    if (/abu dhabi/i.test(title)) return 'Abu Dhabi, UAE';
    if (/dubai/i.test(title)) return 'Dubai, UAE';
    if (/muscat/i.test(title)) return 'Muscat, Oman';
    if (/nizwa/i.test(title)) return 'Nizwa, Oman';
    if (/jabal|jebel|akhdar/i.test(title)) return 'Jebel Akhdar, Oman';
    if (/wahiba|desert/i.test(title)) return 'Wahiba Sands, Oman';

    // Fall back to first item location
    const first = day.items?.[0];
    const loc = first?.location || '';
    if (/DXB|Dubai/i.test(loc)) return 'Dubai, UAE';
    if (/Abu Dhabi/i.test(loc)) return 'Abu Dhabi, UAE';
    if (/MCT|Muscat/i.test(loc)) return 'Muscat, Oman';
    if (/Nizwa/i.test(loc)) return 'Nizwa, Oman';
    if (/Jabal|Jebel|Akhdar/i.test(loc)) return 'Jebel Akhdar, Oman';
    if (/Wahiba|Desert/i.test(loc)) return 'Wahiba Sands, Oman';

    return '';
  };

  const weatherLocationsKey = useMemo(() => {
    const locations = new Set<string>();
    for (const day of itinerary) {
      const loc = inferWeatherLocation(day);
      if (loc) locations.add(loc);
    }
    return Array.from(locations).sort().join('|');
  }, [itinerary]);

  // Fetch weather for all days on mount and when itinerary changes
  useEffect(() => {
    const fetchWeatherForAllDays = async () => {
      const locations = new Set<string>();
      itinerary.forEach(day => {
        const loc = inferWeatherLocation(day);
        if (loc) locations.add(loc);
      });

      const weatherPromises = Array.from(locations).map(async (location) => {
        const weather = await getWeatherData(location);
        return { location, weather };
      });

      const results = await Promise.all(weatherPromises);
      const newCache: Record<string, WeatherData> = {};
      results.forEach(({ location, weather }) => {
        if (weather) {
          newCache[location] = weather;
        }
      });
      setWeatherCache(newCache);
    };

    fetchWeatherForAllDays();
  }, [weatherLocationsKey]);

  // Persist retrieved weather into each day's dailyTips so offline always shows the most recently retrieved values.
  useEffect(() => {
    if (!navigator.onLine) return;
    if (!weatherCache || Object.keys(weatherCache).length === 0) return;

    let changed = false;
    const updated = itinerary.map(day => {
      if (!day.dailyTips) return day;
      const loc = inferWeatherLocation(day);
      const w = loc ? weatherCache[loc] : undefined;
      if (!w) return day;

      const prev = day.dailyTips.weather;
      if (
        prev.high === w.high &&
        prev.low === w.low &&
        prev.condition === w.condition &&
        prev.conditionIcon === w.conditionIcon &&
        prev.reportUrl === w.reportUrl
      ) {
        return day;
      }

      changed = true;
      return {
        ...day,
        dailyTips: {
          ...day.dailyTips,
          weather: {
            high: w.high,
            low: w.low,
            condition: w.condition,
            conditionIcon: w.conditionIcon,
            reportUrl: w.reportUrl,
          },
        },
      };
    });

    if (changed) {
      // Save without changing any items/order; only refresh weather fields.
      saveToStorage(updated);
    }
  }, [weatherCache]);

  // Get weather for a specific day
  const getWeatherForDay = (day: DailySchedule): WeatherData | null => {
    const location = inferWeatherLocation(day);

    // Try to get from cache
    if (location && weatherCache[location]) {
      return weatherCache[location];
    }

    // Fall back to static weather data
    return day.dailyTips?.weather ? {
      high: day.dailyTips.weather.high,
      low: day.dailyTips.weather.low,
      condition: day.dailyTips.weather.condition,
      conditionIcon: day.dailyTips.weather.conditionIcon,
      reportUrl: day.dailyTips.weather.reportUrl,
    } : null;
  };

  const getDayHighlights = (day: DailySchedule): string[] => {
    const excludeTitle = /(arrival|flight|transfer|check-?in|hotel|lunch|dinner)/i;

    const highlights = day.items
      .filter(item => item.type === 'activity')
      .filter(item => !excludeTitle.test(item.title))
      .map(item => item.title.trim())
      .filter(Boolean);

    // De-dup while preserving order
    return [...new Set(highlights)];
  };

  const saveToStorage = (updated: DailySchedule[]) => {
    setItinerary(updated);
    localStorage.setItem(ITINERARY_STORAGE_KEY, JSON.stringify(updated));
  };

  const addEvent = () => {
    const newItem: ItineraryItem = {
      id: Date.now().toString(),
      time: '12:00',
      location: 'Dubai Mall',
      title: 'New Activity',
      description: 'Tap the pencil icon to edit this event name and location.',
      longDescription: 'A custom event added by the user to the travel plan.',
      openingHours: 'Variable',
      tips: ['Great for kids of all ages.'],
      photo: 'https://images.unsplash.com/photo-1546412414-8035e1776c9a?q=80&w=1000',
      type: 'activity',
      date: itinerary[selectedDayIndex].date
    };
    
    const updated = [...itinerary];
    updated[selectedDayIndex].items.push(newItem);
    saveToStorage(updated);
  };

  const deleteEvent = (id: string) => {
    const updated = itinerary.map(day => ({
      ...day,
      items: day.items.filter(item => item.id !== id)
    }));
    saveToStorage(updated);
  };

  const updateEvent = (id: string, updates: Partial<ItineraryItem>) => {
    const updated = itinerary.map(day => ({
      ...day,
      items: day.items.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
    saveToStorage(updated);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'itinerary':
        const currentDay = itinerary[selectedDayIndex];
        return (
          <div className="pb-24 animate-fadeIn">
            <div className="p-6 flex flex-col gap-1 bg-white border-b border-slate-100 sticky top-0 z-20">
              <h1 className="text-2xl font-bold text-slate-800">Family Explorer</h1>
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">Dec 21 - Dec 30 • Winter Expedition</p>
              </div>
              
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {itinerary.map((day, idx) => (
                  <button 
                    key={day.date}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      selectedDayIndex === idx 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Dec {day.date.split('-')[2]}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {currentDay.dailyTips && (() => {
                const weather = getWeatherForDay(currentDay);
                if (!weather) return null;
                
                return (
                  <div className="mb-8 bg-indigo-50 rounded-3xl p-5 border border-indigo-100 relative overflow-hidden">
                    {/* Decorative Condition Background */}
                    <div 
                      className="absolute top-0 right-0 w-32 h-32 opacity-20 bg-cover bg-center pointer-events-none" 
                      style={{ backgroundImage: `url(${weather.conditionIcon})` }}
                    />
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest">Day Tips</h3>
                      
                      <a 
                        href={weather.reportUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-indigo-200 shadow-sm hover:border-indigo-400 transition-all group active:scale-95"
                      >
                        <img 
                          src={weather.conditionIcon} 
                          className="w-5 h-5 rounded-full object-cover border border-slate-100" 
                          alt={weather.condition}
                        />
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <i className="fas fa-arrow-up text-red-500 text-[10px]"></i>
                            <span className="text-[10px] font-bold text-indigo-900">{weather.high}°</span>
                          </div>
                          <div className="w-[1px] h-3 bg-slate-200"></div>
                          <div className="flex items-center gap-1">
                            <i className="fas fa-arrow-down text-blue-500 text-[10px]"></i>
                            <span className="text-[10px] font-bold text-indigo-900">{weather.low}°</span>
                          </div>
                          <i className="fas fa-external-link-alt text-[8px] text-slate-300 group-hover:text-indigo-400"></i>
                        </div>
                      </a>
                    </div>

                    <div className="space-y-4 relative z-10">
                      {(() => {
                        const highlights = getDayHighlights(currentDay);
                        if (highlights.length === 0) return null;
                        return (
                          <div>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Highlights</p>
                            <ul className="space-y-2">
                              {highlights.map((h) => (
                                <li key={h} className="flex gap-3 text-xs text-indigo-800 font-medium leading-relaxed">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5"></div>
                                  {h}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}

                      <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Essential Kit</p>
                        <div className="flex flex-wrap gap-2">
                          {currentDay.dailyTips.bring.map((item, i) => (
                            <span key={i} className="text-[10px] bg-white text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100 font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Look Out For</p>
                        <p className="text-xs text-indigo-800 font-medium leading-relaxed">
                          {currentDay.dailyTips.aware}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 leading-tight">{currentDay.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">{currentDay.items.length} Activities Planned</p>
                </div>
                <button 
                  onClick={addEvent}
                  className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>

              {currentDay.items.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 border-2 border-dashed border-slate-200">
                    <i className="fas fa-calendar-day text-3xl"></i>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">No plans for today yet!</p>
                </div>
              ) : (
                currentDay.items.map(item => (
                  <ItineraryCard 
                    key={item.id} 
                    item={item} 
                    onDelete={deleteEvent}
                    onUpdate={updateEvent}
                    onViewDetails={(item) => setSelectedDetailItem(item)}
                  />
                ))
              )}
            </div>
          </div>
        );
      case 'budget': return <FinancialManager />;
      case 'ai': return <AIAssistant itinerary={itinerary} />;
      case 'hub': return <KnowledgeHub />;
      case 'journal': return <Journal />;
    }
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto bg-slate-50 relative overflow-x-hidden">
      {renderContent()}

      {selectedDetailItem && (
        <DetailsOverlay 
          title={selectedDetailItem.title}
          subtitle={`${selectedDetailItem.time} • ${selectedDetailItem.type.toUpperCase()}`}
          photo={selectedDetailItem.photo}
          description={selectedDetailItem.description}
          longDescription={selectedDetailItem.longDescription}
          openingHours={selectedDetailItem.openingHours}
          tips={selectedDetailItem.tips}
          readMoreLinks={selectedDetailItem.readMoreLinks}
          onClose={() => setSelectedDetailItem(null)}
          onNavigate={() => {
            const query = encodeURIComponent(`${selectedDetailItem.title} ${selectedDetailItem.location}`);
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=transit`, '_blank');
          }}
        />
      )}

      <nav className="fixed bottom-6 left-6 right-6 h-16 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[2rem] flex items-center justify-around px-2 z-[90]">
        <button 
          onClick={() => setActiveTab('itinerary')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'itinerary' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <i className="fas fa-calendar-day text-lg"></i>
          <span className="text-[10px] font-bold uppercase tracking-widest">Plan</span>
        </button>
        <button 
          onClick={() => setActiveTab('hub')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'hub' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <i className="fas fa-compass text-lg"></i>
          <span className="text-[10px] font-bold uppercase tracking-widest">Hub</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('ai')}
          className={`w-16 h-16 -mt-10 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 border-4 border-white ${activeTab === 'ai' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-100'}`}
        >
          <i className="fas fa-robot text-xl"></i>
        </button>

        <button 
          onClick={() => setActiveTab('budget')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'budget' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <i className="fas fa-wallet text-lg"></i>
          <span className="text-[10px] font-bold uppercase tracking-widest">Money</span>
        </button>
        <button 
          onClick={() => setActiveTab('journal')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'journal' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <i className="fas fa-book-open text-lg"></i>
          <span className="text-[10px] font-bold uppercase tracking-widest">Journal</span>
        </button>
      </nav>
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default App;
