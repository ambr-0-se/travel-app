
import { DailySchedule, HubItem } from './types';

export const EXCHANGE_RATES = {
  AED: 2.12,
  OMR: 20.26,
  HKD: 1.00,
};

// Weather visuals: use small, reflective icons (SVG data URIs) instead of photos.
const svgToDataUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const WEATHER_ICONS = {
  SUNNY: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#FBBF24"/>
          <stop offset="1" stop-color="#F59E0B"/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="12" fill="url(#g)"/>
      <g stroke="#F59E0B" stroke-width="4" stroke-linecap="round">
        <line x1="32" y1="4" x2="32" y2="14"/>
        <line x1="32" y1="50" x2="32" y2="60"/>
        <line x1="4" y1="32" x2="14" y2="32"/>
        <line x1="50" y1="32" x2="60" y2="32"/>
        <line x1="12" y1="12" x2="19" y2="19"/>
        <line x1="45" y1="45" x2="52" y2="52"/>
        <line x1="12" y1="52" x2="19" y2="45"/>
        <line x1="45" y1="19" x2="52" y2="12"/>
      </g>
    </svg>
  `),
  CLEAR: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="18" fill="#60A5FA"/>
      <path d="M45 26c-2-6-8-10-15-10-9 0-16 7-16 16 0 7 5 13 12 15 10 2 21-5 21-16 0-2 0-4-2-5z"
        fill="#E0F2FE" opacity="0.9"/>
    </svg>
  `),
  COASTAL: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M8 40c2 6 8 10 15 10h22c7 0 13-5 13-12 0-7-6-12-13-12-2 0-4 0-5 1C37 18 31 14 24 14 15 14 8 21 8 30c0 4 0 7 2 10z"
        fill="#93C5FD"/>
      <path d="M10 54c6-4 12-4 18 0s12 4 18 0 12-4 18 0" fill="none" stroke="#3B82F6" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `),
  CHILLY: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <g fill="none" stroke="#60A5FA" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M32 6v52"/>
        <path d="M12 16l40 32"/>
        <path d="M52 16L12 48"/>
        <path d="M20 10l4 6"/>
        <path d="M40 10l-4 6"/>
        <path d="M20 54l4-6"/>
        <path d="M40 54l-4-6"/>
      </g>
    </svg>
  `),
  BREEZY: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <g fill="none" stroke="#38BDF8" stroke-width="4" stroke-linecap="round">
        <path d="M8 24h30c6 0 10-4 10-9 0-3-2-6-5-7"/>
        <path d="M8 36h40c6 0 10 4 10 9 0 4-3 7-7 7"/>
        <path d="M8 48h22c5 0 9-3 9-8"/>
      </g>
    </svg>
  `),
  DRY: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M32 8c10 12 16 20 16 30 0 9-7 16-16 16S16 47 16 38c0-10 6-18 16-30z"
        fill="#FDE68A" stroke="#F59E0B" stroke-width="3"/>
      <path d="M24 40c4-2 8-2 12 0" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `),
  HUMID: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M22 12c6 8 10 14 10 22 0 6-5 12-10 12S12 40 12 34c0-8 4-14 10-22z" fill="#93C5FD"/>
      <path d="M42 18c6 8 10 14 10 22 0 6-5 12-10 12S32 46 32 40c0-8 4-14 10-22z" fill="#60A5FA"/>
      <path d="M18 54c4-2 8-2 12 0s8 2 12 0s8-2 12 0" fill="none" stroke="#3B82F6" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `),
};

export const getWeatherIcon = (condition: string) => {
  const c = condition.toLowerCase();
  if (c.includes('breeze') || c.includes('wind')) return WEATHER_ICONS.BREEZY;
  if (c.includes('humid')) return WEATHER_ICONS.HUMID;
  if (c.includes('coast') || c.includes('sea')) return WEATHER_ICONS.COASTAL;
  if (c.includes('chill') || c.includes('cold') || c.includes('snow')) return WEATHER_ICONS.CHILLY;
  if (c.includes('dry')) return WEATHER_ICONS.DRY;
  if (c.includes('clear')) return WEATHER_ICONS.CLEAR;
  return WEATHER_ICONS.SUNNY;
};

const googleWeatherUrl = (place: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`weather ${place}`)}`;

