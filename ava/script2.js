import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";

// Request microphone access
navigator.mediaDevices
  .getUserMedia({ audio: true, video: false })
  .then((stream) => {
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let audioSource = audioContext.createMediaStreamSource(stream);
    let analyser = audioContext.createAnalyser();

    // FFT size for how much detail you want from the audio data
    analyser.fftSize = 256;

    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    audioSource.connect(analyser);

    $(document).ready(function () {
      let speedSlider = $('input[name="speed"]'),
        spikesSlider = $('input[name="spikes"]'),
        processingSlider = $('input[name="processing"]'),
        colorPicker1 = $('input[name="color1"]'),
        colorPicker2 = $('input[name="color2"]'),
        colorPicker3 = $('input[name="color3"]');

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

      let vertexShader = `
    varying vec3 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = position;
      vNormal = normalize(normalMatrix * normal);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
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
            value: 100,
          },
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

      // Adding a plane that receives shadows
      let planeGeometry = new THREE.PlaneGeometry(null, -1);
      let planeMaterial = new THREE.MeshPhongMaterial({ color: "#1c1f29" });
      let plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.receiveShadow = true;
      plane.rotation.x = -0.5 * Math.PI;
      plane.position.y = -3; // Adjust this value to position the plane beneath your 3D model
      scene.add(plane);

      let controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.1;

      let update = () => {
        // update audio data
        analyser.getByteFrequencyData(dataArray);
        let averageFrequency =
          dataArray.reduce((a, b) => a + b, 0) / bufferLength;

        let time =
          (performance.now() *
            0.001 *
            speedSlider.val() *
            Math.pow(processingSlider.val(), 3)) /
          100;
        let spikes = spikesSlider.val() * processingSlider.val();

        for (let i = 0; i < sphere.geometry.vertices.length; i++) {
          let p = sphere.geometry.vertices[i];
          p.normalize().multiplyScalar(
            1 +
              0.4 *
                simplex.noise3D(
                  p.x * spikes + averageFrequency / 1000,
                  p.y * spikes + averageFrequency / 1000,
                  p.z * spikes + averageFrequency / 1000 + time
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

      let animate = () => {
        requestAnimationFrame(animate);

        update();

        renderer.render(scene, camera);
      };

      animate();

      $(window).resize(function () {
        camera.aspect = $canvas.width() / $canvas.height();
        camera.updateProjectionMatrix();

        renderer.setSize($canvas.width(), $canvas.height());
      });
    });
  });
