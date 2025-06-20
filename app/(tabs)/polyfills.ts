// polyfills.ts
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  if (typeof global.requestAnimationFrame !== 'function') {
    global.requestAnimationFrame = function (callback: FrameRequestCallback): number {
      return setTimeout(() => callback(Date.now()), 1000 / 60);
    };

    global.cancelAnimationFrame = function (id: number): void {
      clearTimeout(id);
    };
  }
}
