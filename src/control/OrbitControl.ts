import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default class OrbitControl {
  controls: OrbitControls

  constructor (camera: THREE.Camera, domElement: HTMLCanvasElement) {
    this.controls = new OrbitControls(camera, domElement)
    console.log(this.controls)
  }

  getControls () {
    return this.controls
  }
}
