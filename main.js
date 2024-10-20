import * as THREE from "three";
import {DeviceOrientationControls} from "./deviceOrientationControls";

let camera, controls, scene, renderer;

let isUserInteracting = false,
  lon = 0,
  lat = 0,
  phi = 0,
  theta = 0,
  onPointerDownPointerX = 0,
  onPointerDownPointerY = 0,
  onPointerDownLon = 0,
  onPointerDownLat = 0,
  isVideoPlaying = false;

const distance = 0.5;

init();

function init() {
  const container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.25,
    10,
  );

  controls = new DeviceOrientationControls(camera);

  scene = new THREE.Scene();

  const geometry = new THREE.SphereGeometry(5, 60, 40);
  // invert the geometry on the x-axis so that all of the faces point inward
  geometry.scale(-1, 1, 1);

  const video = document.getElementById("video");
  video.play();

  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;
  const material = new THREE.MeshBasicMaterial({ map: texture });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  container.appendChild(renderer.domElement);

  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);

  //

  window.addEventListener("orientationchange", (event) => {
    console.log(
      `the orientation of the device is now ${event.target.screen.orientation.angle}`,
    );
  });

  window.addEventListener("deviceorientation", (event) => {
    console.log("caca", event);

    const alphaRad = THREE.MathUtils.degToRad(event.alpha);
    const betaRad = THREE.MathUtils.degToRad(event.beta-90);
    const gammaRad = THREE.MathUtils.degToRad(event.gamma);

    camera.rotation.y = alphaRad;
    // camera.rotation.x = gammaRad;
    camera.rotation.z = betaRad;
    camera.updateProjectionMatrix();
  });

  window.addEventListener("resize", onWindowResize);
}

function onDeviceMotion(event) {
  console.log(event);
  let alpha = event.rotationRate.alpha;
  lon += alpha;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerDown(event) {
  if (!isVideoPlaying) {
    document.getElementById("video").play();
    isVideoPlaying = true;
  }
  console.log("Down");
  isUserInteracting = true;

  onPointerDownPointerX = event.clientX;
  onPointerDownPointerY = event.clientY;

  onPointerDownLon = lon;
  onPointerDownLat = lat;
}

function onPointerMove(event) {
  if (isUserInteracting === true) {
    lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
    lat = (onPointerDownPointerY - event.clientY) * 0.1 + onPointerDownLat;
  }
}

function onPointerUp() {
  isUserInteracting = false;
}

function animate() {
  lat = Math.max(-85, Math.min(85, lat));
  phi = THREE.MathUtils.degToRad(90 - lat);
  theta = THREE.MathUtils.degToRad(lon);

  camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
  camera.position.y = distance * Math.cos(phi);
  camera.position.z = distance * Math.sin(phi) * Math.sin(theta);

  // camera.lookAt(0, 0, 0);
  controls.update();
  renderer.render(scene, camera);

}
