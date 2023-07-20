<template>
  <div id="blob">
    <canvas></canvas>
  </div>

  <div class="controls">
    <div>
      <label>Speed</label>
      <input type="range" min="10" max="120" value="50" step="1" name="speed">
    </div>
    <div>
      <label>Spikes</label>
      <input type="range" min=".05" max="2" value=".6" step=".05" name="spikes">
    </div>
    <div>
      <label>Processing</label>
      <input type="range" min=".6" max="2.4" value="1" step=".01" name="processing">
    </div>
    <div>
      <label>Color 1</label>
      <input type="color" value="#EE00FF" name="color1">
    </div>
    <div>
      <label>Color 2</label>
      <input type="color" value="#E4ECFA" name="color2">
    </div>
    <div>
      <label>Color 3</label>
      <input type="color" value="#04FF00" name="color3">
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createNoise3D } from 'simplex-noise';

let mainContainer: Ref<null | HTMLDivElement> = ref(null);
let canvas: Ref<null | HTMLCanvasElement> = ref(null);
let speed: Ref<number> = ref(0);
let spikes: Ref<number> = ref(0);
let processing: Ref<number> = ref(0);
let color1: Ref<string> = ref('#000000');
let color2: Ref<string> = ref('#000000');
let color3: Ref<string> = ref('#000000');

let noise3D: any;
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let geometry: THREE.SphereGeometry;
let lightTop: THREE.DirectionalLight;
let material: THREE.ShaderMaterial;
let lightBottom: THREE.DirectionalLight;
let ambientLight: THREE.AmbientLight;
let sphere: THREE.Mesh;
let plane: THREE.Mesh;
let controls: OrbitControls;

onMounted(() => {
  noise3D = createNoise3D();

  if (canvas.value) {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      context: canvas.value.getContext('webgl2') as WebGL2RenderingContext,
      antialias: true,
      alpha: true,
    });
  }

  if (mainContainer.value && renderer) {
    renderer.setSize(mainContainer.value.offsetWidth, mainContainer.value.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      45,
      mainContainer.value.offsetWidth / mainContainer.value.offsetHeight,
      0.1,
      1000
    );

    camera.position.z = 5;

    geometry = new THREE.SphereGeometry(0.8, 128, 128);

    lightTop = new THREE.DirectionalLight(0xffffff, 0.7);
    lightTop.position.set(0, 500, 200);
    lightTop.castShadow = true;
    lightTop.shadow.mapSize.width = 4048;
    lightTop.shadow.mapSize.height = 4048;
    lightTop.shadow.camera.near = 0;
    lightTop.shadow.camera.far = 1000;
    lightTop.shadow.camera.left = -200;
    lightTop.shadow.camera.right = 200;
    lightTop.shadow.camera.top = 200;
    lightTop.shadow.camera.bottom = -200;
    scene.add(lightTop);

    let vertexShader = `
    varying vec3 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = position;
      vNormal = normalize(normalMatrix * normal);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `;

    const color1Uniform: THREE.IUniform<THREE.Color> = { value: new THREE.Color(color1.value) };
    const color2Uniform: THREE.IUniform<THREE.Color> = { value: new THREE.Color(color2.value) };
    const color3Uniform: THREE.IUniform<THREE.Color> = { value: new THREE.Color(color3.value) };
    const lightPosUniform: THREE.IUniform<THREE.Vector3> = { value: lightTop.position };
    const specColorUniform: THREE.IUniform<THREE.Color> = { value: new THREE.Color(0xffffff) };
    const shininessUniform: THREE.IUniform<number> = { value: 100 };

    material = new THREE.ShaderMaterial({
      uniforms: {
        color1: color1Uniform,
        color2: color2Uniform,
        color3: color3Uniform,
        lightPosition: lightPosUniform,
        specularColor: specColorUniform,
        shininess: shininessUniform,
      },
      vertexShader: vertexShader,
      fragmentShader: `
        varying vec3 vUv;
        varying vec3 vNormal;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform vec3 lightPosition;
        uniform vec3 specularColor;
        uniform float shininess;

        void main() {
            vec3 lightDir = normalize(lightPosition - vUv);
            vec3 viewDir = normalize(-vUv);
            vec3 reflectDir = reflect(-lightDir, vNormal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
            vec3 specular = specularColor * spec;

            float t = 0.3*(vNormal.z + 1.0);
            vec3 mixColor1 = mix(color1, color2, vNormal.y*t);
            vec3 mixColor2 = mix(color1, color3, t);
            vec3 color = mix(mixColor1, mixColor2, t) + specular;

            gl_FragColor = vec4(color, 1.0);
        }
      `,
      wireframe: false,
    });

    lightBottom = new THREE.DirectionalLight(0xffffff, 0.25);
    lightBottom.position.set(0, -500, 400);
    lightBottom.castShadow = true;
    lightBottom.shadow.mapSize.width = 5048;
    lightBottom.shadow.mapSize.height = 5048;
    lightBottom.shadow.camera.near = 0.5;
    lightBottom.shadow.camera.far = 1000;
    lightBottom.shadow.camera.left = -200;
    lightBottom.shadow.camera.right = 200;
    lightBottom.shadow.camera.top = 200;
    lightBottom.shadow.camera.bottom = -200;
    scene.add(lightBottom);

    ambientLight = new THREE.AmbientLight(0x798296);
    scene.add(ambientLight);

    sphere = new THREE.Mesh(geometry, material);
    sphere.castShadow = true;
    scene.add(sphere);

    let planeGeometry = new THREE.PlaneGeometry(1, 1);
    let planeMaterial = new THREE.MeshPhongMaterial({ color: "#1c1f29" });
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.y = -3;
    scene.add(plane);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.1;

    animate();
  }
});

