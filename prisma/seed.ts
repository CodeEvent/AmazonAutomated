import "dotenv/config";
import { PrismaClient, PropertyType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

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
  images: string[];
  ratingAverage: number;
  reviewCount: number;
  hostName: string;
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
    images: [IMG("photo-1502672260266-1c1ef2d93688"), IMG("photo-1502672023488-70e25813eb80")],
    ratingAverage: 4.86,
    reviewCount: 214,
    hostName: "Mariana",
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
    images: [IMG("photo-1611892440504-42a792e24d32"), IMG("photo-1590490360182-c33d57733427")],
    ratingAverage: 4.72,
    reviewCount: 98,
    hostName: "Hotel Ribeira",
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
    images: [IMG("photo-1545569341-9eb8b30979d9"), IMG("photo-1524413840807-0c3cb6fa808d")],
    ratingAverage: 4.94,
    reviewCount: 176,
    hostName: "Takeshi",
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
    images: [IMG("photo-1613395877344-13d4a8e0d49e"), IMG("photo-1570213489059-0aac6626cade")],
    ratingAverage: 4.97,
    reviewCount: 312,
    hostName: "Elena",
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
    images: [IMG("photo-1449158743715-0a90ebb6d2d8"), IMG("photo-1518602164578-cd0074062767")],
    ratingAverage: 4.89,
    reviewCount: 143,
    hostName: "Connor",
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
    images: [IMG("photo-1548013146-72479768bada"), IMG("photo-1517840901100-8179e982acb7")],
    ratingAverage: 4.91,
    reviewCount: 261,
    hostName: "Youssef",
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
    images: [IMG("photo-1522708323590-d24dbb6b0267"), IMG("photo-1560448204-e02f11c3d0e2")],
    ratingAverage: 4.68,
    reviewCount: 87,
    hostName: "Chris",
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
    images: [IMG("photo-1573843981267-be1999ff37cd"), IMG("photo-1540541338287-41700207dee6")],
    ratingAverage: 4.95,
    reviewCount: 402,
    hostName: "Wayan",
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
    images: [IMG("photo-1555854877-bab0e564b8d5"), IMG("photo-1520250497591-112f2f40a3f4")],
    ratingAverage: 4.51,
    reviewCount: 519,
    hostName: "Casa Gòtic",
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
    images: [IMG("photo-1449824913935-59a10b8d2000"), IMG("photo-1470770841072-f978cf4d019e")],
    ratingAverage: 4.9,
    reviewCount: 121,
    hostName: "Isla",
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
    images: [IMG("photo-1582719478250-c89cae4dc85b"), IMG("photo-1571003123894-1f0594d2b5d9")],
    ratingAverage: 4.8,
    reviewCount: 156,
    hostName: "Marina Resorts Group",
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
    images: [IMG("photo-1533104816931-20fa691ff6ca"), IMG("photo-1512917774080-9991f1c4c750")],
    ratingAverage: 4.93,
    reviewCount: 189,
    hostName: "Giulia",
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

  for (const property of properties) {
    await prisma.property.upsert({
      where: { slug: property.slug },
      update: property,
      create: property,
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
          "Beautiful loft, exactly as pictured. Mariana was a fantastic host and the balcony view at sunset was unbeatable.",
      },
    });
  }

  console.log(`Seeded ${properties.length} properties and demo user (demo@wayfarer.test / password123).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
