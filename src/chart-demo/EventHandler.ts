import THREE = require("three");

export class EventHandler {
  mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();
  constructor() {
    this.on();
  }

  on() {
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  destory() {
    window.removeEventListener("mousemove", this.onMouseMove.bind(this));
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  // 射线投射
  raycast(scene, camera) {
    this.raycaster.setFromCamera(this.mouse, camera);

    // 检测射线与物体的交点
    const intersects = this.raycaster.intersectObjects(scene.children);

    // 处理交点结果
    if (intersects.length > 0) {
      const firstIntersectedObject = intersects[0].object;
      if (firstIntersectedObject.name === "cube") {
        return firstIntersectedObject;
      }
    }
  }
}
