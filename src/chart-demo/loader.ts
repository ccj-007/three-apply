import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

export async function loadFont() {
  return new Promise((resolve, reject) => {
    try {
      const fontLoader = new FontLoader();
      fontLoader.load("fonts/gentilis_regular.typeface.json", (font) => {
        resolve(font);
      });
    } catch (error) {
      reject(error);
    }
  });
}
