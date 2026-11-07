import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ICONS, IconName } from '../art/icons';

export type { IconName };

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number; fill?: string };

export function Icon({ name, size = 24, color = '#14231F', strokeWidth = 1.9, fill = 'none' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={ICONS[name]} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill={fill} />
    </Svg>
  );
}
