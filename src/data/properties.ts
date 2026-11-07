import type { Kind, Tod } from '../art/scenes';
import type { IconName } from '../art/icons';
import { INTERIOR_KEYS, PHOTOS, PhotoKey, PhotoMeta } from './photos';

export type Listing = 'sale' | 'rent';
export type PType = 'House' | 'Apartment' | 'Villa' | 'Loft';
export type AmenityId = 'parking' | 'pool' | 'garden' | 'ac' | 'security' | 'gym' | 'pets' | 'wifi' | 'fireplace' | 'balcony';

export const AMENITIES: Record<AmenityId, { label: string; icon: IconName }> = {
  parking: { label: 'Parking', icon: 'car' },
  pool: { label: 'Pool', icon: 'pool' },
  garden: { label: 'Garden', icon: 'tree' },
  ac: { label: 'Air con', icon: 'snow' },
  security: { label: '24/7 security', icon: 'shield' },
  gym: { label: 'Gym', icon: 'gym' },
  pets: { label: 'Pet friendly', icon: 'pet' },
  wifi: { label: 'Fibre wifi', icon: 'wifi' },
  fireplace: { label: 'Fireplace', icon: 'flame' },
  balcony: { label: 'Balcony', icon: 'sun' },
};

export type Agent = { id: string; name: string; role: string; rating: number; sold: number; color: string };

export const AGENTS: Agent[] = [
  { id: 'maya', name: 'Maya Ellison', role: 'Senior sales agent', rating: 4.9, sold: 128, color: '#E2725B' },
  { id: 'jonah', name: 'Jonah Reyes', role: 'Listing specialist', rating: 4.8, sold: 96, color: '#6E9C86' },
  { id: 'priya', name: 'Priya Nair', role: 'Rental advisor', rating: 4.9, sold: 74, color: '#E9B949' },
];

export type Property = {
  id: string;
  photo: PhotoKey; // exterior photograph
  title: string;
  listing: Listing;
  price: number;
  type: PType;
  kind: Kind;
  tod: Tod;
  beds: number;
  baths: number;
  sqft: number;
  year: number;
  hood: string;
  address: string;
  tag?: string;
  rating: number;
  desc: string;
  amenities: AmenityId[];
  agentId: string;
  map: { x: number; y: number };
};

