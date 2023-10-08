import * as THREE from 'three'

export default class Light {
  constructor (scene: THREE.Scene, objects) {
    // 方向光
    const dirLight = new THREE.DirectionalLight(0xffffff, 2)
    dirLight.castShadow = true
    // 设置发出光的坐标
    dirLight.position.set(0, 400, 0)

    // 设置光源的目标点
    dirLight.target = objects[0]
    scene.add(dirLight)

    // 设置光影的分辨率
    dirLight.shadow.mapSize.width = 2048
    dirLight.shadow.mapSize.height = 2048

    // 设置光源照射的尺寸
    const d = 200

    dirLight.shadow.camera.left = -d
    dirLight.shadow.camera.right = d
    dirLight.shadow.camera.top = d
    dirLight.shadow.camera.bottom = -d

    // 设置裁剪面
    dirLight.shadow.camera.far = 3500
    dirLight.shadow.radius = 5
    // 设置阴影偏移，解决精度问题
    dirLight.shadow.bias = -0.0001

    // 通过线框的方式方便我们查看光源位置
    const helper = new THREE.CameraHelper(dirLight.shadow.camera)
    scene.add(helper)

    // 半球光
    const cirLight = new THREE.HemisphereLight(0xeeeeff, 0x777788, 4)
    cirLight.position.set(0.5, 1, 0.75)
    scene.add(cirLight)
  }
}
