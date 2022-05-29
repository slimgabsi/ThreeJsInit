import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as dat from 'dat.gui';

const parametres = {
	sphereColor: 0x3e0f0f,
};
// Canvas
const canvas = document.querySelector('canvas.webgl');
// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xefd1b5);
scene.fog = new THREE.Fog(0xefd1b5, 1, 250);

/**
 * Objects
 */

// Sphere
const sphere = new THREE.Mesh(
	new THREE.SphereGeometry(5, 5, 5),
	new THREE.MeshBasicMaterial({ color: parametres.sphereColor })
);
sphere.position.x = -20;
sphere.visible = false;
scene.add(sphere);

// Ground
const groundMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(4000, 4000),
	new THREE.MeshPhongMaterial({ color: 0x8a3f1f, depthWrite: false })
);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.receiveShadow = true;
groundMesh.position.set(0, 0, 0);
scene.add(groundMesh);

// External Models
let carModel;
const gtfLoader = new GLTFLoader();
gtfLoader.load('/car/scene.gltf', function (gltf) {
	carModel = gltf.scene;
	carModel.position.set(0, -2, 0);
	carModel.scale.set(0.1, 0.1, 0.1);
	carModel.traverse(function (child) {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});
	scene.add(carModel);
});

let mixer;
const fbxLoader = new FBXLoader();
fbxLoader.load('/character/boss.fbx', function (object) {
	object.scale.set(0.1, 0.1, 0.1);
	mixer = new THREE.AnimationMixer(object);
	object.traverse(function (child) {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});
	const action = mixer.clipAction(object.animations[0]);
	action.play();
	scene.add(object);
});

// Lights

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 50, 0);
dirLight.castShadow = true;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 100;
dirLight.shadow.camera.right = 100;
dirLight.shadow.camera.left = -100;
dirLight.shadow.camera.top = 100;
dirLight.shadow.camera.bottom = -100;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
scene.add(dirLight);

const hemiLight = new THREE.HemisphereLight(0x976e61, 0x48353a, 1);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	1000
);
camera.position.set(0, 50, 20);

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Helpers
 */

const axisHelper = new THREE.AxesHelper(100);
axisHelper.visible = false;
scene.add(axisHelper);
/**
 *Debug
 */
const gui = new dat.GUI();
gui.add(axisHelper, 'visible').name('Axis Helper');
// gui.add(cameraHelper, "visible").name("Light Shadow Helper");

const sphereFolder = gui.addFolder('Sphere');
sphereFolder.add(sphere, 'visible');
sphereFolder.add(sphere.position, 'x').min(-30).max(30).step(0.01).name('x');
sphereFolder.add(sphere.position, 'y', -30, 30, 0.01).name('y');
sphereFolder.add(sphere.position, 'z', -30, 30, 0.01).name('z');
sphereFolder
	.addColor(parametres, 'sphereColor')
	.onChange(() => {
		sphere.material.color.set(parametres.sphereColor);
	})
	.name('Color');

const LightsFolder = gui.addFolder('Lights');
LightsFolder.add(dirLight, 'visible').name('Directional light');
LightsFolder.add(hemiLight, 'visible').name('Hemisphere light');

/**
 * Animate
 */
sphere.position.set = (50, 100, -2);
const clock = new THREE.Clock();

const animate = () => {
	//  Call update  again on the next
	window.requestAnimationFrame(animate);

	// Get delta time
	const deltaTime = clock.getDelta();

	// Update sphere
	sphere.rotation.y += 0.5 * deltaTime;

	// Update Orbital Controls
	controls.update();

	// Update fbx model animation
	if (mixer) mixer.update(deltaTime);

	// Render
	renderer.render(scene, camera);
};

animate();
