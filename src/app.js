import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from 'orbitControls';
// import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js';

const sizeOptions = document.getElementById('size-options');
const rotationOptions = document.getElementById('rotation-options');
const lookOptions = document.getElementById('look-options');
const movementOptions = document.getElementById('movement-options');
const scale = document.getElementById('scale');
const xSize = document.getElementById('x-size');
const ySize = document.getElementById('y-size');
const zSize = document.getElementById('z-size');
const xRotation = document.getElementById('x-rotation');
const yRotation = document.getElementById('y-rotation');
const zRotation = document.getElementById('z-rotation');
const texture = document.getElementById('texture')
const color = document.getElementById('color');
const metalness = document.getElementById('metalness');
const opacity = document.getElementById('opacity');
const autoRotation = document.getElementById('auto-rotate');
const speed = document.getElementById('speed');
const bounce = document.getElementById('bounce');
const wireframe = document.getElementById('wireframe');
const newCube = document.getElementById('new-cube');
const addCubeError = document.getElementById('add-cube-error');

scale.value = 1;
xSize.value = 1;
ySize.value = 1;
zSize.value = 1;
xRotation.value = 0;
yRotation.value = 0;
zRotation.value = 0;
texture.checked = true;
color.value = '#ffffff';
metalness.value = 0;
opacity.value = 1;
autoRotation.checked = false;
speed.value = 0.01;
bounce.checked = true;
wireframe.checked = false;

const boxTexture = new THREE.TextureLoader().load('textures/jupiter.jpg');
// const sphereTexture = new THREE.TextureLoader().load('textures/2k_saturn.jpg');
// const ringTexture = new THREE.TextureLoader().load('textures/2k_saturn_ring_alpha.png');

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

var cube;
var cubeSize = 3;
var gap = 6;
var cubeMaterial;
var cubes = new Array();
var cubesPosition = [[0, 0], [0, gap], [gap, gap], [gap, 0], [gap, -1 * gap], [0, -1 * gap], [ -1 * gap, -1 * gap], [-1 * gap, 0], [-1 * gap, gap], [-1 * gap, 2 * gap], [0, 2 * gap], [gap, 2 * gap], [2 * gap, 2 * gap], [2 * gap, gap], [2 * gap, 0], [2 * gap, -1 * gap], [2 * gap, -2 * gap], [gap, -2 * gap], [0, -2 * gap], [-1 * gap, -2 * gap], [-2 * gap, -2 * gap], [-2 * gap, -1 * gap], [-2 * gap, 0], [-2 * gap, gap], [-2 * gap, 2 * gap]];
function addCube()
{
    if (cubes.length >= 25)
    {
        addCubeError.innerHTML = "Can not add any more cubes";
        return;
    }

    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    cubeMaterial = new THREE.MeshStandardMaterial({ 
        transparent: true
    });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // var xPosition = (6 * Math.ceil((cubes.length / 4))) * (cubes.length % 2) * Math.pow(-1, Math.ceil(cubes.length / 2));
    // var yPosition = (6 * Math.ceil((cubes.length / 4))) * ((cubes.length % 2) - 1) * Math.pow(-1, Math.ceil(cubes.length / 2));
    var xPosition = cubesPosition[cubes.length][0];
    var zPosition = cubesPosition[cubes.length][1];
    cube.position.set(xPosition, 2.5 , zPosition);
    cube.castShadow = true;
    scene.add(cube);
    cubes.push(cube);
}

addCube();


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

camera.position.set(20, 20, 20);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add( ambientLight );

const directionalLight = new THREE.DirectionalLight(0xc0c0c0, 0.8);
directionalLight.position.set(30, 50, -15);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.left = -20;
scene.add( directionalLight );

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(dLightHelper);

const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHelper);

// const gui = new GUI();

const options = {
    cubeColor: '#ffffff',
    wireframe: false,
    speed: speed.value,
    bounce: bounce.checked,
    rotate: autoRotation.checked
}

// gui.addColor(options, 'cubeColor').onChange(function(e){
//     cube.material.color.set(e);
// });

// gui.add(options, 'wireframe').onChange(function(e){
//     cube.material.wireframe = e;
// });

// gui.add(options, 'speed', 0, 0.1)

let step = 0;

sizeOptions.addEventListener('input', function(){
    cube.scale.set(xSize.value * scale.value, ySize.value * scale.value, zSize.value * scale.value);
});

rotationOptions.addEventListener('input', function(){
    cube.rotation.x = xRotation.value * Math.PI * 2;
    cube.rotation.y = yRotation.value * Math.PI * 2;
    cube.rotation.z = zRotation.value * Math.PI * 2;
});

lookOptions.addEventListener('input', function(){
    cubeMaterial.map = texture.cecked ? boxTexture : null;
    cubeMaterial.color.setHex('0x' + color.value.slice(1));
    cubeMaterial.metalness = metalness.value;
    cubeMaterial.opacity = opacity.value;
    cubeMaterial.wireframe = wireframe.checked;
});

newCube.addEventListener('click', function(){
    addCube();
});

window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
});

function rotateCube(cube) {
    cube.rotation.y += parseFloat(speed.value);
    cube.rotation.z += parseFloat(speed.value);
    cube.rotation.x += parseFloat(speed.value);
}

function bounceCube(cube) {
    cube.position.y = 5 * Math.abs(Math.sin(step)) + 2.5;
}

function animate() {
    requestAnimationFrame( animate );

    
    if (autoRotation.checked)
    {
        cubes.forEach(rotateCube);
    }

    if (bounce.checked)
    {
        step += parseFloat(speed.value);
        cubes.forEach(bounceCube)
    }
    

    renderer.render( scene, camera );
};

animate();