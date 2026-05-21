import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const themeBackground = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  const backgroundColor = typeof themeBackground === 'string' ? themeBackground : themeBackground?.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
