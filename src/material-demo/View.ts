import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CubeTextureLoader } from "three/src/loaders/CubeTextureLoader";
import { FlakesTexture } from "three/examples/jsm/textures/FlakesTexture";
import { HDRCubeTextureLoader } from "three/examples/jsm/loaders/HDRCubeTextureLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Water } from "three/examples/jsm/objects/Water2";
export default class View {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  group: THREE.Group;
  particleLight: THREE.Mesh;

  constructor(canvasElem: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElem,
      antialias: true,
    });
    this.renderer.shadowMap.enabled = true;
    this.camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      0.25,
      50
    );
    this.camera.position.z = 10;
    // 场景
    this.scene = new THREE.Scene();
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.loadTexture();
    this.loadControl();
    this.loadLight();

    // 适配缩放
    this.onWindowResize(window.innerWidth, window.innerHeight);
  }
  loadTexture() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    new RGBELoader().load(
      "textures/st_peters_square_night_1k.hdr",
      (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        this.scene.environment = envMap;
        this.scene.background = envMap;

        const geometry = new THREE.SphereGeometry(0.8, 64, 32);
        const textureLoader = new THREE.TextureLoader();
        // 车漆材质
        const normalMap = new THREE.CanvasTexture(new FlakesTexture());
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.repeat.x = 10;
        normalMap.repeat.y = 6;
        normalMap.anisotropy = 16;

        const clearcoatNormalMap = textureLoader.load(
          "textures/pbr/Scratched_gold/Scratched_gold_01_1K_Normal.png"
        );
        const roughnessMap = textureLoader.load(
          "textures/pbr/Scratched_gold/Scratched_gold_01_1K_Roughness.png"
        );
        const colorMap = textureLoader.load(
          "textures/pbr/Scratched_gold/Scratched_gold_01_1K_Base_Color.png"
        );
        const bumpMap = textureLoader.load(
          "textures/pbr/Scratched_gold/Scratched_gold_01_1K_Height.png"
        );
        const aoMap = textureLoader.load(
          "textures/pbr/Scratched_gold/Scratched_gold_01_1K_AO.png"
        );

        let material = new THREE.MeshPhysicalMaterial({
          // 光泽强度
          clearcoat: 1,
          // 光泽的粗糙度
          clearcoatRoughness: 0,
          // 金属度
          metalness: 1,
          // 粗糙度
          roughness: 0.5,
          color: 0x0000ff,
          // 法线贴图
          normalMap: normalMap,
          // 法线贴图尺寸
          normalScale: new THREE.Vector2(0.15, 0.15),
        });

        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = -1;
        mesh.position.y = 1;
        this.group.add(mesh);

        // 金属材质
        const metalnessMetalMap = textureLoader.load(
          "textures/metal/MetalSteelBrushed001_METALNESS_2K_METALNESS.png"
        );
        const roughnessMetalMap = textureLoader.load(
          "textures/metal/MetalSteelBrushed001_ROUGHNESS_2K_METALNESS.png"
        );
        const colorMetalMap = textureLoader.load(
          "textures/metal/MetalSteelBrushed001_COL_2K_METALNESS.png"
        );
        const bumpMetalMap = textureLoader.load(
          "textures/metal/MetalSteelBrushed001_BUMP_2K_METALNESS.png"
        );
        const normalMetalMap = textureLoader.load(
          "textures/metal/MetalSteelBrushed001_NRM_2K_METALNESS.png"
        );
        const dispMetalMap = textureLoader.load(
          "textures/metal/MetalSteelBrushed001_DISP_2K_METALNESS.png"
        );
        material = new THREE.MeshPhysicalMaterial({
          // 颜色通道贴图
          map: colorMetalMap,
          // 设置金属度为1，表示完全是金属
          metalness: 1,
          // 设置粗糙度，值越低越光滑
          roughnessMap: roughnessMetalMap,
          normalMap: normalMetalMap,
          // 法线贴图尺寸
          normalScale: new THREE.Vector2(2, 2),
          // 环境贴图的强度
          envMapIntensity: 0.5,
          // 控制不同区域的金属反射效果
          metalnessMap: metalnessMetalMap,
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = 1;
        mesh.position.y = 1;
        this.group.add(mesh);

        // 自发光材质
        material = new THREE.MeshPhysicalMaterial({
          emissive: 0xffffff, // 设置自发光的颜色
          emissiveIntensity: 11111, // 设置自发光的强度
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = -1;
        mesh.position.y = -1;
        this.group.add(mesh);

        // 玻璃材质
        material = new THREE.MeshPhysicalMaterial({
          transmission: 1,
          roughness: 0,
          ior: 1.7,
          reflectivity: 1,
          color: new THREE.Color(1, 0, 1),
        });
        material.thickness = 0.5;

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = 1;
        mesh.position.y = -1;
        this.group.add(mesh);

        // 草地材质
        const colorGreenMap = textureLoader.load(
          "textures/green/GroundGrassGreen002_COL_2K.jpg"
        );
        const bumpGreenMap = textureLoader.load(
          "textures/green/GroundGrassGreen002_BUMP_2K.jpg"
        );
        const normalGreenMap = textureLoader.load(
          "textures/green/GroundGrassGreen002_NRM_2K.jpg"
        );
        const aoGreenMap = textureLoader.load(
          "textures/green/GroundGrassGreen002_AO_2K.jpg"
        );
        const dispGreenMap = textureLoader.load(
          "textures/green/GroundGrassGreen002_DISP_2K.jpg"
        );
        material = new THREE.MeshPhysicalMaterial({
          map: colorGreenMap,
          bumpMap: bumpGreenMap,
          normalMap: normalGreenMap,
          aoMap: aoGreenMap,
          normalScale: new THREE.Vector2(5, 5),
          envMapIntensity: 0.5,
          // displacementMap: dispGreenMap,
          // displacementBias: 0.2,
          // displacementScale: 2,
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = 3;
        mesh.position.y = 1;
        this.group.add(mesh);

        // 砖墙材质
        const colorBrickMap = textureLoader.load(
          "textures/brick/BricksReclaimedWhitewashedOffset001_COL_2K_METALNESS.png"
        );
        const bumpBrickMap = textureLoader.load(
          "textures/brick/BricksReclaimedWhitewashedOffset001_COL_2K_METALNESS.png"
        );
        const normalBrickMap = textureLoader.load(
          "textures/brick/BricksReclaimedWhitewashedOffset001_NRM_2K_METALNESS.png"
        );
        const aoBrickMap = textureLoader.load(
          "textures/brick/BricksReclaimedWhitewashedOffset001_AO_2K_METALNESS.png"
        );
        const roughnessBrickMap = textureLoader.load(
          "textures/brick/BricksReclaimedWhitewashedOffset001_ROUGHNESS_2K_METALNESS.png"
        );
        let maps = [colorBrickMap, bumpBrickMap, normalBrickMap, aoBrickMap];
        maps.forEach((map) => {
          map.wrapS = THREE.RepeatWrapping;
          map.wrapT = THREE.RepeatWrapping;
          map.repeat.set(0.5, 0.5);
        });

        material = new THREE.MeshPhysicalMaterial({
          map: colorBrickMap,
          normalMap: normalBrickMap,
          aoMap: aoBrickMap,
          envMapIntensity: 0.5,
          roughnessMap: roughnessBrickMap,
          roughness: 0.8,
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = 3;
        mesh.position.y = -1;
        this.group.add(mesh);

        // 水体材质
        const waterMap = textureLoader.load("textures/normal/water.jpg");
        const waterOptions = {
          color: "#abcdef", // 水体颜色
          scale: 0.1, // 波浪大小, 值越小越明显
          flowDirection: new THREE.Vector2(1, 1), // 水流方向
          textureWidth: 1024, // 纹理宽度
          textureHeight: 1024, // 纹理高度
          normalMap0: waterMap,
          normalMapUrl0: waterMap,
          envMap: envMap, // 反射天空盒的立方体纹理
          receiveShadow: true, // 是否接收阴影
          distortionScale: 3.7, // 扭曲效果的大小
        };

        // 创建 Water 对象
        const water = new Water(geometry, waterOptions);
        water.position.x = -3;
        water.position.y = -1;
        this.group.add(water);

        // 大理石材质
        const colorStoneMap = textureLoader.load(
          "textures/Stone/QuartziteDenali002_COL_8K_METALNESS.png"
        );
        const normalStoneMap = textureLoader.load(
          "textures/Stone/QuartziteDenali002_NRM_8K_METALNESS.png"
        );
        const roughnessStoneMap = textureLoader.load(
          "textures/Stone/QuartziteDenali002_ROUGHNESS_8K_METALNESS.png"
        );
        maps = [colorStoneMap, normalStoneMap, roughnessStoneMap];
        maps.forEach((map) => {
          map.wrapS = THREE.RepeatWrapping;
          map.wrapT = THREE.RepeatWrapping;
          map.repeat.set(0.5, 0.5);
        });

        material = new THREE.MeshPhysicalMaterial({
          map: colorStoneMap,
          normalMap: normalStoneMap,
          envMapIntensity: 0.5,
          roughnessMap: roughnessStoneMap,
          roughness: 0.8,
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = -3;
        mesh.position.y = 1;
        this.group.add(mesh);

        texture.dispose();
        envMap.dispose();
      }
    );
  }
  loadLight() {
    this.particleLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    this.scene.add(this.particleLight);

    this.particleLight.add(new THREE.PointLight(0xffffff, 60));
  }
  loadControl() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.minDistance = 3;
    controls.maxDistance = 30;
  }

  onWindowResize(vpW: number, vpH: number) {
    // 确保渲染器的输出和窗口大小匹配
    this.renderer.setSize(vpW, vpH);
    // 更新相机的纵横比
    this.camera.aspect = vpW / vpH;
    // 更新投影矩阵
    this.camera.updateProjectionMatrix();
  }

  // 所有子物体的更新
  update(secs: number) {
    const { camera, scene, renderer, particleLight, group } = this;

    const timer = Date.now() * 0.00025;
    if (particleLight) {
      particleLight.position.x = Math.sin(timer * 7) * 3;
      particleLight.position.y = Math.cos(timer * 5) * 4;
      particleLight.position.z = Math.cos(timer * 3) * 3;
    }

    for (let i = 0; i < group.children.length; i++) {
      const child = group.children[i];
      child.rotation.y += 0.005;
    }
    renderer.render(scene, camera);
  }
}
