import { FlyControls } from 'three/examples/jsm/controls/FlyControls'
import * as THREE from 'three'

export default class FlyControl {
  controls: FlyControls
  movementSpeed = 1
  dragToLook = true

  constructor (camera: THREE.Camera, domElement: HTMLCanvasElement) {
    this.controls = new FlyControls(camera, domElement)
    this.controls.movementSpeed = this.movementSpeed
    this.controls.dragToLook = this.dragToLook
  }

  getControls () {
    return this.controls
  }

  update (secs) {
    this.controls.update(secs) //更新飞行控件
  }
}
