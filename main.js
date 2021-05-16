const config = {
  rows: 18,
  columns: 32,
  sectionWidth: 10,
  speed: 0.3, // < 1 slower, > 1 faster
  backgroundColor: 0xff9500,
  cubesColor: 0xff2f00,
  fogDistance: 180,
};

const container = document.querySelector(".webgl-container");

let W = container.clientWidth;
let H = container.clientHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(W, H, false);
renderer.setClearColor(config.backgroundColor);

container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 300);
camera.position.z = 30;
camera.position.x = 15;
camera.position.y = -140;
camera.rotation.set(1, -0.1, -0.6);

const clock = new THREE.Clock();

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(config.backgroundColor, 20, config.fogDistance);

const geometry = new THREE.PlaneBufferGeometry(5, 5, 1, 1);
const material = new THREE.MeshBasicMaterial({
  color: config.cubesColor,
});

const instanceCount = config.rows * config.columns;
let dummy = new THREE.Object3D();
let progress = 0;

const mesh = new THREE.InstancedMesh(geometry, material, instanceCount);
mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

scene.add(mesh);

window.addEventListener("resize", () => {
  W = container.clientWidth;
  H = container.clientHeight;
  renderer.setSize(W, H, false);

  camera.aspect = W / H;
  camera.updateProjectionMatrix();
});

requestAnimationFrame(loop);

function loop() {
  const time = clock.getElapsedTime();
  progress = (time * config.speed) % 1;

  const yPos = mesh.position.y;
  mesh.position.y =
    yPos <= -5 * config.sectionWidth ? 0 : -5 * config.sectionWidth * progress;

  for (let i = 0; i < mesh.count; i++) {
    const xIndex = i % config.rows;
    const yIndex = Math.floor(i / config.rows);

    var noiseVal =
      ((Math.sin((yIndex + 5 * progress) / 5 + xIndex * 2 * Math.PI * 3.0) +
        1) /
        2) *
      0.8;

    let xStaticPosition =
      -config.sectionWidth * (xIndex - (config.rows - 1) / 2);
    xStaticPosition -= noiseVal * 80.0;
    let yStaticPosition =
      -config.sectionWidth * (yIndex - (config.columns - 1) / 2);
    dummy.position.set(xStaticPosition, yStaticPosition, noiseVal * 10);
    const scale = (yIndex + 5 * progress) * 0.07;
    dummy.scale.set(scale, scale, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.instanceMatrix.needsUpdate = true;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
