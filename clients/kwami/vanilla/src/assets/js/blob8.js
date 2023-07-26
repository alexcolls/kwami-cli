import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
// import * as TWEEN from "tween.js";

function getRandomBetween(min, max, digits = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(digits));
}

function getRandomHexColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + randomColor.padStart(6, "0");
}

$(document).ready(function () {
  /***  BODY ***/

  let rotation = getRandomBetween(0.001, 0.3);
  let speedX = getRandomBetween(1, 0, 100),
    speedY = getRandomBetween(0.2, 1.7),
    speedZ = getRandomBetween(10, 100);
  let spikesX = getRandomBetween(0.2, 1.7),
    spikesY = getRandomBetween(0.2, 1.7),
    spikesZ = getRandomBetween(0.2, 1.7);
  let intensityX = getRandomBetween(0.5, 1),
    intensityY = getRandomBetween(0.5, 1),
    intensityZ = getRandomBetween(0.5, 1);
  let colorX = getRandomHexColor(),
    colorY = getRandomHexColor(),
    colorZ = getRandomHexColor();
  const positiveTextureProb = 50;
  let textureX = getRandomBetween(-1, positiveTextureProb, 0),
    textureY = getRandomBetween(-1, positiveTextureProb, 0),
    textureZ = getRandomBetween(-1, positiveTextureProb, 0);
  textureX = textureX >= 0 ? 1 : textureX;
  textureY = textureY >= 0 ? 1 : textureY;
  textureZ = textureZ >= 0 ? 1 : textureZ;
  let audioEffectFactor = getRandomBetween(0.5, 2);
  let audioElement = document.createElement("audio");
  audioElement.src = `/src/assets/aud/${String(5)}.mp3`;
  audioElement.controls = true;
  document.body.appendChild(audioElement);
  let audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let sourceNode = audioContext.createMediaElementSource(audioElement);
  let analyser = audioContext.createAnalyser();
  sourceNode.connect(analyser);
  analyser.connect(audioContext.destination);
  let frequencyData = new Uint8Array(analyser.frequencyBinCount);

  let $canvas = $("#blob canvas"),
    canvas = $canvas[0],
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      context: canvas.getContext("webgl2"),
      antialias: true,
      alpha: true,
    }),
    simplex = new SimplexNoise();

  renderer.setSize($canvas.width(), $canvas.height());
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  let scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(
      50,
      $canvas.width() / $canvas.height(),
      0.1,
      1000
    );

  camera.position.x = 0;
  camera.position.y = 5;
  camera.position.z = 0;

  let geometry = new THREE.SphereGeometry(0.8, 128, 128);

  let lightTop = new THREE.DirectionalLight(0xffffff, 0.7);
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

  let lightBottom = new THREE.DirectionalLight(0xffffff, 0.25);
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

  let ambientLight = new THREE.AmbientLight(0x798296);
  scene.add(ambientLight);

  const vertexShaders = `
      varying vec3 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vUv = position;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position; // Pass the position to the fragment shader
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }

    `;

  const fragmentShaders = `
        varying vec3 vNormal;
        varying vec3 vPosition; // Add vPosition varying
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform vec3 lightPosition;
        uniform vec3 specularColor;
        uniform float shininess;

        void main() {
          vec3 lightDir = normalize(lightPosition - vPosition);
          vec3 viewDir = normalize(-vPosition);
          vec3 reflectDir = reflect(-lightDir, vNormal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
          vec3 specular = specularColor * spec;
          float angle = atan(vPosition.y, vPosition.x);
          float hue = angle / (2.0 * 3.14159265359) + 0.5; // Normalize the angle to [0, 1]
          vec3 color;
          if (hue < 1.0 / 3.0) {
            color = mix(color1, color2, 3.0 * hue);
          } else if (hue < 2.0 / 3.0) {
            color = mix(color2, color3, 3.0 * (hue - 1.0 / 3.0));
          } else {
            color = mix(color3, color1, 3.0 * (hue - 2.0 / 3.0));
          }
          gl_FragColor = vec4(color + specular, 1.0);
        }
      `;

  let material = new THREE.ShaderMaterial({
    uniforms: {
      color1: {
        type: "c",
        value: new THREE.Color(colorX),
      },
      color2: {
        type: "c",
        value: new THREE.Color(colorY),
      },
      color3: {
        type: "c",
        value: new THREE.Color(colorZ),
      },
      lightPosition: {
        type: "v3",
        value: lightTop.position,
      },
      specularColor: {
        type: "c",
        value: new THREE.Color(0xffffff),
      },
      shininess: {
        type: "f",
        value: 1000,
      },
    },
    vertexShader: vertexShaders,
    fragmentShader: fragmentShaders,
    wireframe: false,
  });

  let sphere = new THREE.Mesh(geometry, material);
  sphere.castShadow = true;
  scene.add(sphere);

  let controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.7;
  controls.enableZoom = false;

  /*** INTERACTIONS ***/

  $canvas.click(function () {
    rotation = getRandomBetween(0.001, 0.3);
    speedX = getRandomBetween(10, 100);
    speedY = getRandomBetween(0.2, 1.7);
    speedZ = getRandomBetween(10, 100);
    spikesX = getRandomBetween(0.2, 1.7);
    spikesY = getRandomBetween(0.2, 1.7);
    spikesZ = getRandomBetween(0.2, 1.7);
    intensityX = getRandomBetween(0.5, 1);
    intensityY = getRandomBetween(0.5, 1);
    intensityZ = getRandomBetween(0.5, 1);
    colorX = getRandomHexColor();
    colorY = getRandomHexColor();
    colorZ = getRandomHexColor();
    textureX = getRandomBetwteen(-1, positiveTextureProb, 0);
    textureY = getRandomBetween(-1, positiveTextureProb, 0);
    textureZ = getRandomBetween(-1, positiveTextureProb, 0);
    textureX = textureX >= 0 ? 1 : textureX;
    textureY = textureY >= 0 ? 1 : textureY;
    textureZ = textureZ >= 0 ? 1 : textureZ;
    audioEffectFactor = getRandomBetween(0.5, 2);
    console.log("click");
  });

  /*** ANIMATIONS ***/

  function effect3D() {
    let time =
      (performance.now() * 0.001 * speedX * Math.pow(intensityX, 3)) / 100;

    analyser.getByteFrequencyData(frequencyData);

    let average = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      average += frequencyData[i] * speedZ;
    }
    average /= frequencyData.length;

    let audioEffect = (average / 128.0) * audioEffectFactor * speedY;

    spikesX = spikesX * intensityX;
    spikesY = spikesY * intensityY;
    spikesZ = spikesZ * intensityZ;

    for (let i = 0; i < sphere.geometry.vertices.length; i++) {
      let p = sphere.geometry.vertices[i];
      p.normalize().multiplyScalar(
        textureX +
          0.3 *
            simplex.noise3D(
              p.x * spikesX + audioEffect + time,
              p.y * spikesY + audioEffect,
              p.z * spikesZ + audioEffect
            )
      );
      p.normalize().multiplyScalar(
        textureY +
          0.3 *
            simplex.noise3D(
              p.x * spikesX + audioEffect,
              p.y * spikesY + audioEffect + time,
              p.z * spikesZ + audioEffect
            )
      );
      p.normalize().multiplyScalar(
        textureZ +
          0.3 *
            simplex.noise3D(
              p.x * spikesX + audioEffect,
              p.y * spikesY + audioEffect,
              p.z * spikesZ + audioEffect + time
            )
      );
    }

    sphere.geometry.computeVertexNormals();
    sphere.geometry.normalsNeedUpdate = true;
    sphere.geometry.verticesNeedUpdate = true;
    material.uniforms.color1.value = new THREE.Color(colorX);
    material.uniforms.color2.value = new THREE.Color(colorY);
    material.uniforms.color3.value = new THREE.Color(colorZ);

    controls.update();
  }

  function rotateCamera() {
    const cameraPosition = camera.position;
    const angle = (rotation * Math.PI) / 180;
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    const newX = cameraPosition.x * cosAngle - cameraPosition.z * sinAngle;
    const newZ = cameraPosition.x * sinAngle + cameraPosition.z * cosAngle;
    camera.position.set(newX, cameraPosition.y, newZ);
    camera.lookAt(scene.position);
  }

  function animate3D() {
    effect3D();
    rotateCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate3D);
});
