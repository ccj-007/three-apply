import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import * as THREE from 'three'

export default class PointerLockControl {
  controls: PointerLockControls
  // 键盘的移动指令
  moveForward = false
  moveBackward = false
  moveLeft = false
  moveRight = false
  canJump = false
  // 用于控制速度
  prevTime = 0
  // 速度
  velocity = new THREE.Vector3()
  // 方向
  direction = new THREE.Vector3()
  // 射线用于碰撞检测
  raycaster: THREE.Raycaster

  constructor (
    camera: THREE.Camera,
    domElement: HTMLCanvasElement,
    scene: THREE.Scene
  ) {
    this.controls = new PointerLockControls(camera, domElement)
    this.prevTime = performance.now()
    scene.add(this.controls.getObject())
    this.watchEvent()
    this.raycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      10
    )
  }

  watchEvent () {
    document.addEventListener('keydown', this.onKeyDown.bind(this))
    document.addEventListener('keyup', this.onKeyUp.bind(this))
    document.addEventListener('click', () => {
      this.controls.lock()
    })
  }
  onKeyDown (event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = true
        break

      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = true
        break

      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = true
        break

      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = true
        break

      case 'Space':
        if (this.canJump === true) this.velocity.y += 350
        this.canJump = false
        break
    }
  }

  onKeyUp (event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = false
        break

      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = false
        break

      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = false
        break

      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = false
        break
    }
  }

  update (secs, { objects }) {
    const time = performance.now()
    const {
      velocity,
      direction,
      moveForward,
      moveBackward,
      moveLeft,
      moveRight,
      controls,
      raycaster
    } = this

    if (controls.isLocked) {
      // 通过射线来处理碰撞检测
      raycaster.ray.origin.copy(controls.getObject().position)
      // 防止相机在底部
      raycaster.ray.origin.y -= 10

      const intersections = raycaster.intersectObjects(objects, false)

      // 是否存在碰撞物体
      const onObject = intersections.length > 0

      // 根据时间间隔和速度来计算物体的位置和速度变化
      const delta = (time - this.prevTime) / 1000

      // 欧拉积分法来模拟物体运动的速度变化，使用负数可以通过方向来偏移
      velocity.x -= velocity.x * 10.0 * delta
      velocity.z -= velocity.z * 10.0 * delta

      velocity.y -= 9.8 * 100.0 * delta

      // 计算方向
      direction.z = Number(moveForward) - Number(moveBackward)
      direction.x = Number(moveRight) - Number(moveLeft)
      direction.normalize()

      // 根据按键输入方向、时间、系数来计算新的速度
      if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta
      if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta

      if (onObject === true) {
        velocity.y = Math.max(0, velocity.y)
        this.canJump = true
      }

      controls.moveRight(-velocity.x * delta)
      controls.moveForward(-velocity.z * delta)

      controls.getObject().position.y += velocity.y * delta // new behavior

      if (controls.getObject().position.y < 10) {
        velocity.y = 0
        controls.getObject().position.y = 10

        this.canJump = true
      }
    }

    this.prevTime = time
  }

  getControls () {
    return this.controls
  }
}