export const INITIAL_ITINERARY: DailySchedule[] = [
  {
    date: '2025-12-21',
    title: 'Arrival in Dubai',
    dailyTips: {
      weather: { 
        high: 26, 
        low: 16, 
        condition: 'Sunny', 
        conditionIcon: getWeatherIcon('Sunny'),
        reportUrl: googleWeatherUrl('Dubai, UAE')
      },
      bring: ['Light jacket for evening', 'Power adapter (Type G)', 'Passport copy'],
      aware: 'Arrive at meeting point 10 minutes before tour time.'
    },
    items: [
      {
        id: '1',
        time: '06:00',
        location: 'Dubai International (DXB)',
        title: 'Arrival',
        description: 'Land at Dubai International Airport.',
        photo: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=1000',
        type: 'flight',
        date: '2025-12-21'
      },
      {
        id: '2',
        time: '10:00',
        location: 'Church',
        title: 'Mass',
        description: 'Attend mass service.',
        photo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1000&q=80&auto=format&fit=crop',
        type: 'mass',
        date: '2025-12-21'
      },
      {
        id: '3',
        time: '14:30',
        location: 'Dubai Creek - Al Seef St - Al Seef Heritage Hotel by Curio Bayt 1',
        title: 'Old Town, Creek, Museums, Souks, & Street Food Tour',
        description: 'Walking tour in old town. Meet your guide at the entrance of Al Seef Heritage Hotel by Curio Bayt 1. The guide will be wearing a badge and will contact you before the tour.',
        longDescription: 'Dubai: Old Town, Creek, Museums, Souks, & Street Food Tour. Duration: 2:30 PM - 5:30 PM. Please arrive at the meeting point 10 minutes before your chosen time.',
        openingHours: '2:30 PM - 5:30 PM',
        tips: ['Arrive 10 minutes before tour time.', 'Guide will contact you before the tour.'],
        photo: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1000',
        type: 'activity',
        date: '2025-12-21'
      }
    ]
  },
  {
    date: '2025-12-22',
    title: 'City Tour in Dubai',
    dailyTips: {
      weather: { 
        high: 25, 
        low: 17, 
        condition: 'Clear', 
        conditionIcon: getWeatherIcon('Clear'),
        reportUrl: googleWeatherUrl('Dubai, UAE')
      },
      bring: ['Sunscreen', 'Camera', 'Comfortable walking shoes'],
      aware: 'City tour covering Dubai\'s main attractions.'
    },
    items: [
      {
        id: '4',
        time: '09:00',
        location: 'Dubai',
        title: 'City Tour',
        description: 'City tour in Dubai.',
        photo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000',
        type: 'activity',
        date: '2025-12-22'
      }
    ]
  },
  {
    date: '2025-12-23',
    title: 'Day Trip to Abu Dhabi',
    dailyTips: {
      weather: { 
        high: 24, 
        low: 15, 
        condition: 'Breezy', 
        conditionIcon: getWeatherIcon('Breezy'),
        reportUrl: googleWeatherUrl('Abu Dhabi, UAE')
      },
      bring: ['Conservative clothing', 'Sunglasses', 'Headscarf (Women)'],
      aware: 'Day trip to Abu Dhabi.'
    },
    items: [
      {
        id: '5',
        time: '08:00',
        location: 'Abu Dhabi',
        title: 'Day Trip to Abu Dhabi',
        description: 'Day trip to Abu Dhabi.',
        photo: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?q=80&w=1000',
        type: 'activity',
        date: '2025-12-23'
      }
    ]
  },
  {
    date: '2025-12-24',
    title: 'Flight to Muscat',
    dailyTips: {
      weather: { 
        high: 26, 
        low: 18, 
        condition: 'Sunny', 
        conditionIcon: getWeatherIcon('Sunny'),
        reportUrl: googleWeatherUrl('Dubai, UAE')
      },
      bring: ['Passport', 'Boarding pass'],
      aware: 'Flight WY610 departs at 17:15, arrives in Muscat at 18:30.'
    },
    items: [
      {
        id: '6',
        time: '17:15',
        location: 'DXB to MCT',
        title: 'Flight WY610 to Muscat',
        description: 'Flight WY610 Dubai to Muscat. Departure: 17:15, Arrival: 18:30.',
        photo: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        type: 'flight',
        date: '2025-12-24'
      },
      {
        id: '7',
        time: '18:30',
        location: 'Muscat International Airport',
        title: 'Arrival in Muscat',
        description: 'Land in Muscat. Transfer to hotel.',
        photo: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=1000',
        type: 'transport',
        date: '2025-12-24'
      },
      {
        id: '8',
        time: '19:30',
        location: 'Mecure Muscat',
        title: 'Hotel Check-in',
        description: 'Check in at Mecure Muscat.',
        photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000',
        type: 'hotel',
        date: '2025-12-24'
      }
    ]
  },
  {
    date: '2025-12-25',
    title: 'Free Time in Muscat',
    dailyTips: {
      weather: { 
        high: 25, 
        low: 19, 
        condition: 'Coastal', 
        conditionIcon: getWeatherIcon('Coastal'),
        reportUrl: googleWeatherUrl('Muscat, Oman')
      },
      bring: ['Swimming gear', 'Snorkelling equipment'],
      aware: 'Free time in Muscat. Mass and snorkelling activities.'
    },
    items: [
      {
        id: '9',
        time: '10:00',
        location: 'Church',
        title: 'Mass',
        description: 'Attend mass service.',
        photo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1000&q=80&auto=format&fit=crop',
        type: 'mass',
        date: '2025-12-25'
      },
      {
        id: '10',
        time: '14:00',
        location: 'Muscat',
        title: 'Snorkelling',
        description: 'Snorkelling activity.',
        photo: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1000',
        type: 'activity',
        date: '2025-12-25'
      },
      {
        id: '11',
        time: '20:00',
        location: 'Mecure Muscat',
        title: 'Hotel Stay',
        description: 'Stay at Mecure Muscat.',
        photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000',
        type: 'hotel',
        date: '2025-12-25'
      }
    ]
  },
  {
    date: '2025-12-26',
    title: 'Drive to Nizwa',
    dailyTips: {
      weather: { 
        high: 22, 
        low: 12, 
        condition: 'Dry', 
        conditionIcon: getWeatherIcon('Dry'),
        reportUrl: googleWeatherUrl('Nizwa, Oman')
      },
      bring: ['Cash for dates/spices', 'Camera', 'Walking shoes'],
      aware: 'Drive to Nizwa and nearby villages. Hotel: Greenview hotel in Jabal Akhdar (dinner not included).'
    },
    items: [
      {
        id: '12',
        time: '09:30',
        location: 'Nizwa',
        title: 'Drive to Nizwa + Nearby Villages',
        description: 'Drive to Nizwa and visit nearby villages.',
        photo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80&auto=format&fit=crop',
        type: 'activity',
        date: '2025-12-26',
        readMoreLinks: [
          { label: 'Oman Tourism Guide', url: 'https://www.omantourism.gov.om/wps/portal/mot/tourism/oman/home/experiences/culture/nizwa-fort' },
          { label: 'Wikipedia - Nizwa Fort', url: 'https://en.wikipedia.org/wiki/Nizwa_Fort' }
        ]
      },
      {
        id: '13',
        time: '18:00',
        location: 'Greenview Hotel, Jabal Akhdar',
        title: 'Hotel Check-in',
        description: 'Check in at Greenview hotel in Jabal Akhdar. Dinner not included.',
        photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80&auto=format&fit=crop',
        type: 'hotel',
        date: '2025-12-26'
      }
    ]
  },
  {
    date: '2025-12-27',
    title: 'Jabal Akhdar to Wahiba Sands',
    dailyTips: {
      weather: { 
        high: 14, 
        low: 4, 
        condition: 'Chilly', 
        conditionIcon: getWeatherIcon('Chilly'),
        reportUrl: googleWeatherUrl('Jebel Akhdar, Oman')
      },
      bring: ['Winter jacket', 'Gloves', 'Lip balm', 'Warm clothing for stargazing'],
      aware: 'Hiking in Al Aqur (Rose Village), Al Ayn, and Ash Shirayjah from 9-10am. Hotel check-in at Al Salam Desert Camp at 3pm. Camel riding from 4-6pm. Dinner at camp from 6:30-7:30pm. Star gazing from 8-11pm.'
    },
    items: [
      {
        id: '14',
        time: '09:00',
        location: 'Al Aqur (Rose Village), Al Ayn, and Ash Shirayjah',
        title: 'Hiking in Al Aqur (Rose Village), Al Ayn, and Ash Shirayjah',
        description: 'Hiking in Al Aqur (Rose Village), Al Ayn, and Ash Shirayjah.',
        longDescription: 'Explore the beautiful mountain villages of Al Aqur (Rose Village), Al Ayn, and Ash Shirayjah through guided hiking trails. Experience the traditional Omani architecture and stunning terraced gardens.',
        openingHours: '9:00 AM - 10:00 AM',
        tips: ['Wear comfortable hiking shoes.', 'Bring water and snacks.', 'Camera recommended for scenic views.'],
        photo: 'https://images.unsplash.com/photo-1496483353456-90997957cf99?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        type: 'activity',
        date: '2025-12-27'
      },
      {
        id: '15',
        time: '15:00',
        location: 'Al Salam Desert Camp, Wahiba Sands',
        title: 'Hotel Check-in at Al Salam Desert Camp',
        description: 'Check in at Al Salam Desert Camp.',
        longDescription: 'Check in at Al Salam Desert Camp in Wahiba Sands. Settle into your desert accommodation and prepare for an evening of activities.',
        openingHours: 'Check-in 3:00 PM',
        tips: ['Dinner is included in your stay.', 'Prepare for star gazing later in the evening.'],
        photo: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=1000',
        type: 'hotel',
        date: '2025-12-27'
      },
      {
        id: '16',
        time: '16:00',
        location: 'Wahiba Sands',
        title: 'Camel Riding',
        description: 'Camel riding experience in the desert.',
        longDescription: 'Enjoy a traditional camel riding experience through the Wahiba Sands desert. Experience the gentle sway of the camel as you traverse the golden dunes.',
        openingHours: '4:00 PM - 6:00 PM',
        tips: ['Wear comfortable clothing.', 'Bring a hat and sunscreen.', 'Follow the guide\'s instructions for safety.'],
        photo: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1000&q=80&auto=format&fit=crop',
        type: 'activity',
        date: '2025-12-27'
      },
      {
        id: '17',
        time: '18:30',
        location: 'Al Salam Desert Camp, Wahiba Sands',
        title: 'Dinner',
        description: 'Dinner at Al Salam Desert Camp.',
        longDescription: 'Enjoy a traditional Omani dinner at the desert camp. Experience authentic local cuisine under the stars.',
        openingHours: '6:30 PM - 7:30 PM',
        tips: ['Dinner is included.', 'Try traditional Omani dishes.', 'Enjoy the desert camp atmosphere.'],
        photo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&q=80&auto=format&fit=crop',
        type: 'activity',
        date: '2025-12-27'
      },
      {
        id: '18',
        time: '20:00',
        location: 'Al Salam Desert Camp, Wahiba Sands',
        title: 'Star Gazing',
        description: 'Star gazing in the desert.',
        longDescription: 'Experience the clear desert skies with guided star gazing. The remote location of Wahiba Sands offers excellent visibility of the night sky. Duration: 8:00 PM - 11:00 PM.',
        openingHours: '8:00 PM - 11:00 PM',
        tips: ['Bring warm clothing as desert nights can be cold.', 'Binoculars or telescope recommended if available.', 'Perfect for photography enthusiasts.'],
        photo: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1000&q=80&auto=format&fit=crop',
        type: 'activity',
        date: '2025-12-27'
      }
    ]
  },
  {
    date: '2025-12-28',
    title: 'Wahiba Sands to Muscat',
    dailyTips: {
      weather: { 
        high: 27, 
        low: 10, 
        condition: 'Clear', 
        conditionIcon: getWeatherIcon('Clear'),
        reportUrl: googleWeatherUrl('Wahiba Sands, Oman')
      },
      bring: ['Swimming gear', 'Towel', 'Modest clothing for mass'],
      aware: 'Leave Wahiba Sands at 8am. Quick stops in Sur, Wadi Shab, and Bimmah Sinkhole. Arrive at Holy Spirit Church for mass at 7pm.'
    },
    items: [
      {
        id: '19',
        time: '08:00',
        location: 'Wahiba Sands',
        title: 'Leave Wahiba Sands',
        description: 'Depart from Wahiba Sands.',
        photo: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1000&q=80&auto=format&fit=crop',
        type: 'transport',
        date: '2025-12-28'
      },
      {
        id: '20',
        time: '10:00',
        location: 'Sur',
        title: 'Quick Stop in Sur',
        description: 'Quick stop in Sur.',
        photo: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1000&q=80&auto=format&fit=crop',
        type: 'activity',
        date: '2025-12-28'
      },
      {
        id: '21',
        time: '12:00',
        location: 'Wadi Shab',
        title: 'Wadi Shab',
        description: 'Visit Wadi Shab.',
        photo: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        type: 'activity',
        date: '2025-12-28'
      },
      {
        id: '22',
        time: '14:00',
        location: 'Bimmah Sinkhole',
        title: 'Quick Stop in Bimmah Sinkhole',
        description: 'Quick stop in Bimmah Sinkhole.',
        photo: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        type: 'activity',
        date: '2025-12-28'
      },
      {
        id: '23',
        time: '19:00',
        location: 'Holy Spirit Church',
        title: 'Mass',
        description: 'Arrive at Holy Spirit Church for mass at 7pm.',
        photo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1000&q=80&auto=format&fit=crop',
        type: 'mass',
        date: '2025-12-28'
      },
      {
        id: '24',
        time: '20:00',
        location: 'Mecure Muscat',
        title: 'Hotel Check-in',
        description: 'Check in at Mecure Muscat.',
        photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80&auto=format&fit=crop',
        type: 'hotel',
        date: '2025-12-28'
      }
    ]
  },
  {
    date: '2025-12-29',
    title: 'Muscat City Tour & Departure',
    dailyTips: {
      weather: { 
        high: 24, 
        low: 18, 
        condition: 'Humid', 
        conditionIcon: getWeatherIcon('Humid'),
        reportUrl: googleWeatherUrl('Muscat, Oman')
      },
      bring: ['Passport', 'Boarding pass', 'Packed luggage'],
      aware: 'Muscat City tour. Transfer to airport at 8:30pm. Flight QR1125 departs at 11pm.'
    },
    items: [
      {
        id: '26',
        time: '20:30',
        location: 'Muscat International Airport',
        title: 'Transfer to Airport',
        description: 'Transfer to airport at 8:30pm.',
        photo: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1000&q=80&auto=format&fit=crop',
        type: 'transport',
        date: '2025-12-29'
      },
      {
        id: '27',
        time: '23:00',
        location: 'Muscat International Airport',
        title: 'Flight QR1125',
        description: 'Flight QR1125 departure at 11pm.',
        photo: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        type: 'flight',
        date: '2025-12-29'
      }
    ]
  }
];

