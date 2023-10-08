import * as THREE from 'three'

import vertShader from './glsl/torus.vs'
import fragShader from './glsl/torus.fs'
import { randInt } from 'Utils'

export default class Shape {
  mesh: THREE.Mesh
  timeU: THREE.IUniform

  constructor (parentScene: THREE.Scene) {
    const geom = new THREE.TorusKnotGeometry(3, 1, 128, 32)
    const mat = new THREE.RawShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: vertShader,
      fragmentShader: fragShader
    })
    this.timeU = mat.uniforms.time
    this.mesh = new THREE.Mesh(geom, mat)
    parentScene.add(this.mesh)
  }

  update (secs: number) {
    this.timeU.value = secs
    this.mesh.rotation.set(
      Math.sin(secs / 10) * 2 * Math.PI,
      Math.cos(secs / 10) * 2 * Math.PI,
      0
    )
  }
}
