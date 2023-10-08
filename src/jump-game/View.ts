import * as THREE from 'three'
import Plane from '../model/Plane'
import FirstPersonControl from '../control/PointerLockControl'
import Light from '../light/Light'
import Rects from '../model/Rects'

export default class View {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls
  firstPersonControl
  objects = []

  constructor (canvasElem: HTMLCanvasElement) {
    // 渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElem,
      antialias: true
    })
    this.renderer.shadowMap.enabled = true
    // 生成相机的45度角度范围、渲染区域宽高比屏幕的宽高比，近裁剪代表相机离最近物体的距离为0.1，最远为100
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    )
    // 设置相机高度
    this.camera.position.y = 10
    // 场景
    this.scene = new THREE.Scene()

    this.loadEnv()
    this.loadModel()
    this.loadLight()
    this.loadControl()

    // 适配缩放
    this.onWindowResize(window.innerWidth, window.innerHeight)
  }
  loadEnv () {
    // 加载场景背景
    // this.scene.background = new THREE.TextureLoader().load(
    //   './textures/bgnd.png'
    // )
    this.scene.background = new THREE.Color(0x6699ff)
  }
  loadLight () {
    new Light(this.scene, this.objects)
  }

  loadModel () {
    new Plane(this.scene)
    this.objects = new Rects(this.scene).getObjects()
  }

  loadControl () {
    this.firstPersonControl = new FirstPersonControl(
      this.camera,
      this.renderer.domElement,
      this.scene
    )
    this.controls = this.firstPersonControl.getControls()
  }

  onWindowResize (vpW: number, vpH: number) {
    // 确保渲染器的输出和窗口大小匹配
    this.renderer.setSize(vpW, vpH)
    // 更新相机的纵横比
    this.camera.aspect = vpW / vpH
    // 更新投影矩阵
    this.camera.updateProjectionMatrix()
  }

  // 所有子物体的更新
  update (secs: number) {
    const { firstPersonControl, objects, camera, scene, renderer } = this
    firstPersonControl.update(secs, { objects })
    renderer.render(scene, camera)
  }
}
