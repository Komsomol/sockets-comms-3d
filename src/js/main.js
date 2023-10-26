import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui';

// scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Special options for the renderer
THREE.ColorManagement.enabled = true;
renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;
renderer.toneMapping = THREE.NoToneMapping;

// sockets
const ws = new WebSocket("ws://localhost:3001");
ws.onopen = () => {
	console.log("Connected to WebSocket server.");
};

// camera
camera.position.x = -20;
camera.position.y = 10;
camera.position.z = 20;

// Attach camera to the window object
window.camera = camera;

// orbit controls
const orbitControls = new OrbitControls( camera, renderer.domElement );
// light
const ambilight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambilight );
const hemilight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( hemilight );

// White directional light at half intensity shining from the top.
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

// helpers
const gridHelper = new THREE.GridHelper( 100, 100 );
const axesHelper = new THREE.AxesHelper( 5 );
const dirlighthelper = new THREE.DirectionalLightHelper( directionalLight, 5 );

// GUI
let controls = {
    axes: false,
    grid: false,
    dirlighthelper: false
}

const gui = new GUI();

const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(camera.position, 'x', -20, 20);
cameraFolder.add(camera.position, 'y', -20, 20);
cameraFolder.add(camera.position, 'z', -20, 20);
cameraFolder.open();

const lightFolder = gui.addFolder('Light');
lightFolder.add(directionalLight.position, 'x', -20, 20);
lightFolder.add(directionalLight.position, 'y', -20, 20);
lightFolder.add(directionalLight.position, 'z', -20, 20);
lightFolder.open();

// Add axes helper
gui.add(controls, 'axes').name('Show Axes').onChange((value) => {
    if (value) {
        scene.add(axesHelper);
    } else {
        scene.remove(axesHelper);
    }
});

gui.add(controls, 'dirlighthelper').name('Show Light Helper').onChange((value) => {
    if (value) {
        scene.add(gridHelper);
    } else {
        scene.remove(gridHelper);
    }
});


// Add grid helper
gui.add(controls, 'grid').name('Show Grid').onChange((value) => {
    if (value) {
        scene.add(gridHelper);
    } else {
        scene.remove(gridHelper);
    }
});




// resize
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


// GLTF
const loader = new GLTFLoader();
let model;
let loaded = false;

// Load the GLB model and show progress
loader.load(
    './model/london_financial_district8k.glb',
    (gltf) => {
        model = gltf.scene;
        scene.add(model);
        loaded = true;
        animate();
    },
    (xhr) => {
        console.log(`Model ${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`); // Progress callback
    },
    (error) => {
        console.error(error);
    }
);

// WebSocket Handling
ws.onmessage = (event) => {
    const command = event.data;
    if (!loaded) return; // Don't process commands if the model isn't loaded

    switch (command) {
        case "rotate-left":
            model.rotation.y -= 0.1;
            break;
        case "rotate-right":
            model.rotation.y += 0.1;
            break;
    }
    renderer.render(scene, camera); // Render the scene after rotating the model
};

// Animate
function animate() {
    if (!loaded) return; // Don't animate if the model isn't loaded

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}


