import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

// gltf
const loader = new GLTFLoader();
let model;
let loaded = false;
loader.load( './model/london_eye_london_uk.glb', function ( gltf ) {
	loaded = true;
	// scene.add( gltf.scene );
	model = gltf.scene;
	modelloaded();
}, undefined, function ( error ) {
	console.error( error );
} );

function modelloaded() {
	if (loaded) {
		scene.add( model );
	}
}


// light
const ambilight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambilight );

const hemilight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( hemilight );
const helper = new THREE.HemisphereLightHelper( hemilight, 5 );
scene.add( helper );

// helpers
const gridHelper = new THREE.GridHelper( 100, 100 );
scene.add( gridHelper );

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// animate
function animate() {
	requestAnimationFrame(animate);

	ws.onmessage = (event) => {
		const command = event.data;
		switch (command) {
			case "rotate-left":
				if(loaded){
					model.rotation.y -= 0.1;
				}

				break;
			case "rotate-right":
				if(loaded){
					model.rotation.y += 0.1;
				}
				break;
		} // Render the scene after rotating the cube
	};

	renderer.render(scene, camera);
}
animate();
