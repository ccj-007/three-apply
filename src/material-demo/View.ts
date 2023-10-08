import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CubeTextureLoader } from 'three/src/loaders/CubeTextureLoader'
import { FlakesTexture } from 'three/examples/jsm/textures/FlakesTexture'
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

export default class View {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  group: THREE.Group
  particleLight: THREE.Mesh

  constructor (canvasElem: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElem,
      antialias: true
    })
    this.renderer.shadowMap.enabled = true
    this.camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      0.25,
      50
    )
    this.camera.position.z = 10
    // 场景
    this.scene = new THREE.Scene()
    this.group = new THREE.Group()
    this.scene.add(this.group)

    this.loadTexture()
    this.loadControl()
    this.loadLight()

    // 适配缩放
    this.onWindowResize(window.innerWidth, window.innerHeight)
  }
  loadTexture () {
    const sphereGeometry = new THREE.SphereGeometry(10, 50, 50)
    // @ts-ignore
    const envmap = new RGBELoader().load('textures/blocky_photo_studio_4k.hdr')
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      map: envmap,
      side: THREE.BackSide // 设置球体的内部可见
    })

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    this.scene.add(sphere)

    // this.scene.background = envmap
    this.scene.environment = envmap

    const geometry = new THREE.SphereGeometry(0.8, 64, 32)
    const textureLoader = new THREE.TextureLoader()

    const diffuse = textureLoader.load('textures/carbon/Carbon.png')
    //@ts-ignore
    diffuse.colorSpace = THREE.SRGBColorSpace
    diffuse.wrapS = THREE.RepeatWrapping
    diffuse.wrapT = THREE.RepeatWrapping
    diffuse.repeat.x = 10
    diffuse.repeat.y = 10

    const normalMap = textureLoader.load('textures/carbon/Carbon_Normal.png')
    normalMap.wrapS = THREE.RepeatWrapping
    normalMap.wrapT = THREE.RepeatWrapping
    normalMap.repeat.x = 10
    normalMap.repeat.y = 10

    const normalMap2 = textureLoader.load('textures/water/Water_1_M_Normal.jpg')

    const normalMap3 = new THREE.CanvasTexture(new FlakesTexture())
    normalMap3.wrapS = THREE.RepeatWrapping
    normalMap3.wrapT = THREE.RepeatWrapping
    normalMap3.repeat.x = 10
    normalMap3.repeat.y = 6
    normalMap3.anisotropy = 16

    const normalMap4 = textureLoader.load('textures/golfball.jpg')

    const clearcoatNormalMap = textureLoader.load(
      'textures/pbr/Scratched_gold/Scratched_gold_01_1K_Normal.png'
    )

    // 车漆材质
    let material = new THREE.MeshPhysicalMaterial({
      // 光泽强度
      clearcoat: 1,
      // 光泽的粗糙度
      clearcoatRoughness: 0.1,
      // 金属度
      metalness: 0.9,
      // 粗糙度
      roughness: 0.5,
      color: 0x0000ff,
      // 法线贴图
      normalMap: normalMap3,
      // 法线缩放
      normalScale: new THREE.Vector2(0.15, 0.15)
    })

    let mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = -1
    mesh.position.y = 1
    this.group.add(mesh)

    // fibers

    material = new THREE.MeshPhysicalMaterial({
      roughness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      map: diffuse,
      normalMap: normalMap
    })
    mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = 1
    mesh.position.y = 1
    this.group.add(mesh)

    // golf

    material = new THREE.MeshPhysicalMaterial({
      metalness: 0.0,
      roughness: 0.1,
      clearcoat: 1.0,
      normalMap: normalMap4,
      clearcoatNormalMap: clearcoatNormalMap,

      // y scale is negated to compensate for normal map handedness.
      clearcoatNormalScale: new THREE.Vector2(2.0, -2.0)
    })
    mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = -1
    mesh.position.y = -1
    this.group.add(mesh)

    // clearcoat + normalmap
    material = new THREE.MeshPhysicalMaterial({
      clearcoat: 1.0,
      metalness: 1.0,
      color: 0xff0000,
      normalMap: normalMap2,
      normalScale: new THREE.Vector2(0.15, 0.15),
      clearcoatNormalMap: clearcoatNormalMap,

      // y scale is negated to compensate for normal map handedness.
      clearcoatNormalScale: new THREE.Vector2(2.0, -2.0)
    })
    mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = 1
    mesh.position.y = -1
    this.group.add(mesh)
  }
  loadLight () {
    this.particleLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    )
    this.scene.add(this.particleLight)

    this.particleLight.add(new THREE.PointLight(0xffffff, 30))
  }
  loadControl () {
    const controls = new OrbitControls(this.camera, this.renderer.domElement)
    controls.minDistance = 3
    controls.maxDistance = 30
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
    const { camera, scene, renderer, particleLight, group } = this

    const timer = Date.now() * 0.00025

    particleLight.position.x = Math.sin(timer * 7) * 3
    particleLight.position.y = Math.cos(timer * 5) * 4
    particleLight.position.z = Math.cos(timer * 3) * 3

    for (let i = 0; i < group.children.length; i++) {
      const child = group.children[i]
      child.rotation.y += 0.005
    }
    renderer.render(scene, camera)
  }
}
