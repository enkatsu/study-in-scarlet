import "./index.css";
import * as THREE from 'three';
const OrbitControls = require('three-orbit-controls')(THREE);
import * as dat from 'dat.gui';

window.onload = (ev) => {
  const guiText = function() {
    this.rotateSpeed = 0.001;
    this.autoRotate = false;
    this.explode = function() {};
  };
  const text = new guiText();
  const gui = new dat.GUI();
  gui.add(text, 'rotateSpeed', 0.0, 0.01);
  gui.add(text, 'autoRotate');
  gui.add(text, 'explode');

  const radians = degree => degree * (Math.PI / 180);
  const scene = new THREE.Scene();
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  const controls = new OrbitControls(camera, renderer.domElement);
  const axis = new THREE.AxesHelper(100);
  const light = new THREE.DirectionalLight(0xb4e7f2, 1.5);
  light.position.set(1, 1, 1);
  light.target.position.set(0, 0, 0);
  scene.add(axis);
  scene.add(light);
  scene.add(light.target);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  camera.position.set(50, 50, 200);

  const BG_IMAGE_URL = 'bg.jpg';
  const VERT_URL = 'shader/bg.frag';
  const FRAG_URL = 'shader/bg.vert';
  const uniforms = {
    time: {
      type: 'f',
      value: 1.0
    },
    resolution: {
      type: 'v2',
      value: new THREE.Vector2()
    }
  };
  const backgroundScene = new THREE.Scene();
  const backgroundCamera = new THREE.Camera();
  const bgTexture = THREE.ImageUtils.loadTexture(BG_IMAGE_URL);
  const bgMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vs').textContent,
    fragmentShader: document.getElementById('fs').textContent
  });
  const backgroundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 0),
    bgMaterial
  );
  backgroundMesh.material.depthTest = false;
  backgroundMesh.material.depthWrite = false;
  backgroundScene.add(backgroundMesh);
  backgroundScene.add(backgroundCamera);

  const fileLoader = new THREE.FileLoader();
  const KANJI_JSON_URL = 'kanji-average.json';
  const FONT_JSON_URL = 'fonts/IPAGothic_Regular.json';
  fileLoader.load(KANJI_JSON_URL, (data) => {
      const fontLoader = new THREE.FontLoader();
      fontLoader.load(FONT_JSON_URL, (font) => {
        const kanjis = JSON.parse(data).kanjis;
        const meshs = kanjis.map(kanji => {
          const geometory = new THREE.TextGeometry(kanji.name, {
            font: font,
            size: 20,
            height: 5,
            curveSegments: 12
          });
          const materials = [
            new THREE.MeshBasicMaterial({
              color: parseInt(`0x${kanji.hex}`)
            }),
            new THREE.MeshBasicMaterial({
              color: 0x000000
            })
          ];
          const mesh = new THREE.Mesh(geometory, materials);
          const scale = 500;
          const h = radians(kanji.hls[0]);
          const l = kanji.hls[1] / 100.0;
          const s = kanji.hls[2] / 100.0;
          const z = Math.cos(h) * s * scale / 2;
          const x = Math.sin(h) * s * scale / 2;
          const y = l * scale - scale / 2;
          mesh.position.set(x, y, z);
          // mesh.position.set(...kanji.rgb);
          mesh.name = `kanji-${kanji.name}`;
          return mesh;
        });
        const kanjiGroup = new THREE.Group();
        kanjiGroup.name = 'kanji-group';
        kanjiGroup.add(...meshs)
        scene.add(kanjiGroup);
      });
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    },
    (err) => {
      console.error('An error happened', err)
    }
  );

  const render = () => {
    uniforms.time.value += 0.05;
    requestAnimationFrame(render);
    controls.update();
    const kanjiGroup = scene.getObjectByName('kanji-group');
    if (kanjiGroup) {
      if (text.autoRotate) {
        kanjiGroup.rotation.y += text.rotateSpeed;
      }
      for (const child of kanjiGroup.children) {
        child.lookAt(camera.position);
      }
    }
    // renderer.setClearColor(0xaabbcc, 1.0);
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(backgroundScene, backgroundCamera);
    renderer.render(scene, camera);
  };

  const onWindowResize = (event) => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.resolution.value.x = renderer.domElement.width;
    uniforms.resolution.value.y = renderer.domElement.height;
  };
  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);
  render();
};
