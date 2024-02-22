import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Option } from "./option";
import { generateGrid } from "./grid";
import { generateAxis } from "./axis";
import { EventHandler } from "./EventHandler";
import { loadFont } from "./loader";
import { generateLine, genetateText } from "./draw";

export default class BarView extends EventHandler {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  group: THREE.Group;
  texts: THREE.Mesh[] = [];
  hoverText = null;

  lineGroup: THREE.Group;
  guideGroup: THREE.Group;

  directionalLight: THREE.DirectionalLight;
  plane: THREE.LineSegments;
  option: Option;
  font: any;
  rectInfo = {
    w: 100,
    h: 100,
    depth: 100,
  };
  planeWidth = 2000;
  planeHeight = 1000;
  list = [];
  xAxis = [];
  yAxis = [];
  zAxis = [];
  // 从左到右强度越大
  colors = [];

  xNum = 0;
  yNum = 0;
  xSize = 0;
  ySize = 0;

  maxVal = 0;
  axisToLabelSize = 140;
  userData: any = {};
  uuid = "";
  distanceX = 0;
  distanceZ = 0;

  constructor(canvasElem: HTMLCanvasElement, option: Option) {
    super();
    // 处理外部配置
    this.option = option;
    this.list = option.list;
    this.xAxis = option.xAxis;
    this.yAxis = option.yAxis;
    this.zAxis = option.zAxis;
    this.yNum = option.list.length;
    this.colors = option.colors;
    this.handleOption();
    this.xSize = this.planeWidth / this.xNum;
    this.ySize = this.planeHeight / this.yNum;

    // 渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElem,
      antialias: true,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // 场景
    this.scene = new THREE.Scene();
    this.group = new THREE.Group();
    this.guideGroup = new THREE.Group();

    this.scene.add(this.group);
    this.scene.add(this.guideGroup);

    // 重置坐标位置
    this.resetPosition(this.group);
    this.resetPosition(this.guideGroup);

    // 相机
    this.camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      40000
    );
    this.camera.position.set(1000, 3200, 2000);

