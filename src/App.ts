// import View from './jump-game/View'
import View from './material-demo/View'

class App {
  private view: View

  constructor() {
    const canvas = <HTMLCanvasElement>document.getElementById('webgl-canvas')
    this.view = new View(canvas)

    window.addEventListener('resize', this.resize)
    this.update(0)
  }

  private resize = (): void => {
    this.view.onWindowResize(window.innerWidth, window.innerHeight)
  }

  private update = (t: number): void => {
    this.view.update(t / 1000)
    requestAnimationFrame(this.update)
  }
}

const app = new App()
