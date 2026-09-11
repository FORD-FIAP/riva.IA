import { Platform } from 'react-native';

/**
 * `useNativeDriver: true` não é confiável no React Native Web — a animação
 * às vezes trava na posição inicial (ex: um drawer preso fora da tela,
 * transform nunca chega no valor final). No app nativo (iOS/Android) o driver
 * nativo continua ativado normalmente, só a versão web cai pro JS-driven.
 */
export const NATIVE_DRIVER = Platform.OS !== 'web';
