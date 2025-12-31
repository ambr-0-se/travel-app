
export interface ItineraryItem {
  id: string;
  time: string;
  location: string;
  title: string;
  description: string;
  longDescription?: string;
  openingHours?: string;
  tips?: string[];
  photo: string;
  caution?: string;
  type: 'hotel' | 'activity' | 'flight' | 'mass' | 'transport';
  date: string;
  lat?: number;
  lng?: number;
  readMoreLinks?: { label: string; url: string }[];
}

export interface HubItem {
  name: string;
  desc: string;
  longDesc?: string;
  photo: string;
  category: 'place' | 'food';
  readMoreLinks?: { label: string; url: string }[];
}

export interface DailySchedule {
  date: string;
  title: string;
  dailyTips?: {
    weather: {
      high: number;
      low: number;
      condition: string;
      conditionIcon: string;
      reportUrl: string;
    };
    bring: string[];
    aware: string;
  };
  items: ItineraryItem[];
}

export type Currency = 'AED' | 'OMR' | 'HKD';

export interface BudgetEntry {
  id: string;
  amount: number;
  currency: Currency;
  category: string;
  description: string;
  date: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface JournalEntry {
  id: string;
  createdAt: number;
  title: string;
  text: string;
  imageDataUrls: string[];
}
