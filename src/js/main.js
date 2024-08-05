import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GUI } from "dat.gui";

const debug = true;
const PATH = "ws://localhost:3001";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Renderer settings for improved visuals
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.gammaInput = true;
renderer.gammaOutput = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = Math.pow(0.9, 5.0); // Adjust to your needs
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Default is PCFShadowMap

// Add renderer to DOM
document.body.appendChild(renderer.domElement);

// WebSocket setup
const ws = new WebSocket(PATH);
ws.onopen = () => console.log("Connected to WebSocket server at " + PATH);

// Camera setup
window.camera = camera;

// Model setup
const loader = new GLTFLoader();
let model;
let loaded = false;

const models = {
	"Porsche": {
		path: "./models/scene.gltf",
		cameraPosition: new THREE.Vector3(0.5, 24, 33),
	},
};

let controls = {
	axes: false,
	grid: false,
	dirLightHelper: false,
    switchModel: debug ? 'Porsche' : 'Add Models',
};

function loadModel(name) {
	if (models[name]) {
		if (model) {
			scene.remove(model);
			model = null;
		}
		loader.load(
			models[name].path,
			(gltf) => {
				model = gltf.scene;
				scene.add(model);
				camera.position.copy(models[name].cameraPosition);
				camera.lookAt(0, 0, 0);
				console.log("Model loaded:", name);
				console.log('model:', model.scale);
				model.scale.set(10, 10, 10);
				console.log("===>", camera.position);
				loaded = true;
				animate();
			},
			(xhr) =>
				console.log(
					`Model ${Math.round(
						(xhr.loaded / xhr.total) * 100
					)}% loaded`
				),
			(error) => console.error(error)
		);
	}
}

// OrbitControls setup
const orbitControls = new OrbitControls(camera, renderer.domElement);

// Lighting setup
scene.add(new THREE.AmbientLight(0x404040));
scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 10));
const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
// For each light that casts shadow:
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 512;  // Adjust to your needs
directionalLight.shadow.mapSize.height = 512; // Adjust to your needs
directionalLight.position.set(0, 20, 0);
scene.add(directionalLight);

// Helpers
const gridHelper = new THREE.GridHelper(100, 100);
const axesHelper = new THREE.AxesHelper(5);
const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);

// dat.GUI setup
if(debug) {
    const gui = new GUI();
    
    const cameraFolder = gui.addFolder("Camera");
    cameraFolder.add(camera.position, "x", -50, 50);
    cameraFolder.add(camera.position, "y", -50, 50);
    cameraFolder.add(camera.position, "z", -50, 50);
    cameraFolder.open();
    
    const lightFolder = gui.addFolder("Light");
    lightFolder.add(directionalLight.position, "x", -100, 100);
    lightFolder.add(directionalLight.position, "y", -100, 100);
    lightFolder.add(directionalLight.position, "z", -100, 100);
    lightFolder.open();
    
	// Axes helper
    gui.add(controls, "axes")
        .name("Show Axes")
        .onChange((value) =>
            value ? scene.add(axesHelper) : scene.remove(axesHelper)
        );

	// Grid helper
    gui.add(controls, "grid")
        .name("Show Grid")
        .onChange((value) =>
            value ? scene.add(gridHelper) : scene.remove(gridHelper)
        );
	
	// Light helper
    gui.add(controls, "dirLightHelper")
        .name("Show Light Helper")
        .onChange((value) =>
            value ? scene.add(dirLightHelper) : scene.remove(dirLightHelper)
        );
    
	// swtich model
    gui.add(controls, 'switchModel', Object.keys(models)).name('Choose Model').onChange(loadModel);
}


// Load default model
loadModel(controls.switchModel);

// WebSocket Handling
ws.onmessage = (event) => {
	const command = event.data;
	if (!loaded) return;
    switch (command) {
        case "rotate-left":
            model.rotation.y -= 0.01;
            break;
        case "rotate-right":
            model.rotation.y += 0.01;
            break;
        case "Porsche":
            loadModel('Porsche');
            break;
        default:
            console.log(`Unknown command: ${command}`);
            break;
    }
};

// Animate
function animate() {
	if (loaded) {
		// model.rotation.y += 0.001;
		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	}
}

// Resize
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});
