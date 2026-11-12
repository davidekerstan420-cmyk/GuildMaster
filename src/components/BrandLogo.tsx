import { Image } from 'react-native';
import { brandArt } from './icons';

const RATIO = 347 / 145; // width / height of the logo art

export default function BrandLogo({ width = 300 }: { width?: number }) {
  return (
    <Image
      source={brandArt.logo}
      style={{ width, height: width / RATIO, alignSelf: 'center' }}
      resizeMode="contain"
    />
  );
}