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
    "Utsav Studio, Shop No 7, Building B-4, Swaminarayan Road, Sector 10, Shanti Nagar, Mira Road East, Mira Bhayandar, Maharashtra 401107",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Utsav%20Studio%20Shanti%20Nagar%20Mira%20Road%20East%20Maharashtra%20401107",
};

export const galleryItems = [
  { src: media.wedding, title: "Sacred Vows", category: "Wedding" },
  { src: media.prewedding, title: "Golden Hour Romance", category: "Pre-Wedding" },
  { src: media.maternity, title: "Waiting in Wonder", category: "Portraits" },
  { src: media.kids, title: "Little Joys", category: "Portraits" },
  { src: media.birthday, title: "Candlelight Wishes", category: "Portraits" },
  { src: media.cinema, title: "Frame by Frame", category: "Films" },
  { src: media.family, title: "Generations", category: "Portraits" },
];

export const serviceGroups = [
  {
    no: "01",
    title: "Weddings & Events",
    image: media.wedding,
    blurb: "Every ritual, every tear, every laugh — documented without missing a beat.",
    items: ["Candid photography", "Traditional photography", "Cinematic wedding films", "Pre-wedding shoots"],
  },
  {
    no: "02",
    title: "Portraits & Family",
    image: media.maternity,
    blurb: "Gentle, patient sessions that let real personalities step into the light.",
    items: ["Maternity shoots", "Baby & kids photography", "Family portraits", "Birthday photography"],
  },
  {
    no: "03",
    title: "Cinematic Films",
    image: media.cinema,
    blurb: "Wedding stories cut like short films — sound, light and emotion in motion.",
    items: ["Wedding highlight films", "Teaser & trailer edits", "Drone coverage", "Event films"],
  },
  {
    no: "04",
    title: "Keepsakes & Finishing",
    image: media.family,
    blurb: "From memory to heirloom — finished pieces you hold in your hands.",
    items: ["Photo editing & retouching", "Custom photo frames", "Album design & printing"],
  },
];

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;
