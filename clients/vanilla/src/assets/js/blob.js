import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";

function getRandomBetween(min = 0, max = 1, digits = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(digits));
}

function getRandomHex_color() {
  const random_color = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + random_color.padStart(6, "0");
}

$(document).ready(function () {
  /***  BODY ***/

  let ROTATION = getRandomBetween(0.001, 0.3);
  let _speedX = getRandomBetween(1, 0, 100),
    _speedY = getRandomBetween(0.2, 1.7),
    _speedZ = getRandomBetween(10, 100);
  let _spikesX = getRandomBetween(0.2, 1.7),
    _spikesY = getRandomBetween(0.2, 1.7),
    _spikesZ = getRandomBetween(0.2, 1.7);
  let _intensityX = getRandomBetween(0.5, 1),
    _intensityY = getRandomBetween(0.5, 1),
    _intensityZ = getRandomBetween(0.5, 1);
  let _colorX = getRandomHex_color(),
    _colorY = getRandomHex_color(),
    _colorZ = getRandomHex_color();
  const positive_textureProb = 50;
  let _textureX = getRandomBetween(-1, positive_textureProb, 0),
    _textureY = getRandomBetween(-1, positive_textureProb, 0),
    _textureZ = getRandomBetween(-1, positive_textureProb, 0);
  _textureX = _textureX >= 0 ? 1 : _textureX;
  _textureY = _textureY >= 0 ? 1 : _textureY;
  _textureZ = _textureZ >= 0 ? 1 : _textureZ;
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
        uniform vec3 _color1;
        uniform vec3 _color2;
        uniform vec3 _color3;
        uniform vec3 lightPosition;
        uniform vec3 specular_color;
        uniform float shininess;

        void main() {
          vec3 lightDir = normalize(lightPosition - vPosition);
          vec3 viewDir = normalize(-vPosition);
          vec3 reflectDir = reflect(-lightDir, vNormal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
          vec3 specular = specular_color * spec;
          float angle = atan(vPosition.y, vPosition.x);
          float hue = angle / (2.0 * 3.14159265359) + 0.5; // Normalize the angle to [0, 1]
          vec3 _color;
          if (hue < 1.0 / 3.0) {
            _color = mix(_color1, _color2, 3.0 * hue);
          } else if (hue < 2.0 / 3.0) {
            _color = mix(_color2, _color3, 3.0 * (hue - 1.0 / 3.0));
          } else {
            _color = mix(_color3, _color1, 3.0 * (hue - 2.0 / 3.0));
          }
          gl_Frag_color = vec4(_color + specular, 1.0);
        }
      `;

  let MATERIAL = new THREE.ShaderMaterial({
    uniforms: {
      _color1: {
        type: "c",
        value: new THREE._color(_colorX),
      },
      _color2: {
        type: "c",
        value: new THREE._color(_colorY),
      },
      _color3: {
        type: "c",
        value: new THREE._color(_colorZ),
      },
      lightPosition: {
        type: "v3",
        value: lightTop.position,
      },
      specular_color: {
        type: "c",
        value: new THREE._color(0xffffff),
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

  let SPHERE = new THREE.Mesh(geometry, MATERIAL);
  SPHERE.castShadow = true;
  scene.add(SPHERE);

  const CONTROLS = new OrbitControls(camera, renderer.domElement);
  CONTROLS.enableDamping = true;
  CONTROLS.dampingFactor = 0.05;
  CONTROLS.rotate_speed = 0.7;
  CONTROLS.enableZoom = false;

  /*** INTERACTIONS ***/

  $canvas.click(function () {
    ROTATION = getRandomBetween(0.001, 0.3);
    _speedX = getRandomBetween(10, 100);
    _speedY = getRandomBetween(0.2, 1.7);
    _speedZ = getRandomBetween(10, 100);
    _spikesX = getRandomBetween(0.2, 1.7);
    _spikesY = getRandomBetween(0.2, 1.7);
    _spikesZ = getRandomBetween(0.2, 1.7);
    _intensityX = getRandomBetween(0.5, 1);
    _intensityY = getRandomBetween(0.5, 1);
    _intensityZ = getRandomBetween(0.5, 1);
    _colorX = getRandomHex_color();
    _colorY = getRandomHex_color();
    _colorZ = getRandomHex_color();
    _textureX = getRandomBetwteen(-1, positive_textureProb, 0);
    _textureY = getRandomBetween(-1, positive_textureProb, 0);
    _textureZ = getRandomBetween(-1, positive_textureProb, 0);
    _textureX = _textureX >= 0 ? 1 : _textureX;
    _textureY = _textureY >= 0 ? 1 : _textureY;
    _textureZ = _textureZ >= 0 ? 1 : _textureZ;
    audioEffectFactor = getRandomBetween(0.5, 2);
    console.log("click");
  });

  /*** ANIMATIONS ***/

  function effect3D() {
    let time =
      (performance.now() * 0.001 * _speedX * Math.pow(_intensityX, 3)) / 100;

    analyser.getByteFrequencyData(frequencyData);

    let average = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      average += frequencyData[i] * _speedZ;
    }
    average /= frequencyData.length;

    let audioEffect = (average / 128.0) * audioEffectFactor * _speedY;

    _spikesX = _spikesX * _intensityX;
    _spikesY = _spikesY * _intensityY;
    _spikesZ = _spikesZ * _intensityZ;

    for (let i = 0; i < SPHERE.geometry.vertices.length; i++) {
      let p = SPHERE.geometry.vertices[i];
      p.normalize().multiplyScalar(
        _textureX +
          0.3 *
            simplex.noise3D(
              p.x * _spikesX + audioEffect + time,
              p.y * _spikesY + audioEffect,
              p.z * _spikesZ + audioEffect
            )
      );
      p.normalize().multiplyScalar(
        _textureY +
          0.3 *
            simplex.noise3D(
              p.x * _spikesX + audioEffect,
              p.y * _spikesY + audioEffect + time,
              p.z * _spikesZ + audioEffect
            )
      );
      p.normalize().multiplyScalar(
        _textureZ +
          0.3 *
            simplex.noise3D(
              p.x * _spikesX + audioEffect,
              p.y * _spikesY + audioEffect,
              p.z * _spikesZ + audioEffect + time
            )
      );
    }

    SPHERE.geometry.computeVertexNormals();
    SPHERE.geometry.normalsNeedUpdate = true;
    SPHERE.geometry.verticesNeedUpdate = true;
    MATERIAL.uniforms._color1.value = new THREE._color(_colorX);
    MATERIAL.uniforms._color2.value = new THREE._color(_colorY);
    MATERIAL.uniforms._color3.value = new THREE._color(_colorZ);

    controls.update();
  }

  function rotateCamera() {
    const cameraPosition = camera.position;
    const angle = (ROTATION * Math.PI) / 180;
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