    this.initLoad();
  }

  resetPosition(group) {
    group.position.set(-this.planeWidth / 2, 0, this.planeHeight / 2);
  }

  async initLoad() {
    this.font = await loadFont();
    this.loadLight();
    this.loadModel();
    this.loadControl();
  }
  /**
   * 加载矩形
   */
  loadRect() {
    const { depth, w, h } = this.rectInfo;

    let x = 0;
    let z = 0;
    let xSize = this.planeWidth / this.xNum;
    let zSize = this.planeHeight / this.yNum;

    this.distanceX = (xSize - this.rectInfo.w) * 0.5;
    this.distanceZ = (zSize - this.rectInfo.h) * 0.5;

    for (let i = 0; i < this.xNum; i++) {
      x = xSize * i + this.distanceX + this.rectInfo.w / 2;

      for (let j = 0; j < this.yNum; j++) {
        z = zSize * j + this.distanceZ + this.rectInfo.h / 2;
        const item = this.list[j][i];

        const geometry = new THREE.BoxGeometry(w, item.val, depth);
        const material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(this.calcColor(item)),
          clearcoat: 1,
          clearcoatRoughness: 1,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.name = "cube";
        cube.userData = { ...cube.userData, item: item };
        cube.position.y = item.val / 2;
        cube.position.z = -z;
        cube.position.x = x;
        cube.castShadow = true;
        cube.receiveShadow = true;
        this.group.add(cube);
      }
    }
  }

  loadAxis() {
    this.loadAxisX();
    this.loadAxisY();
    this.loadAxisZ();
  }
  loadAxisZ() {
    const { axisGroup, texts } = generateAxis({
      scene: this.scene,
      lineSize: this.planeHeight,
      labels: this.zAxis,
      positionType: "outer",
      tickSize: 40,
      textOption: {
        font: this.font,
        size: 50,
      },
      direction: "y",
    });
    axisGroup.position.z = this.planeHeight / 2;
    axisGroup.position.x -= this.planeWidth / 2;
    axisGroup.rotateZ(Math.PI * 0.5);

    texts.forEach((text) => {
      text.position.x -= this.planeWidth / 2;
      text.position.y += this.maxVal / 2;
      text.position.z += this.planeHeight / 2 + this.axisToLabelSize;
    });
    this.texts.push(...texts);
    this.scene.add(axisGroup);
    this.scene.add(...texts);
  }
  loadAxisY() {
    const { axisGroup, texts } = generateAxis({
      scene: this.scene,
      lineSize: this.planeHeight,
      labels: this.yAxis.reverse(),
      positionType: "outer",
      tickSize: 40,
      textOption: {
        font: this.font,
        size: 50,
      },
      direction: "z",
    });
    axisGroup.position.z = this.planeHeight / 2;
    axisGroup.position.x = this.planeWidth - this.planeWidth / 2;
    axisGroup.rotateY(Math.PI * 0.5);

    texts.forEach((text) => {
      text.position.x += this.planeWidth / 2 + this.axisToLabelSize;
    });
    this.texts.push(...texts);
    this.scene.add(axisGroup);
    this.scene.add(...texts);
  }
  loadAxisX() {
    const { axisGroup, texts } = generateAxis({
      scene: this.scene,
      lineSize: this.planeWidth,
      labels: this.xAxis,
      positionType: "outer",
      tickSize: 40,
      textOption: {
        font: this.font,
        size: 50,
      },
      direction: "x",
    });
    axisGroup.position.x -= this.planeWidth / 2;
    axisGroup.position.z = this.planeHeight / 2;
    texts.forEach(
      (text) => (text.position.z = this.planeHeight / 2 + this.axisToLabelSize)
    );
    this.texts.push(...texts);
    this.scene.add(axisGroup);
    this.scene.add(...texts);
  }
  loadGrid() {
    const lineBottomGroup = generateGrid(
      this.scene,
      this.planeWidth,
      this.planeHeight,
      this.xNum,
      this.yNum
    );
    const lineBackGroup = generateGrid(
      this.scene,
      this.planeWidth,
      this.planeHeight,
      this.xNum,
      this.yNum
    );
    lineBackGroup.rotateX(Math.PI / 2);
    lineBackGroup.position.z = -this.planeHeight / 2;

    const lineLeftGroup = generateGrid(
      this.scene,
      this.planeHeight,
      this.planeHeight,
      this.yNum,
      this.yNum
    );
    lineLeftGroup.rotateZ(Math.PI / 2);
    lineLeftGroup.position.x = -this.planeHeight;
  }
  /**
   * 加载平面
   */
  loadPlane() {
    const geometry = new THREE.PlaneGeometry(
      this.planeWidth,
      this.planeHeight,
      10,
      10
    );
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({
      color: 0x4c9a14,
      side: THREE.DoubleSide,
    });
    this.plane = new THREE.LineSegments(edgesGeometry, material);
    this.plane.receiveShadow = true;
    this.plane.castShadow = true;
    this.plane.rotateX(Math.PI / 2);
    this.scene.add(this.plane); // 将平面模型添加到场景中
  }

  /**
   * 加载方向光
   */
  loadDirectLight() {
    const d = 2000;
    const mapSize = 2048;

    const light = new THREE.DirectionalLight(0xd5deff);
    light.intensity = 10;
    light.position.x = 1300;
    light.position.y = 3000;
    light.position.z = 1500;
    light.castShadow = true;
    light.shadow.mapSize.width = mapSize;
    light.shadow.mapSize.height = mapSize;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.near = 0;
    light.shadow.camera.far = 5000;
    light.shadow.radius = 3;
    light.shadow.bias = -0.01;
    this.scene.add(light);
  }

  /**
   * 加载点光源
   */
  loadPointLight() {
    // const light = new THREE.PointLight(0xffffff, 4, 0, 0.02);
    // light.position.set(1300, 1400, 1500);
    // this.scene.add(light);
  }
  /**
   * 环境光
   */
  loadEnvLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
  }
  /**
   * 加载穹顶
   */
  loadSkyDome() {
    const topColor = new THREE.Color(0xd5deff);
    const bottomColor = new THREE.Color(0xffffff);
    const offset = 1200;
    const exponent = 0.6;
    const material = new THREE.MeshStandardMaterial({
      side: THREE.BackSide,
      //@ts-ignore
      onBeforeCompile: (shader) => {
        shader.uniforms.topColor = { value: topColor };
        shader.uniforms.bottomColor = { value: bottomColor };
        shader.uniforms.offset = { value: offset };
        shader.uniforms.exponent = { value: exponent };
        shader.vertexShader = `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
        shader.fragmentShader = `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = clamp((vWorldPosition.y + offset) / (30.0 * offset), 0.0, 1.0);
          gl_FragColor = vec4(mix(bottomColor, topColor, pow(h, exponent)), 1.0);
        }
      `;
      },
    });
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(6000, 32, 32),
      material
    );
    this.scene.add(sky);
  }

  /**
   * 处理外部配置
   */
  handleOption() {
    // 计算x的最大个数
    for (let i = 0; i < this.list.length; i++) {
      this.xNum = Math.max(this.list[i].length, this.xNum);
      for (let j = 0; j < this.list[i].length; j++) {
        this.maxVal = Math.max(this.maxVal, this.list[i][j].val);
      }
    }
  }

  /**
   * 计算颜色级别
   * @param item
   * @returns
   */
  calcColor(item) {
    const size = this.maxVal / this.colors.length;
    const v = Math.floor(item.val / size);
    return this.colors[v <= 1 ? 0 : v - 1];
  }
  /**
   * 加载光源
   */
  loadLight() {
    this.loadEnvLight();
    this.loadDirectLight();
    this.loadPointLight();
  }
  /**
   * 加载模型
   */
  async loadModel() {
    this.loadSkyDome();
    this.loadRect();
    // this.loadPlane();
    this.loadGrid();
    this.loadAxis();
  }

  /**
   * 加载控制器
   */
  loadControl() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 40000;
  }
  /**
   * 清理引导线
   */
  clearGuideGroup() {
    while (this.guideGroup.children.length > 0) {
      const child = this.guideGroup.children[0];
      this.guideGroup.remove(child);
    }

    if (this.hoverText) {
      this.scene.remove(this.hoverText);
    }
  }
  /**
   * 处理高亮效果
   */
  handleHightlight() {
    const { camera, scene } = this;
    const target: THREE.Mesh | undefined = this.raycast(
      scene,
      camera
    ) as THREE.Mesh;
    if (target) {
      // 存储老旧的uuid，一旦不一样将原来的颜色修改
      if (this.uuid && target.uuid && target.uuid !== this.uuid) {
        const matchedObject = scene.getObjectByProperty("uuid", this.uuid);
        if (matchedObject) {
          // @ts-ignore
          matchedObject.material.color = new THREE.Color(
            this.calcColor(this.userData.item)
          );
        }
      }
      // @ts-ignore
      target.material.color = new THREE.Color(0xff0000);

      this.uuid = target.uuid;
      this.userData = target.userData;

      // 激活状态
      this.clearGuideGroup();

      const position = target.position.clone();
      const item = target.userData.item;
      // 中心点
      const center = {
        x: position.x,
        y: position.y + item.val / 2,
        z: position.z,
      };

      const guides = [];

      // x guide
      let line = generateLine(
        [0, center.y, center.z],
        [center.x, center.y, center.z]
      );
      guides.push(line);

      // y guide
      line = generateLine(
        [center.x, center.y, -this.planeHeight],
        [center.x, center.y, center.z]
      );
      guides.push(line);

      // x mesh horizon guide
      line = generateLine(
        [0, center.y, -this.planeHeight],
        [this.planeWidth, center.y, -this.planeHeight]
      );
      guides.push(line);

      // x mesh vertical guide
      line = generateLine(
        [center.x, 0, -this.planeHeight],
        [center.x, this.maxVal, -this.planeHeight]
      );
      guides.push(line);

      // y mesh horizon guide
      line = generateLine([0, center.y, 0], [0, center.y, -this.planeHeight]);
      guides.push(line);

      // y mesh vertical guide
      line = generateLine([0, 0, center.z], [0, this.maxVal, center.z]);
      guides.push(line);

      const val = String(item.val);
      const text = genetateText({
        text: val,
        size: 100,
        font: this.font,
        color: 0xa50026,
      });
      const offset = val.length * 35;
      this.hoverText = text;
      this.resetPosition(this.hoverText);
      text.position.x += center.x - offset;
      text.position.y += center.y + 100;
      text.position.z += center.z;

      this.scene.add(text);

      this.guideGroup.add(...guides);
    } else {
      this.clearGuideGroup();
    }
  }

  /**
   * 更新
   * @param secs
   */
  update(secs: number) {
    const { camera, scene, renderer, group } = this;
    renderer.render(scene, camera);
    this.texts &&
      this.texts.forEach((text) => {
        text.rotation.set(0, camera.rotation.y, 0);
      });
    this.handleHightlight();

    this.hoverText && this.hoverText.rotation.set(0, camera.rotation.y, 0);
  }

  /**
   * 监听窗口变化
   * @param vpW
   * @param vpH
   */
  onWindowResize(vpW: number, vpH: number) {
    this.camera.aspect = vpW / vpH;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(vpW, vpH);
  }
}
