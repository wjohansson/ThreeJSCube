import * as THREE from 'three';
import { OrbitControls } from 'orbitControls';
// import { GUI } from './../node_modules/dat.gui';

const texture = new THREE.TextureLoader().load('textures/scratched.png');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const orbit = new OrbitControls(camera, renderer.domElement);

const ringGeometry = new THREE.TorusGeometry(2);
const ringMaterial = new THREE.MeshStandardMaterial( {  map: texture } );
const ring = new THREE.Mesh( ringGeometry, ringMaterial );
const light = new THREE.AmbientLight(0xa0a0a0);
ring.position.set(0, 3, 0)
scene.add( ring, light );

const sphereGeometry = new THREE.SphereGeometry(5, 50, 50);
const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(8, 5, 0);
scene.add(sphere);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
scene.add(plane);

const gridHelper = new THREE.GridHelper(30, 10, 'white', 'white');
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

camera.position.set(10, 10, 10)
orbit.update();

// const gui = new GUI();

// const options = {
//     sphereColor: '#ffea00'
// }

// gui.addColor(options, 'sphereColor').onChange(function(e){
//     sphere.material.color.set(e);
// });

function animate() {
    requestAnimationFrame( animate );

    ring.rotation.x += 0.01;
    ring.rotation.y += 0.01;

    renderer.render( scene, camera );
};

animate();