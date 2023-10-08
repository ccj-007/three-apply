import THREE = require('three')

export default class Rects {
  objects = []

  constructor (scene: THREE.Scene) {
    this.createModel(scene)
  }

  getObjects () {
    return this.objects
  }

  createModel (scene) {
    const boxGeometry = new THREE.BoxGeometry(20, 20, 20)
    for (let i = 0; i < 500; i++) {
      // 物理材质
      const boxMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff
      })
      const box = new THREE.Mesh(boxGeometry, boxMaterial)

      if (i === 0) {
        // 用于光照目标点的指向
        box.position.set(0, 0, 0)
      } else {
        box.position.x =
          Math.floor(Math.random() * 200) * (Math.random() > 0.5 ? 1 : -1)
        box.position.y = Math.floor(Math.random() * 20) * 20 + 10
        box.position.z =
          Math.floor(Math.random() * 200) * (Math.random() > 0.5 ? 1 : -1)
      }
      // 影响其他物体产生影子
      box.castShadow = true
      // 自身被动产生影子
      box.receiveShadow = true
      scene.add(box)
      this.objects.push(box)
    }
  }
}
