
import React, { useState } from 'react';
import { KNOWLEDGE_HUB } from '../constants';
import { DetailsOverlay } from './DetailsOverlay';

export const KnowledgeHub: React.FC = () => {
  const [region, setRegion] = useState<'uae' | 'oman'>('uae');
  const [activeTab, setActiveTab] = useState<'places' | 'foods' | 'culture'>('places');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const data = KNOWLEDGE_HUB[region];

  return (
    <div className="p-6 pb-24 animate-fadeIn">
      {/* Region Selector */}
      <div className="flex bg-slate-200 p-1 rounded-2xl mb-6">
        <button 
          onClick={() => setRegion('uae')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${region === 'uae' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
        >
          United Arab Emirates
        </button>
        <button 
          onClick={() => setRegion('oman')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${region === 'oman' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
        >
          Sultanate of Oman
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {['places', 'foods', 'culture'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab ? 'bg-slate-800 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'places' && (
          <div className="grid grid-cols-1 gap-4">
            {data.places.map(item => (
              <div 
                key={item.name} 
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative h-40">
                  <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-indigo-600">MUST VISIT</div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 mb-1">{item.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'foods' && (
          <div className="grid grid-cols-2 gap-4">
            {data.foods.map(item => (
              <div 
                key={item.name} 
                className="bg-white p-3 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => setSelectedItem(item)}
              >
                <img src={item.photo} alt={item.name} className="w-full h-24 object-cover rounded-2xl mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'culture' && (
          <div className="space-y-6">
            <section className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <i className="fas fa-globe"></i> Cultural Basics
              </h3>
              <p className="text-sm text-indigo-100 leading-relaxed">
                {data.culture.basics}
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-handshake text-orange-500"></i> Etiquette Guide
              </h3>
              <div className="space-y-3">
                {data.culture.etiquette.map((tip, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-4 items-start shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{tip}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {selectedItem && (
        <DetailsOverlay 
          title={selectedItem.name}
          subtitle={region.toUpperCase() + " • " + (selectedItem.category === 'food' ? 'FOOD' : 'PLACE')}
          photo={selectedItem.photo}
          description={selectedItem.desc}
          longDescription={selectedItem.longDesc}
          tips={selectedItem.category === 'place' ? ["Highly recommended for families.", "Peak hours: 5 PM - 8 PM."] : undefined}
          readMoreLinks={selectedItem.readMoreLinks}
          onClose={() => setSelectedItem(null)}
          onNavigate={selectedItem.category === 'place' ? () => {
            const query = encodeURIComponent(selectedItem.name + ' ' + region);
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=transit`, '_blank');
          } : undefined}
        />
      )}
    </div>
  );
};
