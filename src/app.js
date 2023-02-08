import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from 'orbitControls';
import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js';



const sphereTexture = new THREE.TextureLoader().load('textures/2k_saturn.jpg');
const ringTexture = new THREE.TextureLoader().load('textures/2k_saturn_ring_alpha.png');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.shadowMap.enabled = true;

const orbit = new OrbitControls(camera, renderer.domElement);

// const ringGeometry = new THREE.TorusGeometry(2);
// const ringMaterial = new THREE.MeshStandardMaterial( {  map: ringTexture } );
// const ring = new THREE.Mesh( ringGeometry, ringMaterial );
// ring.DoubleSide;
// ring.position.set(0, 3, 0)
// scene.add( ring );

// const sphereGeometry = new THREE.SphereGeometry(5, 50, 50);
// const sphereMaterial = new THREE.MeshStandardMaterial({ map: sphereTexture});
// const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// sphere.position.set(8, 5, 0);
// sphere.castShadow = true;
// scene.add(sphere);

const cubeGeometry = new THREE.BoxGeometry(5, 5, 5);
const cubeMaterial = new THREE.MeshStandardMaterial({ map: sphereTexture});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 0, 0);
cube.castShadow = true;
cube.metalness = 0;
scene.add(cube);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;
scene.add(plane);

const gridHelper = new THREE.GridHelper(30, 10);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

camera.position.set(10, 10, 10)
orbit.update(); 

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight(0xc0c0c0, 0.8);
directionalLight.position.set(30, 50, 0)
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.left = -15;
scene.add( directionalLight );

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(dLightHelper);

const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHelper);

const gui = new GUI();

const options = {
    cubeColor: '#ffffff',
    wireframe: false,
    speed: 0.01
}

gui.addColor(options, 'cubeColor').onChange(function(e){
    cube.material.color.set(e);
});

gui.add(options, 'wireframe').onChange(function(e){
    cube.material.wireframe = e;
});

gui.add(options, 'speed', 0, 0.1)

let step = 0;


const sizeOptions = document.getElementById('size-options');
const rotationOptions = document.getElementById('rotation-options');
const scale = document.getElementById('scale');
const xSize = document.getElementById('x-size');
const ySize = document.getElementById('y-size');
const zSize = document.getElementById('z-size');
const xRotation = document.getElementById('x-rotation');
const yRotation = document.getElementById('y-rotation');
const zRotation = document.getElementById('z-rotation');
scale.value = 1;
xSize.value = 1;
ySize.value = 1;
zSize.value = 1;
xRotation.value = 0;
yRotation.value = 0;
zRotation.value = 0;

sizeOptions.addEventListener('input', function(){
    cube.scale.set(xSize.value * scale.value, ySize.value * scale.value, zSize.value * scale.value);
});

rotationOptions.addEventListener('input', function(){
    cube.rotation.x = xRotation.value * Math.PI * 2;
    cube.rotation.y = yRotation.value * Math.PI * 2;
    cube.rotation.z = zRotation.value * Math.PI * 2;
});

window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  });

function animate() {
    requestAnimationFrame( animate );

    

    // cube.rotation.x += options.speed;
    // cube.rotation.y += options.speed;

    step += options.speed;
    cube.position.y = 5 * Math.abs(Math.sin(step)) + 2.5;

    renderer.render( scene, camera );
};

animate();