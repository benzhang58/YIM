import { Gym } from "../types";

export const gyms: Gym[] = [
  {
    id: "iron-hub",
    name: "Iron Hub Athletics",
    city: "San Francisco",
    neighborhood: "Mission Bay",
    address: "290 Channel St",
    distanceMiles: 1.3,
    isOpen: true,
    rating: 4.8,
    liveBusyness: 62,
    crowdReports: 28,
    coordinates: {
      latitude: 37.7705,
      longitude: -122.3875
    },
    bestWindow: "1:30 PM to 4:00 PM",
    highlights: ["Strong squat rack setup", "Clean locker rooms", "Plenty of plates", "Fast Wi-Fi"],
    latestCheckIns: [
      { label: "Bench area moving fast", tone: "mid" },
      { label: "No line for squat racks", tone: "calm" },
      { label: "Cardio floor picking up", tone: "mid" }
    ],
    liveTrend: [
      { label: "Now", value: 62 },
      { label: "+1h", value: 68 },
      { label: "+2h", value: 75 },
      { label: "+3h", value: 58 },
      { label: "+4h", value: 47 }
    ],
    weekTrend: [
      { label: "Mon", value: 82 },
      { label: "Tue", value: 71 },
      { label: "Wed", value: 77 },
      { label: "Thu", value: 74 },
      { label: "Fri", value: 69 },
      { label: "Sat", value: 56 },
      { label: "Sun", value: 42 }
    ],
    monthTrend: [
      { label: "W1", value: 63 },
      { label: "W2", value: 72 },
      { label: "W3", value: 79 },
      { label: "W4", value: 58 }
    ],
    reviews: [
      {
        author: "Maya",
        score: 4.9,
        body: "Best part is the crowd reporting actually matches reality. Usually busy after work, but lunch sessions are perfect."
      },
      {
        author: "Jordan",
        score: 4.7,
        body: "Machines are well maintained and the app helps avoid the after-office rush."
      }
    ]
  },
  {
    id: "lift-lab",
    name: "Lift Lab Social Club",
    city: "San Francisco",
    neighborhood: "SoMa",
    address: "201 Townsend St",
    distanceMiles: 2.1,
    isOpen: true,
    rating: 4.6,
    liveBusyness: 81,
    crowdReports: 41,
    coordinates: {
      latitude: 37.7796,
      longitude: -122.3948
    },
    bestWindow: "5:45 AM to 7:00 AM",
    highlights: ["Huge dumbbell range", "Solid classes", "Good music", "Popular with lifters"],
    latestCheckIns: [
      { label: "Leg press line forming", tone: "warn" },
      { label: "Studios are packed", tone: "warn" },
      { label: "Stretch area has room", tone: "calm" }
    ],
    liveTrend: [
      { label: "Now", value: 81 },
      { label: "+1h", value: 88 },
      { label: "+2h", value: 77 },
      { label: "+3h", value: 60 },
      { label: "+4h", value: 49 }
    ],
    weekTrend: [
      { label: "Mon", value: 91 },
      { label: "Tue", value: 86 },
      { label: "Wed", value: 84 },
      { label: "Thu", value: 89 },
      { label: "Fri", value: 76 },
      { label: "Sat", value: 68 },
      { label: "Sun", value: 52 }
    ],
    monthTrend: [
      { label: "W1", value: 78 },
      { label: "W2", value: 81 },
      { label: "W3", value: 74 },
      { label: "W4", value: 69 }
    ],
    reviews: [
      {
        author: "Chris",
        score: 4.5,
        body: "Amazing equipment, but definitely one of the busiest gyms in the area. The app estimate is useful."
      },
      {
        author: "Nia",
        score: 4.6,
        body: "If you go before 7 AM it is great. Evening cable stations are a battle."
      }
    ]
  },
  {
    id: "harbor-fitness",
    name: "Harbor Fitness House",
    city: "San Francisco",
    neighborhood: "Sunset",
    address: "1435 Noriega St",
    distanceMiles: 3.4,
    isOpen: false,
    rating: 4.9,
    liveBusyness: 29,
    crowdReports: 11,
    coordinates: {
      latitude: 37.7544,
      longitude: -122.4812
    },
    bestWindow: "9:30 AM to 11:30 AM",
    highlights: ["Never feels chaotic", "Great coaching", "Good parking", "Strong recovery area"],
    latestCheckIns: [
      { label: "Closed for the night", tone: "calm" },
      { label: "Mornings stay smooth", tone: "calm" },
      { label: "Free weights spread out", tone: "calm" }
    ],
    liveTrend: [
      { label: "Now", value: 29 },
      { label: "+1h", value: 18 },
      { label: "+2h", value: 14 },
      { label: "+3h", value: 32 },
      { label: "+4h", value: 48 }
    ],
    weekTrend: [
      { label: "Mon", value: 55 },
      { label: "Tue", value: 52 },
      { label: "Wed", value: 50 },
      { label: "Thu", value: 59 },
      { label: "Fri", value: 45 },
      { label: "Sat", value: 36 },
      { label: "Sun", value: 31 }
    ],
    monthTrend: [
      { label: "W1", value: 44 },
      { label: "W2", value: 49 },
      { label: "W3", value: 46 },
      { label: "W4", value: 41 }
    ],
    reviews: [
      {
        author: "Elena",
        score: 5,
        body: "This is the easiest gym to plan around. Busyness reports are consistently accurate and the staff is excellent."
      },
      {
        author: "Sam",
        score: 4.8,
        body: "A bit farther out, but worth it if you want a calmer experience and better machine availability."
      }
    ]
  }
];