export const KNOWLEDGE_HUB = {
  uae: {
    places: [
      { 
        name: "Museum of the Future", 
        desc: "A architectural marvel showcasing futuristic tech.", 
        longDesc: "The exterior is covered in Arabic calligraphy. Inside, you explore a space station, a digital rainforest, and a library of life.",
        photo: "https://images.unsplash.com/photo-1647427017067-8f33ccbae493?q=80&w=1000",
        category: 'place',
        readMoreLinks: [
          { label: 'Official Website', url: 'https://www.museumofthefuture.ae/' },
          { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Museum_of_the_Future' }
        ]
      },
      { 
        name: "Burj Khalifa", 
        desc: "The world's tallest tower.", 
        longDesc: "Standing at 828 meters, the observation deck on level 148 offers the world's highest views.",
        photo: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=1000",
        category: 'place',
        readMoreLinks: [
          { label: 'Official Website', url: 'https://www.burjkhalifa.ae/' },
          { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Burj_Khalifa' }
        ]
      },
      { 
        name: "Sheikh Zayed Mosque", 
        desc: "A marble masterpiece in Abu Dhabi.", 
        longDesc: "Built with materials from all over the world, it combines Mamluk, Ottoman, and Fatimid styles.",
        photo: "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1000&q=80&auto=format&fit=crop",
        category: 'place',
        readMoreLinks: [
          { label: 'Official Website', url: 'https://www.szgmc.gov.ae/en' },
          { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Sheikh_Zayed_Grand_Mosque' }
        ]
      }
    ],
    foods: [
      { 
        name: "Al Machboos", 
        desc: "Spiced rice with meat.", 
        longDesc: "A traditional Emirati dish of spiced rice with meat (usually chicken or lamb), flavored with saffron, cardamom, and other spices.",
        photo: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: 'food',
        readMoreLinks: [
          { label: 'UAE Food Culture', url: 'https://www.visitdubai.com/en/articles/emirati-food-culture' }
        ]
      },
      { 
        name: "Camel Burger", 
        desc: "Lean local delicacy.", 
        longDesc: "A unique Emirati specialty, camel meat is lean and flavorful, often served as burgers in modern restaurants.",
        photo: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400", 
        category: 'food',
        readMoreLinks: [
          { label: 'Dubai Food Guide', url: 'https://www.visitdubai.com/en/articles/dubai-food-guide' }
        ]
      }
    ],
    culture: {
      basics: "The UAE is an Islamic country where tradition meets modernity.",
      etiquette: [
        "Dress modestly in public.",
        "Remove shoes before entering a home."
      ]
    }
  },
  oman: {
    places: [
      { 
        name: "Sultan Qaboos Mosque", 
        desc: "An architectural icon in Muscat.", 
        longDesc: "Featuring a massive chandelier and one of the largest carpets in the world.",
        photo: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: 'place',
        readMoreLinks: [
          { label: 'Oman Tourism Guide', url: 'https://www.omantourism.gov.om/wps/portal/mot/tourism/oman/home/experiences/culture/sultan-qaboos-grand-mosque' },
          { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Sultan_Qaboos_Grand_Mosque' }
        ]
      },
      { 
        name: "Nizwa Fort", 
        desc: "Oman's most visited monument.", 
        longDesc: "A 17th-century fortification with a unique circular tower.",
        photo: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: 'place',
        readMoreLinks: [
          { label: 'Oman Tourism Guide', url: 'https://www.omantourism.gov.om/wps/portal/mot/tourism/oman/home/experiences/culture/nizwa-fort' },
          { label: 'Wikipedia - Nizwa Fort', url: 'https://en.wikipedia.org/wiki/Nizwa_Fort' }
        ]
      }
    ],
    foods: [
      { 
        name: "Omani Shuwa", 
        desc: "Underground lamb.", 
        longDesc: "A traditional Omani dish where lamb is marinated with spices, wrapped in banana leaves, and slow-cooked in an underground sand oven for hours.",
        photo: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?q=80&w=400", 
        category: 'food',
        readMoreLinks: [
          { label: 'Omani Cuisine Guide', url: 'https://www.omantourism.gov.om/wps/portal/mot/tourism/oman/home/experiences/cuisine' }
        ]
      },
      { 
        name: "Kahwa", 
        desc: "Cardamom coffee.", 
        longDesc: "Traditional Omani coffee, lightly roasted and flavored with cardamom, often served with dates as a symbol of hospitality.",
        photo: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        category: 'food',
        readMoreLinks: [
          { label: 'Omani Coffee Culture', url: 'https://www.omantourism.gov.om/wps/portal/mot/tourism/oman/home/experiences/cuisine' }
        ]
      }
    ],
    culture: {
      basics: "Omanis are known for their exceptional hospitality.",
      etiquette: [
        "Always accept Omani coffee and dates.",
        "Asking for permission before photography is mandatory."
      ]
    }
  }
};
