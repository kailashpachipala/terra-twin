export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl: string;
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number]; // Center lat, lng
  polygon: [number, number][];   // LatLng array
  cropType: string;
  sizeHectares: number;
  healthScore: number;
  soilHealth: {
    status: 'Optimal' | 'Deficient' | 'Alert';
    n: number;
    p: number;
    k: number;
    ph: number;
    organicMatter: number;
  };
  moistureStress: number; // Percentage
  growthStage: {
    current: string;
    progress: number; // 0-100
    daysToHarvest: number;
  };
  yieldProjection: {
    value: number; // tons per acre
    confidence: number; // percentage
  };
  risks: {
    disease: 'Low' | 'Moderate' | 'High';
    diseaseDetail: string;
    pest: 'Low' | 'Moderate' | 'High';
    pestDetail: string;
  };
  irrigation: {
    status: 'Active' | 'Inactive';
    cycleRemaining: string; // HH:MM:SS
    progress: number; // 0-100
    waterRequirementLiters: number;
    advisory: string;
  };
  management_plots?: {
    id: number;
    plot_uuid: string;
    polygon: [number, number][];
    coordinates: [number, number];
    area_sqm: number;
    cents: number;
    ndvi: number;
    ndwi: number;
    moisture: number;
    lst_f: number;
    temperature_f: number;
    soil_ph: number;
  }[];
}

export interface ChartDataPoint {
  date: string;
  ndvi: number;
  ndwi: number;
  evi: number;
  moisture: number;
  rainfall: number;
  temperature: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  time: string;
  read: boolean;
}

export const MOCK_USER: User = {
  id: "user-101",
  email: "farmer.services@terratwin.in",
  fullName: "Dr. Elena Rodriguez",
  role: "Lead Research Scientist",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVDKeLBc1AqzvJufGuPW-u3Vx9Ie04X-sAqrL3VDqJTYe1kjphoh7ePpFbpn1hygSLqYctfOIsN8ZlNTaxua1YOycVlT5P9-sGt2lL_dTZPv886J3ZxlRUoHjai-4nzHeSeFHCKzQfpkAuHE9FY4c5BJ8ruIElZj35Tn4S8SLdSJEkZ7tlTAWBIaY8IC8enPBRI4PaNZpzrQifzzpwU9Wza4I8Q_1LlgWrORidQdzZ6UDQaS7yBsoz"
};

