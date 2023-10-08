import * as THREE from 'three'

export default class Plane {
  plane: THREE.Mesh

  constructor (scene: THREE.Scene) {
    const geometry = new THREE.PlaneGeometry(10000, 10000, 100, 100) // 指定平面的宽度和高度
    const material = new THREE.MeshPhysicalMaterial({ color: 0x4c9a14 }) // 指定平面的材质
    this.plane = new THREE.Mesh(geometry, material) // 创建平面模型
    this.plane.receiveShadow = true
    this.plane.rotateX(-Math.PI / 2)
    scene.add(this.plane) // 将平面模型添加到场景中
  }
}
