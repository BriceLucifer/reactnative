// Gilroy 字体配置
export const Fonts = {
  // 常用字体权重
  thin: 'Gilroy-Thin',
  ultraLight: 'Gilroy-UltraLight',
  light: 'Gilroy-Light',
  regular: 'Gilroy-Regular',
  medium: 'Gilroy-Medium',
  semiBold: 'Gilroy-SemiBold',
  bold: 'Gilroy-Bold',
  extraBold: 'Gilroy-ExtraBold',
  black: 'Gilroy-Black',
  heavy: 'Gilroy-Heavy',
} as const;

// 字体样式预设
export const FontStyles = {
  // 标题样式
  title: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 24,
    lineHeight: 32,
  },
  heading: {
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  
  // 正文样式
  body: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  
  // 按钮样式
  button: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  buttonLarge: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  
  // 标签样式
  label: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  caption: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
} as const;