export const MOCK_FARMS: Farm[] = [
  {
    id: "farm-1",
    name: "GITAM Research Crop Twin",
    location: "Visakhapatnam, Andhra Pradesh, India",
    coordinates: [17.7816, 83.3768],
    polygon: [
      [17.7836, 83.3748],
      [17.7836, 83.3788],
      [17.7796, 83.3788],
      [17.7796, 83.3748],
      [17.7836, 83.3748]
    ],
    cropType: "Wine Grapes",
    sizeHectares: 1.6,
    healthScore: 85,
    soilHealth: {
      status: "Optimal",
      n: 38,
      p: 16,
      k: 22,
      ph: 6.4,
      organicMatter: 2.8
    },
    moistureStress: 18,
    growthStage: {
      current: "Flowering",
      progress: 60,
      daysToHarvest: 45
    },
    yieldProjection: {
      value: 3.2,
      confidence: 88
    },
    risks: {
      disease: "Low",
      diseaseDetail: "Powdery mildew risk low due to coastal sea breeze",
      pest: "Low",
      pestDetail: "Trap counts below action thresholds"
    },
    irrigation: {
      status: "Active",
      cycleRemaining: "01:15:00",
      progress: 45,
      waterRequirementLiters: 18000,
      advisory: "Execute secondary drip loop for GITAM plots A1-A6."
    },
    management_plots: [
      {
        id: 1001,
        plot_uuid: "Plot-01",
        polygon: [
          [17.7836, 83.3748],
          [17.7836, 83.3768],
          [17.7816, 83.3768],
          [17.7816, 83.3748],
          [17.7836, 83.3748]
        ],
        coordinates: [17.7826, 83.3758],
        area_sqm: 4000.0,
        cents: 9.8,
        ndvi: 0.82,
        ndwi: 0.35,
        moisture: 78.5,
        lst_f: 81.2,
        temperature_f: 78.5,
        soil_ph: 6.4
      },
      {
        id: 1002,
        plot_uuid: "Plot-02",
        polygon: [
          [17.7836, 83.3768],
          [17.7836, 83.3788],
          [17.7816, 83.3788],
          [17.7816, 83.3768],
          [17.7836, 83.3768]
        ],
        coordinates: [17.7826, 83.3778],
        area_sqm: 4000.0,
        cents: 9.8,
        ndvi: 0.78,
        ndwi: 0.33,
        moisture: 72.0,
        lst_f: 82.5,
        temperature_f: 78.5,
        soil_ph: 6.4
      }
    ]
  },
  {
    id: "farm-2",
    name: "Guntur Chilli Plantation",
    location: "Guntur, Andhra Pradesh, India",
    coordinates: [16.3067, 80.4365],
    polygon: [
      [16.3087, 80.4345],
      [16.3087, 80.4385],
      [16.3047, 80.4385],
      [16.3047, 80.4345],
      [16.3087, 80.4345]
    ],
    cropType: "Guntur Sannam Chilli",
    sizeHectares: 1.6,
    healthScore: 78,
    soilHealth: {
      status: "Deficient",
      n: 22,
      p: 12,
      k: 30,
      ph: 7.2,
      organicMatter: 1.9
    },
    moistureStress: 35,
    growthStage: {
      current: "Fruiting",
      progress: 80,
      daysToHarvest: 28
    },
    yieldProjection: {
      value: 1.8,
      confidence: 84
    },
    risks: {
      disease: "Moderate",
      diseaseDetail: "Cercospora leaf spot risk heightened due to recent humidity",
      pest: "Moderate",
      pestDetail: "Thrips traps monitoring required in southern plots"
    },
    irrigation: {
      status: "Inactive",
      cycleRemaining: "00:00:00",
      progress: 0,
      waterRequirementLiters: 22000,
      advisory: "Apply 22,000 liters tomorrow morning to maintain fruit moisture levels."
    },
    management_plots: [
      {
        id: 2001,
        plot_uuid: "Plot-01",
        polygon: [
          [16.3087, 80.4345],
          [16.3087, 80.4365],
          [16.3067, 80.4365],
          [16.3067, 80.4345],
          [16.3087, 80.4345]
        ],
        coordinates: [16.3077, 80.4355],
        area_sqm: 4000.0,
        cents: 9.8,
        ndvi: 0.76,
        ndwi: 0.30,
        moisture: 64,
        lst_f: 83.8,
        temperature_f: 80.5,
        soil_ph: 7.2
      },
      {
        id: 2002,
        plot_uuid: "Plot-02",
        polygon: [
          [16.3087, 80.4365],
          [16.3087, 80.4385],
          [16.3067, 80.4385],
          [16.3067, 80.4365],
          [16.3087, 80.4365]
        ],
        coordinates: [16.3077, 80.4375],
        area_sqm: 4000.0,
        cents: 9.8,
        ndvi: 0.74,
        ndwi: 0.28,
        moisture: 61,
        lst_f: 84.5,
        temperature_f: 80.5,
        soil_ph: 7.2
      },
      {
        id: 2003,
        plot_uuid: "Plot-03",
        polygon: [
          [16.3067, 80.4365],
          [16.3067, 80.4385],
          [16.3047, 80.4385],
          [16.3047, 80.4365],
          [16.3067, 80.4365]
        ],
        coordinates: [16.3057, 80.4375],
        area_sqm: 4000.0,
        cents: 9.8,
        ndvi: 0.80,
        ndwi: 0.33,
        moisture: 70,
        lst_f: 83.1,
        temperature_f: 80.5,
        soil_ph: 7.1
      },
      {
        id: 2004,
        plot_uuid: "Plot-04",
        polygon: [
          [16.3067, 80.4345],
          [16.3067, 80.4365],
          [16.3047, 80.4365],
          [16.3047, 80.4345],
          [16.3067, 80.4345]
        ],
        coordinates: [16.3057, 80.4355],
        area_sqm: 4000.0,
        cents: 9.8,
        ndvi: 0.75,
        ndwi: 0.29,
        moisture: 63,
        lst_f: 84.0,
        temperature_f: 80.5,
        soil_ph: 7.2
      }
    ]
  }
];

