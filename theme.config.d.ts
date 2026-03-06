export const themeColors: {
  primary:      { light: string; dark: string };
  primaryLight: { light: string; dark: string };
  background:   { light: string; dark: string };
  surface:      { light: string; dark: string };
  surface2:     { light: string; dark: string };
  foreground:   { light: string; dark: string };
  muted:        { light: string; dark: string };
  subtle:       { light: string; dark: string };
  border:       { light: string; dark: string };
  success:      { light: string; dark: string };
  warning:      { light: string; dark: string };
  error:        { light: string; dark: string };
  blue:         { light: string; dark: string };
  amber:        { light: string; dark: string };
  tint:         { light: string; dark: string };
};

declare const themeConfig: {
  themeColors: typeof themeColors;
};

export default themeConfig;
