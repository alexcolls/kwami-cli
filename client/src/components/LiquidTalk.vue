<template>
  <div id="blob">
    <canvas class="z-50!" ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as THREE from "three";

const canvasRef = ref(null);
let speedSlider = ref(40);
let spikesSlider = ref(1);
let processingSlider = ref(1);

// Minimalistic implementation of noise function
function noise(x: number, y: number, z: number) {
  return Math.sin(x + y + z);
}

onMounted(() => {
  let renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    context: canvasRef.value.getContext("webgl2"),
    antialias: true,
    alpha: true,
  });

  renderer.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(
    45,
    canvasRef.value.clientWidth / canvasRef.value.clientHeight,
    0.1,
    1000
  );

  camera.position.z = 5;

  let geometry = new THREE.SphereGeometry(0.8, 128, 128);
  let material = new THREE.MeshPhongMaterial({
    color: 0xe4ecfa,
    shininess: 100,
  });

  let lightTop = new THREE.DirectionalLight(0xffffff, 0.7);
  lightTop.position.set(0, 500, 200);
  lightTop.castShadow = true;
  scene.add(lightTop);

  let lightBottom = new THREE.DirectionalLight(0xffffff, 0.25);
  lightBottom.position.set(0, -500, 400);
  lightBottom.castShadow = true;
  scene.add(lightBottom);

  let ambientLight = new THREE.AmbientLight(0x798296);
  scene.add(ambientLight);

  let sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  let update = () => {
    let time =
      performance.now() *
      0.00001 *
      speedSlider.value *
      Math.pow(processingSlider.value, 3);
    let spikes = spikesSlider.value * processingSlider.value;

    for (let i = 0; i < sphere.geometry.vertices.length; i++) {
      let p = sphere.geometry.vertices[i];
      p.normalize().multiplyScalar(
        1 + 0.3 * noise(p.x * spikes, p.y * spikes, p.z * spikes + time)
      );
    }

    sphere.geometry.computeVertexNormals();
    sphere.geometry.normalsNeedUpdate = true;
    sphere.geometry.verticesNeedUpdate = true;
  };

  let animate = () => {
    update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
});
</script>

<style>
#blob {
  position: relative;
}

#blob canvas {
  width: 1000px;
  margin-top: -7%;
}

@media (max-width: 1200px) {
  #blob canvas {
    margin-top: -10%;
    width: 800px;
  }
}

@media (max-width: 600px) {
  #blob canvas {
    width: 800px;
  }
}

.controls {
  background: #3f4656;
  display: flex;
  padding: 20px;
  border-radius: 10px;
  position: relative;
  z-index: 3;
  box-shadow: 0 4px 20px -1px rgba(18, 22, 33, 0.7);
}

@media (max-width: 1200px) {
  .controls {
    margin-top: -4%;
  }
}

@media (max-width: 600px) {
  .controls {
    flex-direction: column;
  }
}

.controls label {
  color: #cdd9ed;
  font-weight: 500;
  font-size: 14px;
  display: block;
  margin-bottom: 16px;
}

@media (max-width: 600px) {
  .controls label {
    margin-bottom: 12px;
  }
}

.controls [type="range"] {
  width: 160px;
}

@media (max-width: 600px) {
  .controls [type="range"] {
    width: 280px;
  }
}

.controls > div:not(:last-child) {
  margin-right: 20px;
}

@media (max-width: 600px) {
  .controls > div:not(:last-child) {
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

.rangeSlider .rangeSlider__fill {
  border-radius: 7px;
  background: #fff;
  position: absolute;
}

.rangeSlider .rangeSlider__fill:before {
  content: "";
  left: -2px;
  top: -2px;
  bottom: -2px;
  right: -2px;
  border: 2px solid #3f4656;
  border-radius: 6px;
  position: absolute;
}

.rangeSlider .rangeSlider__fill__horizontal {
  height: 100%;
  top: 0;
  left: 0;
}

.rangeSlider .rangeSlider__handle {
  border: 2px solid #3f4656;
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
  display: inline-block;
  width: 22px;
  height: 22px;
  position: absolute;
  background: white;
  border-radius: 50%;
}

.rangeSlider .rangeSlider__handle__horizontal {
  top: -7px;
}

html {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

*,
*:before,
*:after {
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
  font-family: "Source Sans Pro", Arial;
  background: #1c1f29;
}

body .dribbble {
  position: fixed;
  display: block;
  right: 20px;
  bottom: 20px;
}

body .dribbble img {
  display: block;
  height: 28px;
}
</style>