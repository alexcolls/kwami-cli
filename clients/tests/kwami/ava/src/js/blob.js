import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";
// import * as TWEEN from "tween.js";

function getRandomBetween(min, max, digits = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(digits));
}

function getRandomHexColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16); // Generate random number between 0 and 16777215 (0xFFFFFF in decimal)
  return "#" + randomColor.padStart(6, "0"); // Convert the number to a 6-digit hex color string
}

$(document).ready(function () {
  let speedSlider = getRandomBetween(10, 100),
    spikesSlider = getRandomBetween(0.2, 1.7),
    processingSlider = getRandomBetween(0.5, 1),
    rotationSpeed = getRandomBetween(0.001, 0.3),
    colorPicker1 = $('input[name="color1"]'),
    colorPicker2 = $('input[name="color2"]'),
    colorPicker3 = $('input[name="color3"]');

  let intX = getRandomBetween(-1, 3, 0);
  let intY = getRandomBetween(-1, 3, 0);
  let intZ = getRandomBetween(-1, 3, 0);

  intX = intX >= 0 ? 1 : intX;
  intY = intY >= 0 ? 1 : intY;
  intZ = intZ >= 0 ? 1 : intZ;

  let textureType = getRandomBetween(0, 1, 0);

  let spikes2Slider = getRandomBetween(0.1, 4);
  let spikes3Slider = getRandomBetween(0.1, 4);
  let audioEffectFactor = getRandomBetween(0.5, 2);

  // Only pick random colors on page loafing
  colorPicker1.val(getRandomHexColor());
  colorPicker2.val(getRandomHexColor());
  colorPicker3.val(getRandomHexColor());

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
      45,
      $canvas.width() / $canvas.height(),
      0.1,
      1000
    );

  camera.position.z = 5;

  let geometry = new THREE.SphereGeometry(0.8, 128, 128);

  let lightTop = new THREE.DirectionalLight(0xffffff, 0.7);
  lightTop.position.set(0, 500, 200);
  lightTop.castShadow = true;
  lightTop.shadow.mapSize.width = 4048; // Set shadow map width
  lightTop.shadow.mapSize.height = 4048; // Set shadow map height
  lightTop.shadow.camera.near = 0;
  lightTop.shadow.camera.far = 1000;
  lightTop.shadow.camera.left = -200;
  lightTop.shadow.camera.right = 200;
  lightTop.shadow.camera.top = 200;
  lightTop.shadow.camera.bottom = -200;
  scene.add(lightTop);

  let vertexShaders = `
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

  let fragmentShaders = `
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

          // Calculate the angle formed by the vertex with respect to the center of the sphere
          float angle = atan(vPosition.y, vPosition.x);
          float hue = angle / (2.0 * 3.14159265359) + 0.5; // Normalize the angle to [0, 1]

          // Interpolate the colors based on the hue
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
        value: new THREE.Color(colorPicker1.val()),
      },
      color2: {
        type: "c",
        value: new THREE.Color(colorPicker2.val()),
      },
      color3: {
        type: "c",
        value: new THREE.Color(colorPicker3.val()),
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

  function updateMaterial() {
    material = new THREE.ShaderMaterial({
      uniforms: {
        color1: {
          type: "c",
          value: new THREE.Color(colorPicker1.val()),
        },
        color2: {
          type: "c",
          value: new THREE.Color(colorPicker2.val()),
        },
        color3: {
          type: "c",
          value: new THREE.Color(colorPicker3.val()),
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
      vertexShader: vertexShaders[textureType],
      fragmentShader: fragmentShaders[textureType],
      wireframe: false,
    });

    sphere.material = material;
  }

  let lightBottom = new THREE.DirectionalLight(0xffffff, 0.25);
  lightBottom.position.set(0, -500, 400);
  lightBottom.castShadow = true;
  lightBottom.shadow.mapSize.width = 5048; // Set shadow map width
  lightBottom.shadow.mapSize.height = 5048; // Set shadow map height
  lightBottom.shadow.camera.near = 0.5;
  lightBottom.shadow.camera.far = 1000;
  lightBottom.shadow.camera.left = -200;
  lightBottom.shadow.camera.right = 200;
  lightBottom.shadow.camera.top = 200;
  lightBottom.shadow.camera.bottom = -200;
  scene.add(lightBottom);

  let ambientLight = new THREE.AmbientLight(0x798296);
  scene.add(ambientLight);

  let sphere = new THREE.Mesh(geometry, material);
  sphere.castShadow = true;
  scene.add(sphere);

  let controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.7;
  controls.enableZoom = false;

  let audioElement = document.createElement("audio");

  audioElement.src = `/src/assets/aud/${String(
    5 // Math.round(getRandomBetween(1, 10))
  )}.mp3`; // specify the path to your audio file

  audioElement.controls = true; // if you want to display the browser's default audio controls

  document.body.appendChild(audioElement);

  let audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let sourceNode = audioContext.createMediaElementSource(audioElement);
  let analyser = audioContext.createAnalyser();
  sourceNode.connect(analyser);
  analyser.connect(audioContext.destination);

  let frequencyData = new Uint8Array(analyser.frequencyBinCount);

  let update = () => {
    let time =
      (performance.now() *
        0.001 *
        speedSlider *
        Math.pow(processingSlider, 3)) /
      100;

    analyser.getByteFrequencyData(frequencyData);

    let average = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      average += frequencyData[i];
    }
    average /= frequencyData.length;

    let audioEffect = (average / 128.0) * audioEffectFactor; // Apply the audio effect factor

    let spikes = spikesSlider * processingSlider;
    let spikes2 = spikes2Slider * processingSlider; // New parameter for the second wire form
    let spikes3 = spikes3Slider * processingSlider; // New parameter for the third wire form

    for (let i = 0; i < sphere.geometry.vertices.length; i++) {
      let p = sphere.geometry.vertices[i];

      // Apply different noise functions to each wire form
      p.normalize().multiplyScalar(
        intX +
          0.3 *
            simplex.noise3D(
              p.x * spikes + audioEffect + time,
              p.y * spikes + audioEffect,
              p.z * spikes + audioEffect
            )
      );

      // Apply the second noise function for the second wire form
      p.normalize().multiplyScalar(
        intY +
          0.3 *
            simplex.noise3D(
              p.x * spikes2 + audioEffect,
              p.y * spikes2 + audioEffect + time,
              p.z * spikes2 + audioEffect
            )
      );

      // Apply the third noise function for the third wire form
      p.normalize().multiplyScalar(
        intZ +
          0.3 *
            simplex.noise3D(
              p.x * spikes3 + audioEffect,
              p.y * spikes3 + audioEffect,
              p.z * spikes3 + audioEffect + time
            )
      );
    }

    sphere.geometry.computeVertexNormals();
    sphere.geometry.normalsNeedUpdate = true;
    sphere.geometry.verticesNeedUpdate = true;

    // Update color inputs
    material.uniforms.color1.value = new THREE.Color(colorPicker1.val());
    material.uniforms.color2.value = new THREE.Color(colorPicker2.val());
    material.uniforms.color3.value = new THREE.Color(colorPicker3.val());

    controls.update();
  };

  function rotateCamera() {
    const cameraPosition = camera.position;
    const angle = (rotationSpeed * Math.PI) / 180;
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    const newX = cameraPosition.x * cosAngle - cameraPosition.z * sinAngle;
    const newZ = cameraPosition.x * sinAngle + cameraPosition.z * cosAngle;
    camera.position.set(newX, cameraPosition.y, newZ);
    camera.lookAt(scene.position);
  }

  function animate() {
    update();
    rotateCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  $canvas.click(function () {
    speedSlider = getRandomBetween(10, 120);
    spikesSlider = getRandomBetween(-2, 12);
    processingSlider = getRandomBetween(0.3, 1.2);
    rotationSpeed = getRandomBetween(0.001, 0.6);
    spikes2Slider = getRandomBetween(-2, 8);
    spikes3Slider = getRandomBetween(-2, 8);
    audioEffectFactor = getRandomBetween(0.5, 2);
    colorPicker1.val(getRandomHexColor());
    colorPicker2.val(getRandomHexColor());
    colorPicker3.val(getRandomHexColor());
    material.uniforms.color1.value = new THREE.Color(colorPicker1.val());
    material.uniforms.color2.value = new THREE.Color(colorPicker2.val());
    material.uniforms.color3.value = new THREE.Color(colorPicker3.val());
    const positiveProb = 20;
    intX = getRandomBetween(-1, positiveProb, 0);
    intY = getRandomBetween(-1, positiveProb, 0);
    intZ = getRandomBetween(-1, positiveProb, 0);
    intX = intX >= 0 ? 1 : -1;
    intY = intY >= 0 ? 1 : -1;
    intZ = intZ >= 0 ? 1 : -1;
  });

  requestAnimationFrame(animate);
});
