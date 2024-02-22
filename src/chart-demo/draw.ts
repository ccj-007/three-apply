import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
export function generateLine(
  starts = [0, 0, 0],
  ends = [0, 0, 0],
  color = 0x000000
) {
  let geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(...starts),
    new THREE.Vector3(...ends),
  ]);
  let material = new THREE.LineBasicMaterial({
    color: color,
  });
  return new THREE.Line(geometry, material);
}

export type CreateText = {
  text?: string;
  font: any;
  color?: number;
  camera?: THREE.Camera;
  size?: number;
};

export function genetateText({
  text = "",
  font,
  color = 0x000000,
  size = 1,
}: CreateText) {
  if (!font) {
    throw new Error("font is required!");
  }
  let textMesh;
  const textGeometry = new TextGeometry(text, {
    font,
    size, // 文本大小
    height: 1, // 文本厚度
    curveSegments: 12, // 曲线段数，影响文本的平滑度
    bevelEnabled: false, // 是否启用斜角
  });

  const textMaterial = new THREE.MeshBasicMaterial({ color });

  textMesh = new THREE.Mesh(textGeometry, textMaterial);

  return textMesh;
}