// Demo data only. All names, places and prices are made up.
export const PROPERTIES: Property[] = [
  {
    id: 'lakeview-villa', photo: 'villa', title: 'Lakeview Villa', listing: 'sale', price: 1250000, type: 'Villa', kind: 'villa', tod: 'day',
    beds: 5, baths: 4, sqft: 3800, year: 2021, hood: 'Marlow Bay', address: '14 Shoreline Drive', tag: 'Featured', rating: 4.9,
    desc: 'A light-filled modern villa with floor-to-ceiling glass, a heated pool and a quiet lake view from every upstairs bedroom. The open kitchen flows straight onto a timber terrace made for long dinners.',
    amenities: ['pool', 'parking', 'garden', 'ac', 'security', 'wifi'], agentId: 'maya', map: { x: 640, y: 930 },
  },
  {
    id: 'maple-row', photo: 'townhouse', title: 'Maple Row Townhouse', listing: 'sale', price: 689000, type: 'House', kind: 'townhouse', tod: 'dusk',
    beds: 3, baths: 2, sqft: 1900, year: 2016, hood: 'Old Town', address: '22 Maple Row', tag: 'New', rating: 4.7,
    desc: 'Three storeys of character on a tree-lined street. Original brick detailing meets a fully renovated kitchen, with a sunny rooftop corner and a short walk to the market square.',
    amenities: ['parking', 'balcony', 'wifi', 'pets', 'fireplace'], agentId: 'jonah', map: { x: 300, y: 520 },
  },
  {
    id: 'skyline-24f', photo: 'tower', title: 'Skyline Residences 24F', listing: 'rent', price: 2450, type: 'Apartment', kind: 'tower', tod: 'night',
    beds: 2, baths: 2, sqft: 1100, year: 2022, hood: 'Downtown', address: '1 Central Plaza', rating: 4.6,
    desc: 'High-floor corner apartment with skyline views, concierge, gym and a residents-only sky lounge. Furnished or unfurnished, with flexible 6 or 12 month leases.',
    amenities: ['gym', 'security', 'parking', 'ac', 'wifi', 'balcony'], agentId: 'priya', map: { x: 520, y: 420 },
  },
  {
    id: 'willow-cottage', photo: 'cottage', title: 'Willow Cottage', listing: 'sale', price: 415000, type: 'House', kind: 'cottage', tod: 'day',
    beds: 2, baths: 1, sqft: 1150, year: 1952, hood: 'Greenfield', address: '8 Willow Lane', rating: 4.8,
    desc: 'A storybook cottage with a picket fence, a deep porch and a garden full of roses. Freshly rewired and re-roofed, so all that is left to do is move in and put the kettle on.',
    amenities: ['garden', 'fireplace', 'pets', 'parking'], agentId: 'jonah', map: { x: 170, y: 700 },
  },
  {
    id: 'foundry-loft', photo: 'loft', title: 'The Foundry Loft', listing: 'rent', price: 3100, type: 'Loft', kind: 'loft', tod: 'dusk',
    beds: 1, baths: 2, sqft: 1300, year: 1928, hood: 'Riverside', address: '90 Ironworks Row', tag: 'Open house', rating: 4.9,
    desc: 'A converted brick foundry with arched factory windows, soaring ceilings and a mezzanine bedroom. Steps from the river path, cafes and the weekend flea market.',
    amenities: ['wifi', 'pets', 'ac', 'security'], agentId: 'priya', map: { x: 610, y: 250 },
  },
  {
    id: 'harbor-penthouse', photo: 'penthouse', title: 'Harbor Point Penthouse', listing: 'sale', price: 1890000, type: 'Apartment', kind: 'tower', tod: 'dusk',
    beds: 3, baths: 3, sqft: 2400, year: 2023, hood: 'Marlow Bay', address: '5 Harbor Point', tag: 'Open house', rating: 4.9,
    desc: 'The top two floors of the bay, with a wraparound terrace, private lift and a view that turns gold every evening. Residents share a pool deck, gym and 24-hour concierge.',
    amenities: ['pool', 'gym', 'security', 'parking', 'balcony', 'ac'], agentId: 'maya', map: { x: 770, y: 800 },
  },
  {
    id: 'cedar-court', photo: 'rowhomes', title: 'Cedar Court Townhome', listing: 'rent', price: 2900, type: 'House', kind: 'townhouse', tod: 'day',
    beds: 3, baths: 2, sqft: 1600, year: 2019, hood: 'Old Town', address: '4 Cedar Court', rating: 4.5,
    desc: 'A family-sized townhome in a quiet cul-de-sac with a private patio, two parking spots and a school within walking distance. Pets welcome.',
    amenities: ['parking', 'pets', 'garden', 'wifi'], agentId: 'priya', map: { x: 400, y: 650 },
  },
  {
    id: 'sunnyside', photo: 'bungalow', title: 'Sunnyside Bungalow', listing: 'sale', price: 529000, type: 'House', kind: 'cottage', tod: 'dusk',
    beds: 3, baths: 2, sqft: 1700, year: 1988, hood: 'Greenfield', address: '31 Sunnyside Road', rating: 4.6,
    desc: 'A sun-soaked single-storey home on a deep lot, with an easy open plan, a new kitchen and a shaded back garden that is ready for a hammock.',
    amenities: ['garden', 'parking', 'ac', 'pets'], agentId: 'maya', map: { x: 160, y: 960 },
  },
];

export function byId(id: string | undefined) {
  return PROPERTIES.find((p) => p.id === id);
}

export type Slide = { photo: PhotoKey; label: string; kind: Kind; tod: Tod };

// Exterior first, then three interiors (rotated per listing so neighbours do not all match).
export function galleryFor(p: Property): Slide[] {
  const i = PROPERTIES.findIndex((x) => x.id === p.id) * 2;
  const interiors = [0, 1, 2].map((k) => INTERIOR_KEYS[(i + k) % INTERIOR_KEYS.length]);
  return [
    { photo: p.photo, label: 'Exterior', kind: p.kind, tod: p.tod },
    ...interiors.map((k) => ({ photo: k, label: (PHOTOS[k] as PhotoMeta).label ?? 'Interior', kind: 'interior' as Kind, tod: 'day' as Tod })),
  ];
}
