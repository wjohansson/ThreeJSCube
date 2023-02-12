import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from '../node_modules/cannon-es/dist/cannon-es.js';

var cube;
var cubeSize = 2;
var gap = 4;
var cubeGeometry;
var cubeMaterial;
var cubes = [];
var physicsCubes = [];
var cubesPosition = [[0, 0], [0, gap], [gap, gap], [gap, 0], [gap, -1 * gap], [0, -1 * gap], [-1 * gap, -1 * gap], [-1 * gap, 0], [-1 * gap, gap], [-1 * gap, 2 * gap], [0, 2 * gap], [gap, 2 * gap], [2 * gap, 2 * gap], [2 * gap, gap], [2 * gap, 0], [2 * gap, -1 * gap], [2 * gap, -2 * gap], [gap, -2 * gap], [0, -2 * gap], [-1 * gap, -2 * gap], [-2 * gap, -2 * gap], [-2 * gap, -1 * gap], [-2 * gap, 0], [-2 * gap, gap], [-2 * gap, 2 * gap]];
var activeCube = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshStandardMaterial());
const mousePosition = new THREE.Vector2();
const rayCaster = new THREE.Raycaster();
let camera, scene, renderer, boxTexture, clock, orbit;
var moveLeft = false;
var moveRight = false;
var moveForward = false;
var moveBack = false;
let keysPressed = {
    a: false,
    d: false,
    s: false,
    w: false,
    space: false
};

var testCube;


const controls = document.getElementById('controls');
const sizeOptions = document.getElementById('size-options');
const rotationOptions = document.getElementById('rotation-options');
const lookOptions = document.getElementById('look-options');
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
const wireframe = document.getElementById('wireframe');
const newCube = document.getElementById('new-cube');
const addCubeError = document.getElementById('add-cube-error');

function initRenderWorld() {
    boxTexture = new THREE.TextureLoader().load('textures/2k_jupiter.jpg');

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x777777);
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    renderer.shadowMap.enabled = true;

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.1;

    const group = new THREE.Group();

    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -0.5 * Math.PI;
    plane.receiveShadow = true;
    group.add(plane);

    const gridHelper = new THREE.GridHelper(100, 50);
    group.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(3);
    group.add(axesHelper);

    camera.position.set(20, 20, 20);
    orbit.update();

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.4);
    group.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xc0c0c0, 0.8);
    directionalLight.position.set(30, 50, -15);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.mapSize.width = 10000;
    directionalLight.shadow.mapSize.height = 10000;
    group.add(directionalLight);

    const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
    group.add(dLightHelper);

    scene.add(group);

    // const testBoxGeometry = new THREE.BoxGeometry(dimension, dimension, dimension)

    // const testBoxMaterial = new THREE.MeshStandardMaterial({
    //     transparent: true,
    //     map: boxTexture
    // });
    // testCube = new THREE.Mesh(testBoxGeometry, testBoxMaterial);
    // testCube.castShadow = true;
    // scene.add(testCube);

    addCube();


    animate();

}

initPhysicsWorld();

initRenderWorld();

/* Physics */

var physicsWorld, groundBody, dimension, boxBody;

function initPhysicsWorld() {
    physicsWorld = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.82, 0),
    });

    groundBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    physicsWorld.addBody(groundBody);

}

