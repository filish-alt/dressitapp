import Icon from 'react-native-vector-icons/MaterialIcons';
import { StyleProp, ViewStyle } from 'react-native';

type SymbolWeight = 'ultraLight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';

// SF Symbol name to Material Icon mapping
const SYMBOL_MAPPING: Record<string, string> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'person.circle': 'account-circle',
  'plus': 'add',
  'magnifyingglass': 'search',
  'heart': 'favorite-border',
  'heart.fill': 'favorite',
  'star': 'star-border',
  'star.fill': 'star',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = SYMBOL_MAPPING[name] || 'help'; // fallback icon
  
  return (
    <Icon
      name={iconName}
      size={size}
      color={color}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
