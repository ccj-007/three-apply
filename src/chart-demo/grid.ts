import THREE = require("three");
import { generateLine } from "./draw";

export function generateGrid(scene, w, h, xNum, yNum) {
  const lines = [];
  const lineGroup = new THREE.Group();
  lineGroup.position.set(-w / 2, 0, h / 2);
  scene.add(lineGroup);

  const xSize = w / xNum;
  const ySize = h / yNum;

  for (let i = 0; i < yNum + 1; i++) {
    let size = i * ySize;
    const line = generateLine([0, 0, -size], [w, 0, -size], 0xcccccc);
    lines.push(line);
  }

  for (let i = 0; i < xNum + 1; i++) {
    let size = i * xSize;
    const line = generateLine([size, 0, 0], [size, 0, -h], 0xcccccc);
    lines.push(line);
  }
  lineGroup.add(...lines);

  return lineGroup;
}
