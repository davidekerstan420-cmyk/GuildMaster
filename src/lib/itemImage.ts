import { itemArt } from '../components/icons';

// Uploaded image first, then the bundled image for the starter items.
export function itemImage(key: string | null | undefined, url?: string | null): any {
  if (url) return { uri: url };
  if (key && itemArt[key]) return itemArt[key];
  return undefined;
}