import { PixelRatio } from 'react-native';
import { Image } from 'expo-image';

// Real photographs, hosted by Unsplash (free to use under the Unsplash License, including commercial use).
// `id` is the image id on images.unsplash.com, `page` is the id of the photo's page so you can verify the credit:
//   https://unsplash.com/photos/<page>
// Full list with credits: CREDITS.md
export type PhotoMeta = { id: string; by: string; page: string; label?: string };

export const PHOTOS = {
  // listing exteriors
  villa: { id: '1721222204126-e7042f2893b1', by: 'Sanju Pandita', page: 'YBfU7TAS8sU' },
  townhouse: { id: '1489370321024-e0410ad08da4', by: 'Joshua Coleman', page: 'zh_ofCt2r9c' },
  tower: { id: '1766321258844-6541b34b2940', by: 'Thomas Leblanc', page: 'U_2ZeGGtNH4' },
  cottage: { id: '1509592149237-bc44977d96d0', by: 'Hatice Baran', page: 'Mbn9oZkQ3ow' },
  loft: { id: '1620418028350-c335d6765483', by: 'Tommy Bond', page: 'DjLbHCYJ6-A' },
  penthouse: { id: '1766321258826-d5c1242e8152', by: 'Thomas Leblanc', page: 'oFyK1c-nWr8' },
  rowhomes: { id: '1512915922686-57c11dde9b6b', by: 'Frames For Your Heart', page: 'vbSRUrNm3Ik' },
  bungalow: { id: '1513584684374-8bab748fbf90', by: 'Stephan Bechert', page: 'yFV39g6AZ5o' },
  // welcome and sign-in heroes
  litHouse: { id: '1505843513577-22bb7d21e455', by: 'Daniel Barnes', page: 'RKdLlTyjm5g' },
  modernWhite: { id: '1564013799919-ab600027ffc6', by: 'Wes Fischer', page: 'g39p1kDjvSY' },
  cabin: { id: '1558036117-15d82a90b9b1', by: 'Bailey Anselme', page: 'Bkp3gLygyeA' },
  // interiors (shared across listings)
  livingDining: { id: '1758565811272-e79917ca0adc', by: 'Caroline Badran', page: 'n2lSnn0tVKk', label: 'Living and dining' },
  kitchenWood: { id: '1765371515325-b6611765dfad', by: 'Caroline Badran', page: '8XoRVYP9R6Y', label: 'Kitchen' },
  livingMarble: { id: '1759050427122-eaeb5885eaf7', by: 'Johan Mouchet', page: 'LOm3L0BP61o', label: 'Living area' },
  kitchenGreen: { id: '1748551204316-3b1106b827f3', by: 'Janay Peters', page: 'E_JrOCEeG20', label: 'Kitchen' },
  openPlan: { id: '1758565810995-bee5d73315f0', by: 'Caroline Badran', page: '7VSkY7mEwUk', label: 'Open plan' },
  kitchenWhite: { id: '1628745277862-bc0b2d68c50c', by: 'Zac Gudakov', page: 'UPbYh3A5cdg', label: 'Kitchen' },
} as const satisfies Record<string, PhotoMeta>;

export type PhotoKey = keyof typeof PHOTOS;

export const INTERIOR_KEYS: PhotoKey[] = ['livingDining', 'kitchenWood', 'livingMarble', 'kitchenGreen', 'openPlan', 'kitchenWhite'];

// Ask the CDN for roughly the pixels we will draw (not the 6000px original).
export function photoUrl(key: PhotoKey, width: number) {
  const px = Math.min(1600, Math.ceil((width * PixelRatio.get()) / 100) * 100);
  return `https://images.unsplash.com/photo-${PHOTOS[key].id}?auto=format&fm=jpg&fit=crop&q=72&w=${px}`;
}

// Warm the cache during the splash so the first screens do not pop in.
export function prefetchPhotos(keys: PhotoKey[], width: number) {
  Image.prefetch(keys.map((k) => photoUrl(k, width))).catch(() => {});
}
