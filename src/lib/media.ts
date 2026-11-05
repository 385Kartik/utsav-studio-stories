import hero from "@/assets/hero.jpg";
import wedding from "@/assets/gallery-wedding.jpg";
import prewedding from "@/assets/gallery-prewedding.jpg";
import maternity from "@/assets/gallery-maternity.jpg";
import kids from "@/assets/gallery-kids.jpg";
import birthday from "@/assets/gallery-birthday.jpg";
import cinema from "@/assets/gallery-cinema.jpg";
import family from "@/assets/gallery-family.jpg";

export const media = { hero, wedding, prewedding, maternity, kids, birthday, cinema, family };

export const contact = {
  phoneDisplay: "+91 98193 91538",
  phoneHref: "tel:+919819391538",
  whatsapp: "https://wa.me/919819391538",
  addressLines: [
    "Shop No. 7, Building No. B-4, Swaminarayan Road,",
    "Sector 10, Shanti Nagar, Mira Road East,",
    "Mira Bhayandar, Maharashtra 401107",
  ],
  mapsQuery:
    "Devoraaa Studio, Shop No 7, Building B-4, Swaminarayan Road, Sector 10, Shanti Nagar, Mira Road East, Mira Bhayandar, Maharashtra 401107",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Devoraaa%20Studio%20Shanti%20Nagar%20Mira%20Road%20East%20Maharashtra%20401107",
};

export interface GalleryItem {
  src: string;
  title: string;
  category: "Wedding" | "Pre-Wedding" | "Portraits" | "Films";
  subtitle?: string;
  year?: string;
}

