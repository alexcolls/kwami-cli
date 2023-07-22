// Constants for animation states
const STATE_RELAX = "relax";
const STATE_LISTENING = "listening";

// Variable to hold the current state
let currentState = STATE_RELAX;

// Set up the scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a basic blob geometry
const blobGeometry = new THREE.SphereGeometry(1, 32, 32);
const blobMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const blobMesh = new THREE.Mesh(blobGeometry, blobMaterial);
scene.add(blobMesh);

// Add lighting to the scene
const ambientLight = new THREE.AmbientLight(0x394040, 2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
camera.add(pointLight);
scene.add(camera);

camera.position.z = 5;

// Function to update the blob animation based on its state
function updateBlobAnimation() {
  switch (currentState) {
    case STATE_RELAX:
      // Implement the relax animation here (e.g., random noise fluctuation)
      blobMesh.rotation.x += 0.5;
      blobMesh.rotation.y += 0.5;
      blobMesh.rotation.z += 0.5;
      break;
    case STATE_LISTENING:
      // Implement the listening animation here (e.g., more active animation)
      blobMesh.rotation.x += 2;
      blobMesh.rotation.y += 2;
      blobMesh.rotation.z += 2;
      break;
    // Add other states and animations here (Thinking, Speaking, Sleeping)
    // You can define additional constants and cases for each state's animation
    default:
      break;
  }
}

// Function to handle clicks on the 3D model
function handleClick() {
  if (currentState === STATE_RELAX) {
    // Transition to the "Listening" state
    currentState = STATE_LISTENING;
  }
}

// Add event listener to handle clicks on the renderer element
renderer.domElement.addEventListener("click", handleClick);

// Render loop
function animate() {
  requestAnimationFrame(animate);
  updateBlobAnimation();
  renderer.render(scene, camera);
}

animate();
