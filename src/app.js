import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from 'orbitControls';
// import { GUI } from '../node_modules/dat.gui/build/dat.gui.module.js';

const controls = document.getElementById('controls');
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
const autoRotation = document.getElementById('auto-rotate');
const speed = document.getElementById('speed');
const bounce = document.getElementById('bounce');
const wireframe = document.getElementById('wireframe');
const newCube = document.getElementById('new-cube');
const addCubeError = document.getElementById('add-cube-error');

controls.style.visibility = 'hidden';
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
autoRotation.checked = false;
speed.value = 0.01;
bounce.checked = true;
wireframe.checked = false;

const boxTexture = new THREE.TextureLoader().load('textures/2k_jupiter.jpg');
// const sphereTexture = new THREE.TextureLoader().load('textures/2k_saturn.jpg');
// const ringTexture = new THREE.TextureLoader().load('textures/2k_saturn_ring_alpha.png');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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
var cubeGeometry;
var cubeMaterial;
var cubes = new Array();
var cubesPosition = [[0, 0], [0, gap], [gap, gap], [gap, 0], [gap, -1 * gap], [0, -1 * gap], [-1 * gap, -1 * gap], [-1 * gap, 0], [-1 * gap, gap], [-1 * gap, 2 * gap], [0, 2 * gap], [gap, 2 * gap], [2 * gap, 2 * gap], [2 * gap, gap], [2 * gap, 0], [2 * gap, -1 * gap], [2 * gap, -2 * gap], [gap, -2 * gap], [0, -2 * gap], [-1 * gap, -2 * gap], [-2 * gap, -2 * gap], [-2 * gap, -1 * gap], [-2 * gap, 0], [-2 * gap, gap], [-2 * gap, 2 * gap]];
var activeCube = new THREE.Mesh(cubeGeometry, cubeMaterial);

function addCube() {
    if (cubes.length >= 25) {
        addCubeError.innerHTML = "Can not add any more cubes";
        return;
    }

    cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    cubeMaterial = new THREE.MeshStandardMaterial({
        transparent: true,
        map: boxTexture
    });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // var xPosition = (6 * Math.ceil((cubes.length / 4))) * (cubes.length % 2) * Math.pow(-1, Math.ceil(cubes.length / 2));
    // var yPosition = (6 * Math.ceil((cubes.length / 4))) * ((cubes.length % 2) - 1) * Math.pow(-1, Math.ceil(cubes.length / 2));
    var xPosition = cubesPosition[cubes.length][0];
    var zPosition = cubesPosition[cubes.length][1];
    cube.position.set(xPosition, 2.5, zPosition);
    cube.castShadow = true;
    scene.add(cube);
    cubes.push(cube);
}

addCube();

const group = new THREE.Group();

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;
group.add(plane);

const gridHelper = new THREE.GridHelper(30, 10);
group.add(gridHelper);

const axesHelper = new THREE.AxesHelper(3);
group.add(axesHelper);

camera.position.set(20, 20, 20);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333);
group.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xc0c0c0, 0.8);
directionalLight.position.set(30, 50, -15);
directionalLight.castShadow = true;
directionalLight.shadow.camera.bottom = -20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.left = -20;
group.add(directionalLight);

const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
group.add(dLightHelper);

scene.add(group);

// const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dLightShadowHelper);

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
function activateCube(cube) {
    scale.value = cube.scale;
    xSize.value = cube.scale.x;
    ySize.value = cube.scale.y;
    zSize.value = cube.scale.z;
    xRotation.value = cube.rotation.x;
    yRotation.value = cube.rotation.y;
    zRotation.value = cube.rotation.z;
    texture.checked = cube.material.map == boxTexture ? true : false;
    color.value = '#' + cube.material.color.getHexString();
    metalness.value = cube.material.metalness;
    autoRotation.checked = false; // måste fixa individuell speed först
    speed.value = 0.01; // måste fixa individuell speed först
    bounce.checked = true; // måste fixa individuell bounce först
    wireframe.checked = cube.material.wireframe;
}

function controlScaleCube() {
    activeCube.scale.set(xSize.value * scale.value, ySize.value * scale.value, zSize.value * scale.value);
}

function controlRotateCube() {
    activeCube.rotation.x = xRotation.value * Math.PI * 2;
    activeCube.rotation.y = yRotation.value * Math.PI * 2;
    activeCube.rotation.z = zRotation.value * Math.PI * 2;
}

function controlLookCube() {
    activeCube.material.color.setHex('0x' + color.value.slice(1));
    activeCube.material.metalness = metalness.value;
    activeCube.material.wireframe = wireframe.checked ? true : false;
}

sizeOptions.addEventListener('input', controlScaleCube);
rotationOptions.addEventListener('input', controlRotateCube);
lookOptions.addEventListener('input', controlLookCube);
newCube.addEventListener('click', addCube);

const mousePosition = new THREE.Vector2();
const rayCaster = new THREE.Raycaster();

function hover(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1;

    rayCaster.setFromCamera(mousePosition, camera);
    const intersect = rayCaster.intersectObjects(scene.children);

    for (var i = 0; i < cubes.length; i++) {

        if (intersect.length > 0 && cubes[i].id == intersect[0].object.id) {
            document.body.style.cursor = 'pointer';
            return;
        }
        document.body.style.cursor = 'default';
    }
}

function hoverClick(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1;

    rayCaster.setFromCamera(mousePosition, camera);
    const intersect = rayCaster.intersectObjects(cubes);

    if (intersect.length > 0 && intersect[0].object.id == activeCube.id) {
        console.log('a');
        controls.style.visibility = 'hidden';
        intersect[0].object.material.opacity = 1;
        activeCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        return;
    }

    for (var i = 0; i < cubes.length; i++) {
        if (intersect.length > 0 && cubes[i].id == intersect[0].object.id) {
            console.log('b');
            cubes.forEach(cube => cube.material.opacity = 1);
            intersect[0].object.material.opacity = 0.70;
            activeCube = intersect[0].object;
            activateCube(activeCube);
            controls.style.visibility = 'visible';
        }
    }
}

function resize () {
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

window.addEventListener('mousemove', hover);
window.addEventListener('click', hoverClick);
window.addEventListener('resize', resize);

function rotateCube() {
    activeCube.rotation.y += parseFloat(speed.value);
    activeCube.rotation.z += parseFloat(speed.value);
    activeCube.rotation.x += parseFloat(speed.value);
}

function bounceCube() {
    activeCube.position.y = 5 * Math.abs(Math.sin(step)) + 1.5;
}

function addTexture() {
    activeCube.material.map = boxTexture;
    activeCube.material.needsUpdate = true;
}

function removeTexture() {
    activeCube.material.map = null;
    activeCube.material.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);

    if (texture.checked) {
        cubes.forEach(addTexture);
    }
    else {
        cubes.forEach(removeTexture);
    }

    if (autoRotation.checked) {
        cubes.forEach(rotateCube);
    }

    if (bounce.checked) {
        step += parseFloat(speed.value);
        cubes.forEach(bounceCube)
    }

    renderer.render(scene, camera);
};

animate();