export const galleryItems: GalleryItem[] = [
  // Weddings
  { src: media.wedding, title: "Sacred Vows", category: "Wedding", subtitle: "Mandap rituals & candid moments", year: "2025" },
  { src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80", title: "Royal Vermilion", category: "Wedding", subtitle: "Bridal portraiture in traditional attire", year: "2025" },
  { src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1000&q=80", title: "The Seven Steps", category: "Wedding", subtitle: "Pheras around the sacred fire", year: "2025" },
  { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80", title: "Eternal Embrace", category: "Wedding", subtitle: "Golden sunset couple session", year: "2024" },
  { src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80", title: "Floral Shower", category: "Wedding", subtitle: "Jaimala celebrations", year: "2024" },
  { src: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1000&q=80", title: "Haldi Sunburst", category: "Wedding", subtitle: "Joyous laughter & yellow hues", year: "2025" },
  { src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80", title: "Velvet Nights", category: "Wedding", subtitle: "Grand reception entrance", year: "2024" },
  { src: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=1000&q=80", title: "Henna Whispers", category: "Wedding", subtitle: "Intricate Mehendi details", year: "2024" },

  // Pre-Wedding
  { src: media.prewedding, title: "Golden Hour Romance", category: "Pre-Wedding", subtitle: "Candid shoreline breeze", year: "2025" },
  { src: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1000&q=80", title: "Mist & Mountains", category: "Pre-Wedding", subtitle: "Serene destination session", year: "2024" },
  { src: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1000&q=80", title: "Vintage Promenade", category: "Pre-Wedding", subtitle: "Old world colonial charm", year: "2025" },
  { src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1000&q=80", title: "Under the Banyan", category: "Pre-Wedding", subtitle: "Quiet whispers under dusk canopy", year: "2024" },
  { src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80", title: "Ocean Song", category: "Pre-Wedding", subtitle: "Waves at dusk in Alibaug", year: "2025" },
  { src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80", title: "Lantern Path", category: "Pre-Wedding", subtitle: "Fairy light evening walk", year: "2024" },

  // Portraits (Maternity, Kids, Birthday, Family)
  { src: media.maternity, title: "Waiting in Wonder", category: "Portraits", subtitle: "Maternity silhouette in soft dawn", year: "2025" },
  { src: media.kids, title: "Little Joys", category: "Portraits", subtitle: "First laughter & baby giggles", year: "2024" },
  { src: media.birthday, title: "Candlelight Wishes", category: "Portraits", subtitle: "First birthday celebration", year: "2025" },
  { src: media.family, title: "Generations", category: "Portraits", subtitle: "Three generations under one frame", year: "2024" },
  { src: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=1000&q=80", title: "Slumber Soft", category: "Portraits", subtitle: "Newborn quiet dreaming", year: "2025" },
  { src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80", title: "Grace in Amber", category: "Portraits", subtitle: "Editorial studio headshot", year: "2024" },
  { src: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80", title: "The Mother's Glow", category: "Portraits", subtitle: "Botanical maternity portrait", year: "2025" },
  { src: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1000&q=80", title: "Curious Eyes", category: "Portraits", subtitle: "Playful toddler candid", year: "2024" },
  { src: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1000&q=80", title: "Legacy of Smiles", category: "Portraits", subtitle: "Grandparents silver anniversary", year: "2024" },

  // Films
  { src: media.cinema, title: "Frame by Frame", category: "Films", subtitle: "35mm anamorphic wedding reel", year: "2025" },
  { src: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?auto=format&fit=crop&w=1000&q=80", title: "The Departure", category: "Films", subtitle: "Cinematic emotional Vidaai still", year: "2024" },
  { src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1000&q=80", title: "Cinema Scope", category: "Films", subtitle: "Documentary slow motion teaser", year: "2025" },
  { src: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1000&q=80", title: "Night Fireflies", category: "Films", subtitle: "Sangeet celebration lighting", year: "2024" },
  { src: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80", title: "Royal Procession", category: "Films", subtitle: "Baraat aerial drone cinematic", year: "2025" },
  { src: "https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=1000&q=80", title: "The Quiet Room", category: "Films", subtitle: "Intimate bridal preparation", year: "2024" },
];

/* 36 Curated photos for the "Selected Work" home page gallery with fading bg text */
export const selectedWorkItems: GalleryItem[] = [
  { src: media.wedding, title: "Sacred Vows", category: "Wedding", subtitle: "Mira Road Mandap", year: "2025" },
  { src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80", title: "Royal Crimson", category: "Wedding", subtitle: "Traditional Bride", year: "2025" },
  { src: media.prewedding, title: "Golden Shoreline", category: "Pre-Wedding", subtitle: "Coastal Sunset", year: "2024" },
  { src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80", title: "Jaimala Shower", category: "Wedding", subtitle: "Rose Petals", year: "2025" },
  { src: media.maternity, title: "Waiting in Wonder", category: "Portraits", subtitle: "Maternity Light", year: "2025" },
  { src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=80", title: "Sacred Fire", category: "Wedding", subtitle: "Pheras Ceremony", year: "2024" },
  { src: media.kids, title: "First Giggles", category: "Portraits", subtitle: "Baby Joy", year: "2025" },
  { src: media.cinema, title: "35MM Anamorphic", category: "Films", subtitle: "Cinematic Still", year: "2025" },
  { src: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=900&q=80", title: "Haldi Celebration", category: "Wedding", subtitle: "Turmeric Rituals", year: "2024" },
  { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80", title: "Dusk Silhouette", category: "Pre-Wedding", subtitle: "Horizon Love", year: "2025" },
  { src: media.birthday, title: "Candle Wishes", category: "Portraits", subtitle: "First Birthday", year: "2024" },
  { src: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=900&q=80", title: "Mehendi Heirlooms", category: "Wedding", subtitle: "Bridal Henna", year: "2025" },
  { src: media.family, title: "Three Generations", category: "Portraits", subtitle: "Family Legacy", year: "2024" },
  { src: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=900&q=80", title: "Newborn Peace", category: "Portraits", subtitle: "Ten Days Earthside", year: "2025" },
  { src: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?auto=format&fit=crop&w=900&q=80", title: "Vidaai Stills", category: "Films", subtitle: "Tearful Goodbye", year: "2024" },
  { src: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=80", title: "Alpine Breeze", category: "Pre-Wedding", subtitle: "Destination Shoot", year: "2025" },
  { src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80", title: "Reception Glamour", category: "Wedding", subtitle: "Evening Gala", year: "2024" },
  { src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80", title: "Studio Light", category: "Portraits", subtitle: "Fine Art Portrait", year: "2025" },
  { src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80", title: "Reel Motion", category: "Films", subtitle: "Color Grade & Grain", year: "2024" },
  { src: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=900&q=80", title: "Heritage Palace", category: "Pre-Wedding", subtitle: "Royal Architecture", year: "2025" },
  { src: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=900&q=80", title: "Maternal Aura", category: "Portraits", subtitle: "Expecting Wonder", year: "2024" },
  { src: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80", title: "Baraat Procession", category: "Films", subtitle: "Drone Perspective", year: "2025" },
  { src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=900&q=80", title: "Twilight Garden", category: "Pre-Wedding", subtitle: "Evening Lanterns", year: "2024" },
  { src: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=900&q=80", title: "Silver Wisdom", category: "Portraits", subtitle: "Grandmother's Grace", year: "2025" },
  { src: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=900&q=80", title: "Sangeet Sparklers", category: "Films", subtitle: "Midnight Rhythms", year: "2024" },
  { src: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=900&q=80", title: "Little Explorer", category: "Portraits", subtitle: "Field of Daisies", year: "2025" },
  { src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80", title: "Seaside Promise", category: "Pre-Wedding", subtitle: "Tides & Footprints", year: "2024" },
  { src: "https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=900&q=80", title: "Bridal Veil", category: "Films", subtitle: "Preparations & Anticipation", year: "2025" },
  { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80", title: "Classic Monolith", category: "Portraits", subtitle: "Dramatic Monochrome", year: "2024" },
  { src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80", title: "Illuminated Walk", category: "Pre-Wedding", subtitle: "Candlelit Pathway", year: "2025" },
  { src: "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=900&q=80", title: "Festive Joy", category: "Portraits", subtitle: "Diwali Family Radiance", year: "2024" },
  { src: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=900&q=80", title: "Rain Kissed", category: "Pre-Wedding", subtitle: "Monsoon Romance", year: "2025" },
  { src: "https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=900&q=80", title: "Grand Ballroom", category: "Wedding", subtitle: "First Dance", year: "2024" },
  { src: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=900&q=80", title: "Baby steps", category: "Portraits", subtitle: "Sunny Afternoon", year: "2025" },
  { src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80", title: "Golden Spark", category: "Films", subtitle: "Celebration Fireworks", year: "2024" },
  { src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80", title: "Eternal Knot", category: "Wedding", subtitle: "Together Forever", year: "2025" },
];

export interface ServiceItemMapping {
  label: string;
  category: "Wedding" | "Pre-Wedding" | "Portraits" | "Films";
}

export interface ServiceGroup {
  no: string;
  title: string;
  category: "Wedding" | "Portraits" | "Films" | "Pre-Wedding";
  image: string;
  blurb: string;
  items: ServiceItemMapping[];
}

export const serviceGroups: ServiceGroup[] = [
  {
    no: "01",
    title: "Weddings & Events",
    category: "Wedding",
    image: media.wedding,
    blurb: "Every ritual, every tear, every laugh — documented without missing a beat.",
    items: [
      { label: "Candid photography", category: "Wedding" },
      { label: "Traditional photography", category: "Wedding" },
      { label: "Cinematic wedding films", category: "Films" },
      { label: "Pre-wedding shoots", category: "Pre-Wedding" },
    ],
  },
  {
    no: "02",
    title: "Portraits & Family",
    category: "Portraits",
    image: media.maternity,
    blurb: "Gentle, patient sessions that let real personalities step into the light.",
    items: [
      { label: "Maternity shoots", category: "Portraits" },
      { label: "Baby & kids photography", category: "Portraits" },
      { label: "Family portraits", category: "Portraits" },
      { label: "Birthday photography", category: "Portraits" },
    ],
  },
  {
    no: "03",
    title: "Cinematic Films",
    category: "Films",
    image: media.cinema,
    blurb: "Wedding stories cut like short films — sound, light and emotion in motion.",
    items: [
      { label: "Wedding highlight films", category: "Films" },
      { label: "Teaser & trailer edits", category: "Films" },
      { label: "Drone coverage", category: "Films" },
      { label: "Event films", category: "Films" },
    ],
  },
  {
    no: "04",
    title: "Keepsakes & Finishing",
    category: "Portraits",
    image: media.family,
    blurb: "From memory to heirloom — finished pieces you hold in your hands.",
    items: [
      { label: "Photo editing & retouching", category: "Portraits" },
      { label: "Custom photo frames", category: "Wedding" },
      { label: "Album design & printing", category: "Wedding" },
    ],
  },
];

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;
