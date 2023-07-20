<template>
  <div id="canvas" ref="canvas" class="m-0"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import * as THREE from "three";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

export default defineComponent({
  setup() {
    let SCENE: THREE.Scene;
    let CAMERA: THREE.PerspectiveCamera;
    let RENDERER: THREE.WebGLRenderer;
    let CONTROLS: OrbitControls;
    let COMPOSER: EffectComposer;
    let TIME = 0; // Let it be non-zero at start
    const ROTATION_SPEED = 0.1;
    const AMPLITUDE = 0.1;
    const canvas = ref(null);
    const modelCoordinates = ref({ x: 0, y: 150, z: 150 });

    const config = {
      vecColor1: "vec3(0.5, 1, 0.1)",
      vecColor2: "vec3(0.8, 0.7, 0.1)",
      colorDir: "z",
      colorSplit: 0.8,
      sphereForm: { x: 30, y: 200, z: 100 },
      cameraPosition: { x: 100, y: 150, z: 0 },
      material: { x: 3, y: 5, z: 0.7 },
      vertexXYZ: { x: 2, y: 10, z: 10 },
      speedEffect: 3,
      transparentMaterial: true,
      canvasBackground: 0,
    };

    const listening = {
      vecColor1: "vec3(0.5, 0.1, 0.1)",
      vecColor2: "vec3(0.8, 0.7, 0.1)",
      colorDir: "z",
      colorSplit: 0.8,
      sphereForm: { x: 30, y: 100, z: 100 },
      cameraPosition: { x: 0, y: 75, z: 150 },
      material: { x: 3, y: 5, z: 1 },
      vertexXYZ: { x: 2, y: 5, z: 10 },
      speedEffect: 3,
      transparentMaterial: false,
      canvasBackground: 0,
    };

    onMounted(() => {
      init();
      animate();
    });

    function init() {
      initScene();
      initLights();
      initCamera();
      initRenderer();
      initComposer();
      initControls();
      initEventListeners();
      createObjects();
    }

    function initScene() {
      SCENE = new THREE.Scene();
    }

    function initLights() {
      const light = new THREE.PointLight(0xffffff, 1, 100);
      light.position.set(255, 255, 255);
      const ambientLight = new THREE.AmbientLight(0xffffff, 0);
      SCENE.add(ambientLight);
      SCENE.add(light);
    }

    function initCamera() {
      CAMERA = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        100,
        2000
      );
      CAMERA.position.copy(config.cameraPosition);
    }

    function initRenderer() {
      RENDERER = new THREE.WebGLRenderer({ alpha: true });
      RENDERER.setClearColor(0xffffff, config.canvasBackground);
      RENDERER.setPixelRatio(window.devicePixelRatio);
      RENDERER.setSize(window.innerWidth, window.innerHeight);
      RENDERER.shadowMap.enabled = true;
      if (canvas.value) {
        canvas.value.appendChild(RENDERER.domElement);
      }
    }

    function initComposer() {
      COMPOSER = new EffectComposer(RENDERER);
      COMPOSER.setSize(window.innerWidth, window.innerHeight);
      const renderPass = new RenderPass(SCENE, CAMERA);
      COMPOSER.addPass(renderPass);
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        config.material.x,
        config.material.y,
        config.material.z
      );
      bloomPass.renderToScreen = true;
      COMPOSER.addPass(bloomPass);
    }

    function initControls() {
      CONTROLS = new OrbitControls(CAMERA, RENDERER.domElement);
      CONTROLS.enableZoom = false;
      CONTROLS.minPolarAngle = Math.PI / 32;
      CONTROLS.maxPolarAngle = Math.PI * 32;
      CONTROLS.update();
    }

    function initEventListeners() {
      window.addEventListener("resize", onWindowResize);
      onWindowResize();
    }

    function onWindowResize() {
      CAMERA.aspect = window.innerWidth / window.innerHeight;
      CAMERA.updateProjectionMatrix();
      RENDERER.setSize(window.innerWidth, window.innerHeight);
      COMPOSER.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      requestAnimationFrame(animate);
      CONTROLS.update();
      TIME += config.speedEffect / 1000;
      updateUniforms();
      rotateCamera();
      render();
    }

    function updateUniforms() {
      SCENE.traverse(function (child: any) {
        if (
          child instanceof THREE.Mesh &&
          child.material.type === "ShaderMaterial"
        ) {
          child.material.uniforms.uTime.value = TIME;
          child.material.needsUpdate = false;
        }
      });
    }
    function rotateCamera() {
      const cameraPosition = CAMERA.position;
      const angle = (ROTATION_SPEED * Math.PI) / 180;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      const newX = cameraPosition.x * cosAngle - cameraPosition.z * sinAngle;
      const newZ = cameraPosition.x * sinAngle + cameraPosition.z * cosAngle;
      CAMERA.position.set(newX, cameraPosition.y, newZ);
      CAMERA.lookAt(SCENE.position);
    }

    function updateUniforms2() {
      SCENE.traverse(function (child: any) {
        if (
          child instanceof THREE.Mesh &&
          child.material.type === "ShaderMaterial"
        ) {
          const vertices = child.geometry.vertices;
          const time = TIME * config.speedEffect;
          for (let i = 0; i < vertices.length; i++) {
            const vertex = vertices[i];
            const x = vertex.x + Math.sin(time + i) * AMPLITUDE;
            const y = vertex.y + Math.sin(time + i) * AMPLITUDE;
            const z = vertex.z + Math.sin(time + i) * AMPLITUDE;
            vertex.set(x, y, z);
          }
          child.geometry.verticesNeedUpdate = true;
        }
      });
    }

    function render() {
      CAMERA.lookAt(SCENE.position);
      COMPOSER.render();
    }

    function createObjects() {
      const geometry = new THREE.SphereGeometry(
        config.sphereForm.x,
        config.sphereForm.y,
        config.sphereForm.z
      );
      const modelColors = `
        uniform float uTime;
        varying vec3 vNormal;
        void main() {
          vec3 color1 = ${config.vecColor1};
          vec3 color2 = ${config.vecColor2};
          gl_FragColor = vec4(mix(color1, color2, vNormal.${config.colorDir}), ${config.colorSplit});
        }
      `;
      const vertex = `
        uniform float uTime;     
        varying vec3 vNormal;
        void main() {
            vNormal = normal;
            vec3 delta = ${config.vertexXYZ.x}.0 * normal * sin(normal.x + normal.y * ${config.vertexXYZ.y}.0 + normal.z + uTime * ${config.vertexXYZ.z}.0);
            vec3 newPosition = position + delta;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }`;
      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: TIME },
        },
        transparent: config.transparentMaterial,
        side: THREE.DoubleSide,
        vertexShader: vertex,
        fragmentShader: modelColors,
      });
      const sphere = new THREE.Mesh(geometry, shaderMaterial);
      SCENE.add(sphere);
    }

    return {
      canvas,
    };
  },
});
</script>
../../node_modules/@types/threethree/examples/jsm/controls/OrbitControls.js