function addCube() {
    if (cubes.length >= 25) {
        addCubeError.innerHTML = "Can not add any more cubes";
        return;
    }

    dimension = 2;
    const halfExtents = new CANNON.Vec3(dimension / 2, dimension / 2, dimension / 2);
    const boxShape = new CANNON.Box(halfExtents);
    boxBody = new CANNON.Body({
        mass: 5,
        shape: boxShape
    });
    var xPosition = cubesPosition[cubes.length][0];
    var zPosition = cubesPosition[cubes.length][1];
    boxBody.position.set(xPosition, 5, zPosition);
    physicsWorld.addBody(boxBody);

    physicsCubes.push(boxBody);

    cubeGeometry = new THREE.BoxGeometry(dimension, dimension, dimension);
    cubeMaterial = new THREE.MeshStandardMaterial({
        transparent: true,
        map: boxTexture
    });

    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // var xPosition = (6 * Math.ceil((cubes.length / 4))) * (cubes.length % 2) * Math.pow(-1, Math.ceil(cubes.length / 2));
    // var yPosition = (6 * Math.ceil((cubes.length / 4))) * ((cubes.length % 2) - 1) * Math.pow(-1, Math.ceil(cubes.length / 2));
    // var xPosition = cubesPosition[cubes.length][0];
    // var zPosition = cubesPosition[cubes.length][1];
    // cube.position.set(xPosition, cubeSize / 2, zPosition);
    cube.castShadow = true;
    scene.add(cube);
    cubes.push(cube);
}

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
    autoRotation.checked = false; // måste fixa individuell rotation först
    speed.value = 0.01; // måste fixa individuell speed först
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
    activeCube.material.map = texture.checked ? boxTexture : null;
    activeCube.material.needsUpdate = true;
}

sizeOptions.addEventListener('input', controlScaleCube);
rotationOptions.addEventListener('input', controlRotateCube);
lookOptions.addEventListener('input', controlLookCube);
newCube.addEventListener('click', addCube);

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
        controls.style.visibility = 'hidden';
        intersect[0].object.material.opacity = 1;
        activeCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        return;
    }

    for (var i = 0; i < physicsCubes.length; i++) {
        if (intersect.length > 0 && cubes[i].id == intersect[0].object.id) {
            cubes.forEach(cube => cube.material.opacity = 1);
            intersect[0].object.material.opacity = 0.70;
            activeCube = physicsCubes[i];
            activateCube(activeCube);
            controls.style.visibility = 'visible';
        }
    }
}

function resize() {
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

window.addEventListener('mousemove', hover);
window.addEventListener('click', hoverClick);
window.addEventListener('resize', resize);

function rotateCube(cube) {
    cube.rotation.y += parseFloat(speed.value);
    cube.rotation.z += parseFloat(speed.value);
    cube.rotation.x += parseFloat(speed.value);
}

window.addEventListener('keydown', moveCube);
window.addEventListener('keyup', stopCube);

function moveCube(e) {
    keysPressed[e.key] = true;
    moveLeft = keysPressed.a;
    moveRight = keysPressed.d;
    moveForward = keysPressed.w;
    moveBack = keysPressed.s;

    // else if (e.key == ' ') {
    //     do {
    //         step += 0.05;
    //         activeCube.position.y = 10 * Math.abs(Math.sin(step)) + 1;
    //     } while (activeCube.position.y < 2)
    // }
};

function stopCube(e) {
    keysPressed[e.key] = false;
    moveLeft = keysPressed.a;
    moveRight = keysPressed.d;
    moveForward = keysPressed.w;
    moveBack = keysPressed.s;

    // else if (e.key == ' ') {
    //     do {
    //         step += 0.05;
    //         activeCube.position.y = 10 * Math.abs(Math.sin(step)) + 1;
    //     } while (activeCube.position.y < 2)
    // }
};

function animate() {
    let deltaTime = clock.getDelta();
    physicsWorld.fixedStep();
    requestAnimationFrame(animate);

    if (moveLeft) {
        activeCube.position.x -= 0.1;
    }

    if (moveRight) {
        activeCube.position.x += 0.1;
    }

    if (moveForward) {
        activeCube.position.z -= 0.1;
    }

    if (moveBack) {
        activeCube.position.z += 0.1;
    }

    if (autoRotation.checked) {
        cubes.forEach(rotateCube);
    }

    orbit.update();
        for (var i = 0; i < cubes.length; i++) {
            cubes[i].position.copy(physicsCubes[i].position);
            cubes[i].quaternion.copy(physicsCubes[i].quaternion);
        }

    renderer.render(scene, camera);
};
