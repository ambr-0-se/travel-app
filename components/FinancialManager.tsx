
import React, { useState, useEffect } from 'react';
import { BudgetEntry, Currency } from '../types';
import { EXCHANGE_RATES } from '../constants';
import { Button } from './Button';

export const FinancialManager: React.FC = () => {
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>('AED');
  const [category, setCategory] = useState<string>('Food');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('explorer_budget');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const addEntry = () => {
    if (!amount || isNaN(Number(amount))) return;
    const newEntry: BudgetEntry = {
      id: Date.now().toString(),
      amount: Number(amount),
      currency,
      category,
      description,
      date: new Date().toISOString()
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem('explorer_budget', JSON.stringify(updated));
    setAmount('');
    setDescription('');
  };

  const totalHKD = entries.reduce((acc, entry) => {
    return acc + (entry.amount * EXCHANGE_RATES[entry.currency]);
  }, 0);

  const deleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('explorer_budget', JSON.stringify(updated));
  };

  return (
    <div className="max-w-md mx-auto p-4 animate-fadeIn">
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl mb-6">
        <p className="text-indigo-100 text-sm font-medium mb-1">Total Expenses (Base Currency)</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-bold">HK$ {totalHKD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-indigo-500/30">
          <div>
            <p className="text-xs text-indigo-100 mb-1">Current Rates</p>
            <div className="space-y-1">
              <p className="text-[10px]">1 AED = {EXCHANGE_RATES.AED} HKD</p>
              <p className="text-[10px]">1 OMR = {EXCHANGE_RATES.OMR} HKD</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
        <h3 className="font-bold text-slate-800 mb-4">Add Expense</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <select 
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
            >
              <option value="AED">AED</option>
              <option value="OMR">OMR</option>
              <option value="HKD">HKD</option>
            </select>
            <input 
              type="number" 
              placeholder="0.00"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <input 
            type="text" 
            placeholder="Description (e.g. Lunch at Mutrah)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            {['Food', 'Transport', 'Stay', 'Shopping'].map(cat => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${category === cat ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <Button onClick={addEntry} className="w-full py-3">Add to Ledger</Button>
        </div>
      </div>

      <div className="space-y-3 pb-24">
        <h3 className="font-bold text-slate-800 flex justify-between items-center">
          Transaction History
          <span className="text-xs font-normal text-slate-400">{entries.length} entries</span>
        </h3>
        {entries.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <i className="fas fa-receipt text-4xl mb-3 opacity-20"></i>
            <p className="text-sm">No expenses logged yet</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  entry.category === 'Food' ? 'bg-orange-50 text-orange-500' :
                  entry.category === 'Transport' ? 'bg-blue-50 text-blue-500' :
                  entry.category === 'Stay' ? 'bg-indigo-50 text-indigo-500' :
                  'bg-emerald-50 text-emerald-500'
                }`}>
                  <i className={`fas fa-${
                    entry.category === 'Food' ? 'utensils' :
                    entry.category === 'Transport' ? 'car' :
                    entry.category === 'Stay' ? 'hotel' :
                    'bag-shopping'
                  }`}></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{entry.description || entry.category}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{entry.currency} {entry.amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <p className="text-sm font-bold text-slate-600">
                  + { (entry.amount * EXCHANGE_RATES[entry.currency]).toFixed(1) } HKD
                </p>
                <button 
                  onClick={() => deleteEntry(entry.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                >
                  <i className="fas fa-times-circle"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
