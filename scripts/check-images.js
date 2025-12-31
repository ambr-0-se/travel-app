#!/usr/bin/env node

const targets = [
  {
    name: 'Dec 21 / Mass',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Dec 24 / Flight WY610',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Dec 25 / Mass',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Dec 26 / Drive to Nizwa',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Dec 26 / Hotel Greenview',
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Dec 27 / Hiking',
    url: 'https://images.unsplash.com/photo-1496483353456-90997957cf99?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Dec 27 / Camel Riding',
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Dec 27 / Dinner Camp',
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Dec 27 / Star Gazing',
    url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Dec 28 / Wadi Shab',
    url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Dec 28 / Bimmah Sinkhole',
    url: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Dec 29 / City Tour',
    url: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'UAE / Sheikh Zayed Mosque',
    url: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'UAE / Al Machboos',
    url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Oman / Kahwa',
    url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Oman / Sultan Qaboos Mosque',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Oman / Nizwa Fort',
    url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  }
];

const { env } = globalThis;

const testImage = async ({ name, url }) => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const success = res.ok && res.headers.get('content-type')?.startsWith('image/');
    console.log(`${success ? '✅' : '❌'} ${name} → ${res.status} ${res.statusText} (${url})`);
  } catch (error) {
    console.log(`❌ ${name} → fetch failed: ${error.message}`);
  }
};

const main = async () => {
  console.log('Checking image availability:\n');
  for (const target of targets) {
    await testImage(target);
  }
};

main().catch((error) => {
  console.error('Image check failed', error);
  process.exit(1);
});

