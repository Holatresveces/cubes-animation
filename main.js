const container = document.querySelector(".webgl-container");

let W = container.clientWidth;
let H = container.clientHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(W, H, false);
renderer.setClearColor(0xff9500);

container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
camera.position.z = 30;
camera.position.x = 15;
camera.position.y = -150;
camera.rotation.set(1, -0.1, -0.6);

const clock = new THREE.Clock();

const scene = new THREE.Scene();

const geometry = new THREE.PlaneBufferGeometry(5, 5, 1, 1);
const material = new THREE.MeshBasicMaterial({
  color: 0xff2f00,
});

const rows = 20;
const columns = 30;
const instanceCount = rows * columns;
const sectionWidth = 10;
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
  progress = (time * 0.2) % 1;

  const yPos = mesh.position.y;
  mesh.position.y =
    yPos <= -5 * sectionWidth ? 0 : -5 * sectionWidth * progress;

  for (let i = 0; i < mesh.count; i++) {
    const xIndex = i % rows;
    const yIndex = Math.floor(i / rows);

    var noiseVal =
      ((Math.sin((yIndex + 5 * progress) / 5 + xIndex * 2 * Math.PI * 3.0) +
        1) /
        2) *
      0.8;

    let xStaticPosition = -sectionWidth * (xIndex - (rows - 1) / 2);
    xStaticPosition -= noiseVal * 60.0;
    let yStaticPosition = -sectionWidth * (yIndex - (columns - 1) / 2);
    dummy.position.set(xStaticPosition, yStaticPosition, noiseVal * 5);
    const scale = (yIndex + 5 * progress) * 0.07;
    dummy.scale.set(scale, scale, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.instanceMatrix.needsUpdate = true;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