export const generateHistoricalData = (farmId: string): ChartDataPoint[] => {
  const baseHealth = farmId === "farm-1" ? 0.85 : 0.78;
  const data: ChartDataPoint[] = [];
  const days = 30;
  
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    
    const dayFactor = (days - i) / days;
    const variation = Math.sin(dayFactor * Math.PI * 2) * 0.04;
    const ndvi = Math.min(0.98, Math.max(0.1, baseHealth * 0.85 + variation + (dayFactor * 0.1)));
    const ndwi = Math.min(0.85, Math.max(0.05, 0.35 + Math.cos(dayFactor * Math.PI) * 0.08));
    const evi = Math.min(0.9, Math.max(0.08, ndvi * 0.88 - 0.04));
    const moisture = Math.min(100, Math.max(5, 55 - (i * 0.7) + (farmId === "farm-2" ? -5 : 10)));
    
    data.push({
      date: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      ndvi: parseFloat(ndvi.toFixed(2)),
      ndwi: parseFloat(ndwi.toFixed(2)),
      evi: parseFloat(evi.toFixed(2)),
      moisture: Math.round(moisture),
      rainfall: i % 6 === 0 ? Math.round(Math.random() * 12) : 0,
      temperature: Math.round(78 + Math.sin(dayFactor * Math.PI) * 8 + Math.random() * 3)
    });
  }
  return data;
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    title: "Chilli Crop Moisture Alert",
    message: "Guntur Plots show moisture stress approaching 35%. Secondary sprinkler loop active advised.",
    type: "warning",
    time: "2 hours ago",
    read: false
  },
  {
    id: "notif-2",
    title: "Pathogen Risk Forecast",
    message: "High relative humidity levels forecast over Visakhapatnam increases Cercospora risk for grapes.",
    type: "warning",
    time: "6 hours ago",
    read: false
  },
  {
    id: "notif-3",
    title: "Sentinel-2 Imagery Compiled",
    message: "New cloud-masked multi-spectral composite generated for GITAM Research Crop Twin.",
    type: "success",
    time: "Yesterday",
    read: true
  }
];

export const getAIResponse = (query: string, farm: Farm): string => {
  const q = query.toLowerCase();
  
  if (q.includes("health") || q.includes("ndvi") || q.includes("vegetation")) {
    return `Based on our digital twin analysis for ${farm.name}, the average NDVI is currently ${(farm.healthScore / 100).toFixed(2)} (${farm.healthScore}% health index). Vegetation density is strong in the northern sections, but we detect a minor slowdown in growth in the southern pockets where soil clay density is higher. Recommended action: apply nitrogen-rich fertilizers to sub-plots B3 and B4.`;
  }
  
  if (q.includes("water") || q.includes("irrigation") || q.includes("moisture") || q.includes("stress")) {
    return `The current moisture stress is at ${farm.moistureStress}%. For ${farm.cropType}, our XGBoost hydrology model estimates a water requirement of ${farm.irrigation.waterRequirementLiters.toLocaleString()} liters. ${farm.irrigation.status === 'Active' ? `An irrigation cycle is active with ${farm.irrigation.cycleRemaining} remaining.` : `No active cycle. We advise triggering a drip cycle tomorrow morning at 05:00 AM to minimize evapotranspiration losses.`}`;
  }
  
  if (q.includes("disease") || q.includes("pest") || q.includes("risk")) {
    return `Disease risk is ${farm.risks.disease} (${farm.risks.diseaseDetail}) and Pest risk is ${farm.risks.pest} (${farm.risks.pestDetail}). The climate model registers local humidity of 24% and temperature of 84°F. If humidity exceeds 45% in the next 48 hours, brown rot risk will surge. Keep crop leaves clear.`;
  }
  
  if (q.includes("yield") || q.includes("production") || q.includes("harvest")) {
    return `Our regression model projects a harvest yield of ${farm.yieldProjection.value} tons per acre with a confidence level of ${farm.yieldProjection.confidence}%. Based on the growth stage (${farm.growthStage.current}, ${farm.growthStage.progress}% complete), harvest window is estimated in ${farm.growthStage.daysToHarvest} days (approx. Late August).`;
  }

  if (q.includes("soil") || q.includes("nutrients") || q.includes("npk")) {
    return `Soil report for ${farm.name}: Nitrogen (N): ${farm.soilHealth.n} ppm (Target: 40-50), Phosphorus (P): ${farm.soilHealth.p} ppm (Target: 15-20), Potassium (K): ${farm.soilHealth.k} ppm (Target: 20-30). Soil ph is ${farm.soilHealth.ph} (optimal is 6.5). Organic matter content is at ${farm.soilHealth.organicMatter}%, which is healthy.`;
  }

  return `Hello! I am your TerraTwin AI Precision Agriculture Assistant. I can analyze soil chemistry, predict crop yield, schedule irrigation, or evaluate plant health stress for ${farm.name}. What would you like to focus on today?`;
};