const update = () => {
  let time =
    (performance.now() * 0.0001 * speed.value * 0.2) / (processing.value + 1);
  let spikesVal = Math.pow(spikes.value, 0.6);
  let animSpeed = 0.35;

  sphere.geometry = new THREE.SphereGeometry(
    0.8,
    64,
    64,
    0,
    Math.PI * 2,
    0,
    Math.PI * 2
  );

  for (let i = 0; i < sphere.geometry.vertices.length; i++) {
    let p = sphere.geometry.vertices[i];
    p.normalize().multiplyScalar(
      1 +
      0.3 * simplex.noise3D(p.x * spikes, p.y * spikes, p.z * spikes + time)
    );
  }

  sphere.geometry.computeVertexNormals();
  sphere.geometry.normalsNeedUpdate = true;
  sphere.geometry.verticesNeedUpdate = true;
};

const rotateCamera = () => {
  let time = performance.now() * 0.0001 * speed.value;
  camera.position.x = Math.cos(time) * 5;
  camera.position.z = Math.sin(time) * 5;
  camera.lookAt(scene.position);
};

const updateUniforms = () => {
  sphere.material.uniforms.color1.value = new THREE.Color(color1.value);
  sphere.material.uniforms.color2.value = new THREE.Color(color2.value);
  sphere.material.uniforms.color3.value = new THREE.Color(color3.value);
};

const animate = () => {
  update();
  rotateCamera();
  updateUniforms();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

onBeforeUnmount(() => {
  cancelAnimationFrame(animate);
});
</script>

<style scoped>
#blob {
  position: relative;
}

#blob canvas {
  width: 1000px;
  height: 800px;
}

/* @media(max-width: 1200px) {
  #blob canvas {
    margin-top: -10%;
    width: 800px;
  }
}

@media(max-width: 600px) {
  #blob canvas {
    width: 800px;
  }
} */

.controls {
  background: hsl(222, 15%, 29%);
  display: flex;
  padding: 20px;
  border-radius: 10px;
  position: relative;
  z-index: 3;
  box-shadow: 0 4px 20px -1px rgba(18, 22, 33, .7);
  margin-top: 10%;
}

@media(max-width: 600px) {
  .controls {
    flex-direction: column;
  }
}

.controls label {
  color: #CDD9ED;
  font-weight: 500;
  font-size: 14px;
  display: block;
  margin-bottom: 16px;
}

@media(max-width: 600px) {
  .controls label {
    margin-bottom: 12px;
  }
}

.controls [type="range"] {
  width: 160px;
}

@media(max-width: 600px) {
  .controls [type="range"] {
    width: 280px;
  }
}

.controls>div:not(:last-child) {
  margin-right: 20px;
}

@media(max-width: 600px) {
  .controls>div:not(:last-child) {
    margin: 0 0 24px 0;
  }
}

.rangeSlider {
  position: relative;
  background: none;
  border: 1px solid #fff;
  border-radius: 6px;
  cursor: pointer;
}

.rangeSlider.rangeSlider__horizontal {
  height: 10px;
  width: 160px;
}

.rangeSlider__fill {
  border-radius: 7px;
  background: #fff;
  position: absolute;
}

.rangeSlider__fill:before {
  content: '';
  left: -2px;
  top: -2px;
  bottom: -2px;
  right: -2px;
  border: 2px solid #3F4656;
  border-radius: 6px;
  position: absolute;
}

.rangeSlider__fill__horizontal {
  height: 100%;
  top: 0;
  left: 0;
}

.rangeSlider__handle {
  border: 2px solid #3F4656;
  cursor: grab;
  display: inline-block;
  width: 22px;
  height: 22px;
  position: absolute;
  background: white;
  border-radius: 50%;
}

.rangeSlider__handle__horizontal {
  top: -7px;
}

html {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

* {
  box-sizing: inherit;
}

html,
body {
  overflow: hidden;
}

body {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Source Sans Pro', Arial;
  background: #1c1f29;
}
</style>
../../node_modules/@types/three