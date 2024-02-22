import THREE = require("three");
import { CreateText, generateLine, genetateText } from "./draw";
type CreateAxis = {
  scene: THREE.Scene;
  lineSize: number;
  labels: string[];
  positionType: "inner" | "outer";
  tickSize: number;
  textOption: CreateText;
  direction: "x" | "y" | "z";
};

export function generateAxis({
  scene,
  lineSize,
  labels,
  positionType = "inner",
  tickSize = 10,
  textOption,
  direction = "x",
}: CreateAxis): { axisGroup: THREE.Group; texts: THREE.Mesh[] } {
  const lines = [];
  const axisGroup = new THREE.Group();
  scene.add(axisGroup);

  // 需要绘制的刻度次数
  const drawNum = labels.length - 1;
  const distance = lineSize / drawNum;
  for (let i = 0; i <= drawNum; i++) {
    let curDistance = i * distance;
    const line = generateLine(
      [curDistance, 0, 0],
      [curDistance, 0, positionType === "inner" ? -tickSize : tickSize]
    );
    lines.push(line);
  }

  // 绘制轴
  const line = generateLine([0, 0, 0], [lineSize, 0, 0]);
  lines.push(line);

  axisGroup.add(...lines);

  // 绘制文本
  const texts = [];
  const offset = -lineSize / 2 - textOption.size / 2;
  for (let i = 0; i <= drawNum; i++) {
    const v = i * distance;
    const text = genetateText({
      text: labels[i],
      size: textOption.size,
      font: textOption.font,
    });
    text.position[direction] = offset + v;
    texts.push(text);
  }

  return { axisGroup, texts };
}
