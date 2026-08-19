import "dotenv/config";
import { PrismaClient, PropertyType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const hosts: Array<{
  slug: string;
  name: string;
  image?: string;
  bio: string;
  education?: string;
  work?: string;
  isSuperhost: boolean;
  yearsHosting: number;
  responseRatePercent: number;
  ratingAverage: number;
  reviewCount: number;
}> = [
  {
    slug: "mariana",
    name: "Mariana",
    bio: "Born and raised in Alfama. I restored this loft myself and love pointing guests toward the miradouros only locals know about.",
    education: "University of Lisbon",
    work: "Interior designer",
    isSuperhost: true,
    yearsHosting: 6,
    responseRatePercent: 99,
    ratingAverage: 4.86,
    reviewCount: 214,
  },
  {
    slug: "hotel-ribeira",
    name: "Hotel Ribeira",
    bio: "A family-run boutique hotel on Praça do Comércio, three generations in the hospitality business.",
    isSuperhost: true,
    yearsHosting: 9,
    responseRatePercent: 97,
    ratingAverage: 4.72,
    reviewCount: 98,
  },
  {
    slug: "takeshi",
    name: "Takeshi",
    bio: "I grew up two streets over from this machiya and spent five years restoring it board by board. Happy to share the best quiet corners of Higashiyama.",
    education: "Kyoto Institute of Technology",
    work: "Woodworker",
    isSuperhost: true,
    yearsHosting: 8,
    responseRatePercent: 100,
    ratingAverage: 4.94,
    reviewCount: 176,
  },
  {
    slug: "elena",
    name: "Elena",
    bio: "Third-generation Santorini local. My family has owned this cliffside plot since the 1960s.",
    work: "Architect",
    isSuperhost: true,
    yearsHosting: 11,
    responseRatePercent: 98,
    ratingAverage: 4.97,
    reviewCount: 312,
  },
  {
    slug: "connor",
    name: "Connor",
    bio: "Mountain guide turned host. I still lead trail runs most mornings if guests want company.",
    work: "Mountain guide",
    isSuperhost: true,
    yearsHosting: 5,
    responseRatePercent: 96,
    ratingAverage: 4.89,
    reviewCount: 143,
  },
  {
    slug: "youssef",
    name: "Youssef",
    bio: "As citizens of Marrakech we'd be more than happy to point you toward the best souks, hammams, and rooftop views the medina has to offer.",
    work: "Textile trader",
    isSuperhost: true,
    yearsHosting: 7,
    responseRatePercent: 99,
    ratingAverage: 4.91,
    reviewCount: 261,
  },
  {
    slug: "chris",
    name: "Chris",
    bio: "Midtown native, happy to help with restaurant reservations and Broadway tickets.",
    work: "Product manager",
    isSuperhost: false,
    yearsHosting: 3,
    responseRatePercent: 92,
    ratingAverage: 4.68,
    reviewCount: 87,
  },
  {
    slug: "wayan",
    name: "Wayan",
    bio: "Our family has farmed these rice terraces for generations. The resort was built to share that view with travelers.",
    work: "Resort manager",
    isSuperhost: true,
    yearsHosting: 10,
    responseRatePercent: 99,
    ratingAverage: 4.95,
    reviewCount: 402,
  },
  {
    slug: "casa-gotic",
    name: "Casa Gòtic",
    bio: "A small team running one lively hostel in the Gothic Quarter since 2014.",
    isSuperhost: false,
    yearsHosting: 12,
    responseRatePercent: 90,
    ratingAverage: 4.51,
    reviewCount: 519,
  },
  {
    slug: "isla",
    name: "Isla",
    bio: "I split my time between guiding on Lake Wakatipu and hosting travelers in the cabin next door.",
    work: "Kayak guide",
    isSuperhost: true,
    yearsHosting: 4,
    responseRatePercent: 98,
    ratingAverage: 4.9,
    reviewCount: 121,
  },
  {
    slug: "marina-resorts-group",
    name: "Marina Resorts Group",
    bio: "We operate a small collection of waterfront properties along Dubai Marina.",
    isSuperhost: true,
    yearsHosting: 8,
    responseRatePercent: 95,
    ratingAverage: 4.8,
    reviewCount: 156,
  },
  {
    slug: "giulia",
    name: "Giulia",
    bio: "My grandparents planted the lemon grove this villa sits in. I still press the oil we leave guests each stay.",
    work: "Farmer",
    isSuperhost: true,
    yearsHosting: 9,
    responseRatePercent: 100,
    ratingAverage: 4.93,
    reviewCount: 189,
  },
];

const properties: Array<{
  slug: string;
  name: string;
  type: PropertyType;
  description: string;
  city: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  unavailableAmenities: string[];
  images: string[];
  ratingAverage: number;
  reviewCount: number;
  hostSlug: string;
}> = [
  {
    slug: "sunset-loft-lisbon",
    name: "Sunset Loft in Alfama",
    type: PropertyType.APARTMENT,
    description:
      "A bright, tile-clad loft tucked into Lisbon's oldest district, with a private balcony overlooking terracotta rooftops and the Tejo river beyond.",
    city: "Lisbon",
    country: "Portugal",
    address: "Rua de São Tomé 12, Lisbon",
    latitude: 38.7139,
    longitude: -9.1301,
    pricePerNight: 14200,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: ["Wifi", "Kitchen", "Washer", "Air conditioning", "Balcony", "Self check-in"],
    unavailableAmenities: ["Elevator", "Pool"],
    images: [IMG("photo-1502672260266-1c1ef2d93688"), IMG("photo-1502672023488-70e25813eb80")],
    ratingAverage: 4.86,
    reviewCount: 214,
    hostSlug: "mariana",
  },
  {
    slug: "harborview-suite-lisbon",
    name: "Harborview Suite",
    type: PropertyType.HOTEL,
    description:
      "A boutique hotel suite steps from Praça do Comércio with sweeping harbor views and an in-house rooftop pool.",
    city: "Lisbon",
    country: "Portugal",
    address: "Praça do Comércio 4, Lisbon",
    latitude: 38.7075,
    longitude: -9.1364,
    pricePerNight: 21800,
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ["Wifi", "Pool", "Breakfast included", "Air conditioning", "Room service"],
    unavailableAmenities: ["Free parking"],
    images: [IMG("photo-1611892440504-42a792e24d32"), IMG("photo-1590490360182-c33d57733427")],
    ratingAverage: 4.72,
    reviewCount: 98,
    hostSlug: "hotel-ribeira",
  },
  {
    slug: "kyoto-machiya-house",
    name: "Traditional Machiya Townhouse",
    type: PropertyType.GUEST_HOUSE,
    description:
      "A restored wooden machiya near Gion with a private courtyard garden, tatami rooms, and a cedar soaking tub.",
    city: "Kyoto",
    country: "Japan",
    address: "Higashiyama Ward, Kyoto",
    latitude: 35.0116,
    longitude: 135.7681,
    pricePerNight: 26500,
    maxGuests: 5,
    bedrooms: 3,
    beds: 3,
    bathrooms: 2,
    amenities: ["Wifi", "Kitchen", "Garden", "Soaking tub", "Self check-in"],
    unavailableAmenities: ["Air conditioning", "Elevator"],
    images: [IMG("photo-1545569341-9eb8b30979d9"), IMG("photo-1524413840807-0c3cb6fa808d")],
    ratingAverage: 4.94,
    reviewCount: 176,
    hostSlug: "takeshi",
  },
  {
    slug: "santorini-cliff-villa",
    name: "Cliffside Infinity Pool Villa",
    type: PropertyType.VILLA,
    description:
      "Carved into the caldera cliffs of Oia, this whitewashed villa has a private infinity pool facing the Aegean sunset.",
    city: "Santorini",
    country: "Greece",
    address: "Oia, Santorini",
    latitude: 36.4614,
    longitude: 25.3753,
    pricePerNight: 58000,
    maxGuests: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 3,
    amenities: ["Wifi", "Private pool", "Sea view", "Kitchen", "Air conditioning", "Parking"],
    unavailableAmenities: [],
    images: [IMG("photo-1613395877344-13d4a8e0d49e"), IMG("photo-1570213489059-0aac6626cade")],
    ratingAverage: 4.97,
    reviewCount: 312,
    hostSlug: "elena",
  },
  {
    slug: "banff-mountain-cabin",
    name: "Pine Ridge Mountain Cabin",
    type: PropertyType.CABIN,
    description:
      "A timber-framed cabin at the edge of Banff National Park with a wood-burning stove and floor-to-ceiling views of the Rockies.",
    city: "Banff",
    country: "Canada",
    address: "Tunnel Mountain Road, Banff",
    latitude: 51.1784,
    longitude: -115.5708,
    pricePerNight: 19800,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 2,
    amenities: ["Wifi", "Fireplace", "Kitchen", "Hot tub", "Parking", "Mountain view"],
    unavailableAmenities: ["Air conditioning", "Elevator"],
    images: [IMG("photo-1449158743715-0a90ebb6d2d8"), IMG("photo-1518602164578-cd0074062767")],
    ratingAverage: 4.89,
    reviewCount: 143,
    hostSlug: "connor",
  },
  {
    slug: "marrakech-riad-retreat",
    name: "Riad Retreat with Rooftop Terrace",
    type: PropertyType.GUEST_HOUSE,
    description:
      "A restored riad in the heart of the medina, centered on a mosaic-tiled courtyard with a rooftop terrace for sunset mint tea.",
    city: "Marrakech",
    country: "Morocco",
    address: "Derb Dabachi, Marrakech Medina",
    latitude: 31.6295,
    longitude: -7.9811,
    pricePerNight: 9800,
    maxGuests: 8,
    bedrooms: 4,
    beds: 5,
    bathrooms: 4,
    amenities: ["Wifi", "Rooftop terrace", "Breakfast included", "Air conditioning", "Courtyard"],
    unavailableAmenities: ["Free parking", "Elevator"],
    images: [IMG("photo-1548013146-72479768bada"), IMG("photo-1517840901100-8179e982acb7")],
    ratingAverage: 4.91,
    reviewCount: 261,
    hostSlug: "youssef",
  },
  {
    slug: "manhattan-skyline-apartment",
    name: "Skyline View Apartment",
    type: PropertyType.APARTMENT,
    description:
      "A sleek high-rise apartment in Midtown with floor-to-ceiling windows framing the Manhattan skyline.",
    city: "New York",
    country: "United States",
    address: "W 42nd St, New York",
    latitude: 40.7549,
    longitude: -73.984,
    pricePerNight: 32500,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    amenities: ["Wifi", "Gym access", "Doorman", "Kitchen", "Washer", "City view"],
    unavailableAmenities: ["Free parking", "Pool"],
    images: [IMG("photo-1522708323590-d24dbb6b0267"), IMG("photo-1560448204-e02f11c3d0e2")],
    ratingAverage: 4.68,
    reviewCount: 87,
    hostSlug: "chris",
  },
  {
    slug: "bali-rice-terrace-resort",
    name: "Rice Terrace Resort & Spa",
    type: PropertyType.RESORT,
    description:
      "An open-air resort overlooking the Tegallalang rice terraces, with a jungle-facing infinity pool and full-service spa.",
    city: "Ubud",
    country: "Indonesia",
    address: "Tegallalang, Ubud, Bali",
    latitude: -8.4318,
    longitude: 115.2793,
    pricePerNight: 24500,
    maxGuests: 3,
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    amenities: ["Wifi", "Pool", "Spa access", "Breakfast included", "Rice field view"],
    unavailableAmenities: [],
    images: [IMG("photo-1573843981267-be1999ff37cd"), IMG("photo-1540541338287-41700207dee6")],
    ratingAverage: 4.95,
    reviewCount: 402,
    hostSlug: "wayan",
  },
  {
    slug: "barcelona-gothic-hostel",
    name: "Gothic Quarter Social Hostel",
    type: PropertyType.HOSTEL,
    description:
      "A lively hostel two blocks from La Rambla with a rooftop bar, communal kitchen, and mixed and private rooms.",
    city: "Barcelona",
    country: "Spain",
    address: "Carrer d'Avinyó 8, Barcelona",
    latitude: 41.3805,
    longitude: 2.1745,
    pricePerNight: 4200,
    maxGuests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ["Wifi", "Shared kitchen", "Rooftop bar", "Lockers", "Laundry"],
    unavailableAmenities: ["Air conditioning", "Private bathroom"],
    images: [IMG("photo-1555854877-bab0e564b8d5"), IMG("photo-1520250497591-112f2f40a3f4")],
    ratingAverage: 4.51,
    reviewCount: 519,
    hostSlug: "casa-gotic",
  },
  {
    slug: "queenstown-lakeside-cabin",
    name: "Lakeside Cabin with Alpine Views",
    type: PropertyType.CABIN,
    description:
      "A cedar cabin on the shore of Lake Wakatipu with a private dock, wood stove, and unobstructed views of the Remarkables.",
    city: "Queenstown",
    country: "New Zealand",
    address: "Glenorchy-Queenstown Rd, Queenstown",
    latitude: -45.0312,
    longitude: 168.6626,
    pricePerNight: 27500,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: ["Wifi", "Lake access", "Fireplace", "Kitchen", "Parking", "Mountain view"],
    unavailableAmenities: ["Air conditioning"],
    images: [IMG("photo-1449824913935-59a10b8d2000"), IMG("photo-1470770841072-f978cf4d019e")],
    ratingAverage: 4.9,
    reviewCount: 121,
    hostSlug: "isla",
  },
  {
    slug: "dubai-marina-resort-suite",
    name: "Marina Resort Suite",
    type: PropertyType.RESORT,
    description:
      "A resort suite along Dubai Marina with private beach access, an infinity pool deck, and skyline views after dark.",
    city: "Dubai",
    country: "United Arab Emirates",
    address: "Dubai Marina Walk, Dubai",
    latitude: 25.0805,
    longitude: 55.1403,
    pricePerNight: 41200,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    amenities: ["Wifi", "Private beach", "Pool", "Gym access", "Valet parking", "Sea view"],
    unavailableAmenities: [],
    images: [IMG("photo-1582719478250-c89cae4dc85b"), IMG("photo-1571003123894-1f0594d2b5d9")],
    ratingAverage: 4.8,
    reviewCount: 156,
    hostSlug: "marina-resorts-group",
  },
  {
    slug: "amalfi-coast-villa",
    name: "Terraced Villa Above the Amalfi Coast",
    type: PropertyType.VILLA,
    description:
      "A lemon-grove villa in Praiano with terraced gardens, a saltwater pool, and stairs down to a private cove.",
    city: "Praiano",
    country: "Italy",
    address: "Via Roma 22, Praiano",
    latitude: 40.6265,
    longitude: 14.5384,
    pricePerNight: 48500,
    maxGuests: 8,
    bedrooms: 4,
    beds: 5,
    bathrooms: 4,
    amenities: ["Wifi", "Private pool", "Sea view", "Kitchen", "Garden", "Parking"],
    unavailableAmenities: ["Elevator"],
    images: [IMG("photo-1533104816931-20fa691ff6ca"), IMG("photo-1512917774080-9991f1c4c750")],
    ratingAverage: 4.93,
    reviewCount: 189,
    hostSlug: "giulia",
  },
];

async function main() {
  const demoPasswordHash = await bcrypt.hash("password123", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@wayfarer.test" },
    update: {},
    create: {
      name: "Demo Traveler",
      email: "demo@wayfarer.test",
      passwordHash: demoPasswordHash,
    },
  });

  const hostIdBySlug = new Map<string, string>();
  for (const host of hosts) {
    const { slug, ...data } = host;
    const record = await prisma.host.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });
    hostIdBySlug.set(slug, record.id);
  }

  for (const property of properties) {
    const { hostSlug, ...data } = property;
    const hostId = hostIdBySlug.get(hostSlug);
    if (!hostId) throw new Error(`Unknown hostSlug "${hostSlug}" for property "${property.slug}"`);

    await prisma.property.upsert({
      where: { slug: property.slug },
      update: { ...data, hostId },
      create: { ...data, hostId },
    });
  }

  const firstProperty = await prisma.property.findUnique({
    where: { slug: properties[0].slug },
  });

  if (firstProperty) {
    await prisma.review.deleteMany({
      where: { propertyId: firstProperty.id, userId: demoUser.id },
    });
    await prisma.review.create({
      data: {
        userId: demoUser.id,
        propertyId: firstProperty.id,
        rating: 5,
        comment:
          "Beautiful loft, exactly as pictured. Mariana was a fantastic host and the balcony view at sunset was unbeatable. Great location too, right in the heart of Alfama.",
      },
    });
  }

  console.log(
    `Seeded ${hosts.length} hosts, ${properties.length} properties, and demo user (demo@wayfarer.test / password123).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
