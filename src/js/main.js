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

// sockets
const ws = new WebSocket("ws://localhost:3001");
ws.onopen = () => {
	console.log("Connected to WebSocket server.");
};

// camera
camera.position.x = -6;
camera.position.y = 6;
camera.position.z = 6;

// Attach camera to the window object
window.camera = camera;

// orbit controls
const orbitControls = new OrbitControls( camera, renderer.domElement );
// light
const ambilight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambilight );
const hemilight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( hemilight );
const hemihelper = new THREE.HemisphereLightHelper( hemilight, 5 );
scene.add( hemihelper );

// helpers

const size = 10;
const divisions = 10;
const gridHelper = new THREE.GridHelper( size, divisions );
// scene.add( gridHelper );
const axesHelper = new THREE.AxesHelper( 5 );


// GUI
let controls = {
    axes: false,
    grid: false,
}


const gui = new GUI();
const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(camera.position, 'x', -10, 10);
cameraFolder.add(camera.position, 'y', -10, 10);
cameraFolder.add(camera.position, 'z', -10, 10);
cameraFolder.open();

const lightFolder = gui.addFolder('Light');
lightFolder.add(hemilight.position, 'x', -10, 10);
lightFolder.add(hemilight.position, 'y', -10, 10);
lightFolder.add(hemilight.position, 'z', -10, 10);
lightFolder.open();

gui.add(controls, 'axes').name('Show Axes').onChange((value) => {
    if (value) {
        scene.add(axesHelper);
    } else {
        scene.remove(axesHelper);
    }
});

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


