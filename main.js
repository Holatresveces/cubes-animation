const config = {
  rows: 30,
  columns: 33,
  sectionWidth: 10,
  speed: 0.3, // < 1 slower, > 1 faster
  displacedRows: 5, // number of displaced rows per loop
  xNoiseMultiplier: 200,
  zNoiseMultiplier: 15,
  scaleMultiplier: 0.07,
  backgroundColor: 0xff9500,
  cubesColor: 0xff2f00,
  fogDistance: 260, // smaller values -> stronger opacity effect
};

const container = document.querySelector(".webgl-container");

let W = container.clientWidth;
let H = container.clientHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(W, H, false);
renderer.setClearColor(config.backgroundColor);

container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 300);
camera.position.z = 90;
camera.position.x = -50;
camera.position.y = -120;
camera.rotation.set(0.95, 0, -0.6);

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
    yPos <= -config.displacedRows * config.sectionWidth
      ? 0
      : -config.displacedRows * config.sectionWidth * progress;

  for (let i = 0; i < mesh.count; i++) {
    const xIndex = i % config.rows;
    const yIndex = Math.floor(i / config.rows);

    const loopIndex = yIndex * 2 * Math.PI * 3.0;

    var noiseX =
      ((Math.sin((yIndex + config.displacedRows * progress) / 5 + loopIndex) +
        1) /
        2) *
      0.8;

    var noiseZ =
      (Math.sin((xIndex + config.displacedRows * time) / 5 + loopIndex) + 1) /
      2;

    let xStaticPosition =
      -config.sectionWidth * (xIndex - (config.rows - 1) / 2);
    xStaticPosition -= noiseX * config.xNoiseMultiplier;
    let yStaticPosition =
      -config.sectionWidth * (yIndex - (config.columns - 1) / 2);

    dummy.position.set(
      xStaticPosition,
      yStaticPosition,
      noiseZ * config.zNoiseMultiplier
    );

    const scale =
      (yIndex + config.displacedRows * progress) * config.scaleMultiplier;

    dummy.scale.set(scale, scale, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.instanceMatrix.needsUpdate = true;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
