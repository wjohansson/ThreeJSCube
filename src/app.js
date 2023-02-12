import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from '../node_modules/cannon-es/dist/cannon-es.js';

// Inte haft tid att fixa detta:
// Kuber ska inte små studsa vid kollision med marken efter ett hopp
// Går inte att kombinera vissa movement knappar. Tar inte alla inputs då
// Inte ens kollat på möjlighet att fixa omskalning genom visuella pilar istället för html inputs
// Hopp funktionen är inte 100% pålitlig, kan råka bli double jump om man har "otur"
// Kuber "åker in" i varandra lite vid collision, speciellt märkbart vid högre hastigheter på kuben
// Konstiga reaktioner då man åker in i varandra. Kuberna skjuts iväg från varandra. Gissar att det har att göra med att kuberna 
//      intersectar med varandra och tvingas att åka ut ur varandra då man slutar styra via WASD

var cube;
var gap = 4;
var cubeGeometry;
var cubeMaterial;
var cubeNumber;
var cubes = [];
var physicsCubes = [];
var physicsCubesShapes = [];
var cubesPosition = [[0, 0], [0, gap], [gap, gap], [gap, 0], [gap, -1 * gap], [0, -1 * gap], [-1 * gap, -1 * gap], [-1 * gap, 0], [-1 * gap, gap], [-1 * gap, 2 * gap], [0, 2 * gap], [gap, 2 * gap], [2 * gap, 2 * gap], [2 * gap, gap], [2 * gap, 0], [2 * gap, -1 * gap], [2 * gap, -2 * gap], [gap, -2 * gap], [0, -2 * gap], [-1 * gap, -2 * gap], [-2 * gap, -2 * gap], [-2 * gap, -1 * gap], [-2 * gap, 0], [-2 * gap, gap], [-2 * gap, 2 * gap]];
var activeCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
var activePhysicsCube = null;
const mousePosition = new THREE.Vector2();
const rayCaster = new THREE.Raycaster();
let camera, scene, renderer, boxTexture, clock, orbit;
var moveLeft = false;
var moveRight = false;
var moveForward = false;
var moveBack = false;
var rotateRight = false;
var rotateLeft = false;
var jump = false;
let keysPressed = {
    a: false,
    d: false,
    s: false,
    w: false,
    space: false
};
var speeds = [];
var rotationSpeeds = [];

const controls = document.getElementById('controls');
const sizeOptions = document.getElementById('size-options');
const lookOptions = document.getElementById('look-options');
const movementOptions = document.getElementById('movement-options');
const xSize = document.getElementById('x-size');
const ySize = document.getElementById('y-size');
const zSize = document.getElementById('z-size');
const texture = document.getElementById('texture')
const color = document.getElementById('color');
const metalness = document.getElementById('metalness');
const speed = document.getElementById('speed');
const rotationSpeed = document.getElementById('rotation-speed');
const wireframe = document.getElementById('wireframe');
const newCube = document.getElementById('new-cube');
const addCubeError = document.getElementById('add-cube-error');

function initRenderWorld() {
    boxTexture = new THREE.TextureLoader().load('textures/2k_jupiter.jpg');

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x777777, 0.015, 100)
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

    const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    const planeMaterial = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -0.5 * Math.PI;
    plane.receiveShadow = true;
    group.add(plane);

    const gridHelper = new THREE.GridHelper(1000, 500);
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

    addCube();

    animate();
}

initPhysicsWorld();

initRenderWorld();

/* Physics */

var physicsWorld, groundBody, dimension, boxBody, groundBodyMaterial, boxBodyMaterial, boxShape;

function initPhysicsWorld() {
    physicsWorld = new CANNON.World({
        gravity: new CANNON.Vec3(0, -9.82, 0),
    });

    groundBodyMaterial = new CANNON.Material();

    groundBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
        material: groundBodyMaterial
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
    boxShape = new CANNON.Box(halfExtents);
    boxBodyMaterial = new CANNON.Material();
    boxBody = new CANNON.Body({
        mass: 5,
        shape: boxShape,
        material: boxBodyMaterial
    });
    var xPosition = cubesPosition[cubes.length][0];
    var zPosition = cubesPosition[cubes.length][1];
    boxBody.position.set(xPosition, 5, zPosition);
    physicsWorld.addBody(boxBody);

    physicsCubes.push(boxBody);
    physicsCubesShapes.push(boxShape);

    cubeGeometry = new THREE.BoxGeometry(dimension, dimension, dimension);
    cubeMaterial = new THREE.MeshStandardMaterial({
        transparent: true,
        map: boxTexture
    });

    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    scene.add(cube);
    cubes.push(cube);
    speeds.push(1);
    rotationSpeeds.push(1);
    const groundBoxContactMaterial = new CANNON.ContactMaterial(
        groundBodyMaterial,
        boxBodyMaterial,
        { friction: 0.01 },
        { restitution : 0},
    );

    physicsWorld.addContactMaterial(groundBoxContactMaterial);
}

function activateCube(cube) {
    cubeNumber = cubes.indexOf(cube);

    xSize.value = cube.scale.x;
    ySize.value = cube.scale.y;
    zSize.value = cube.scale.z;
    texture.checked = cube.material.map == boxTexture ? true : false;
    color.value = '#' + cube.material.color.getHexString();
    metalness.value = cube.material.metalness;
    speed.value = speeds[cubeNumber]; // måste fixa individuell speed först
    rotationSpeed.value = rotationSpeeds[cubeNumber];
    wireframe.checked = cube.material.wireframe;
}

function controlScaleCube() {
    activeCube.scale.set(xSize.value, ySize.value, zSize.value);
    var oldBoxShape = physicsCubesShapes[physicsCubes.indexOf(activePhysicsCube)];
    activePhysicsCube.removeShape(oldBoxShape);
    const newHalfExtents = new CANNON.Vec3(dimension / 2 * xSize.value, dimension / 2 * ySize.value, dimension / 2 * zSize.value);
    var newBoxShape = new CANNON.Box(newHalfExtents);
    activePhysicsCube.addShape(newBoxShape);
    physicsCubesShapes[physicsCubes.indexOf(activePhysicsCube)] = newBoxShape;
}

function controlLookCube() {
    activeCube.material.color.setHex('0x' + color.value.slice(1));
    activeCube.material.metalness = metalness.value;
    activeCube.material.wireframe = wireframe.checked ? true : false;
    activeCube.material.map = texture.checked ? boxTexture : null;
    activeCube.material.needsUpdate = true;
}

function controlMovementOptions() {
    speeds[cubeNumber] = speed.value;
    rotationSpeeds[cubeNumber] = rotationSpeed.value;
}

sizeOptions.addEventListener('input', controlScaleCube);
lookOptions.addEventListener('input', controlLookCube);
movementOptions.addEventListener('input', controlMovementOptions);
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
        activePhysicsCube = null;
        return;
    }

    for (var i = 0; i < physicsCubes.length; i++) {
        if (intersect.length > 0 && cubes[i].id == intersect[0].object.id) {
            cubes.forEach(cube => cube.material.opacity = 1);
            intersect[0].object.material.opacity = 0.70;
            activeCube = cubes[i];
            activePhysicsCube = physicsCubes[i];
            activateCube(activeCube);
            controls.style.visibility = 'visible';
        }
    }
}

function resize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

window.addEventListener('mousemove', hover);
window.addEventListener('click', hoverClick);
window.addEventListener('resize', resize);

window.addEventListener('keydown', moveCube);
window.addEventListener('keyup', stopCube);

function moveCube(e) {
    keysPressed[e.key] = true;
    keysPressed.space = e.key == " " ? true : false;

    moveLeft = keysPressed.a;
    moveRight = keysPressed.d;
    moveForward = keysPressed.w;
    moveBack = keysPressed.s;
    rotateRight = keysPressed.e;
    rotateLeft = keysPressed.q;
    jump = keysPressed.space;

};

function stopCube(e) {
    keysPressed[e.key] = false;
    keysPressed.space = false;

    moveLeft = keysPressed.a;
    moveRight = keysPressed.d;
    moveForward = keysPressed.w;
    moveBack = keysPressed.s;
    rotateRight = keysPressed.e;
    rotateLeft = keysPressed.q;
    jump = keysPressed.space;
};

function animate() {
    physicsWorld.fixedStep();
    requestAnimationFrame(animate);

    if (activePhysicsCube != null) {

        if (moveLeft && moveForward) {
            activePhysicsCube.position.x -= Math.sin(Math.PI / 4) * 0.1 * speed.value;
            activePhysicsCube.position.z -= Math.sin(Math.PI / 4) * 0.1 * speed.value;
        }
        else if (moveLeft && moveBack) {
            activePhysicsCube.position.x -= Math.sin(Math.PI / 4) * 0.1 * speed.value;
            activePhysicsCube.position.z += Math.sin(Math.PI / 4) * 0.1 * speed.value;

        }
        else if (moveRight && moveForward) {
            activePhysicsCube.position.x += Math.sin(Math.PI / 4) * 0.1 * speed.value;
            activePhysicsCube.position.z -= Math.sin(Math.PI / 4) * 0.1 * speed.value;
        }
        else if (moveRight && moveBack) {
            activePhysicsCube.position.x += Math.sin(Math.PI / 4) * 0.1 * speed.value;
            activePhysicsCube.position.z += Math.sin(Math.PI / 4) * 0.1 * speed.value;
        }
        else if (moveLeft) {
            activePhysicsCube.position.x -= 0.1 * speed.value;
        }
        else if (moveRight) {
            activePhysicsCube.position.x += 0.1 * speed.value;
        }
        else if (moveForward) {
            activePhysicsCube.position.z -= 0.1 * speed.value;
        }
        else if (moveBack) {
            activePhysicsCube.position.z += 0.1 * speed.value;
        }

        if (rotateLeft && rotateRight) {
            activePhysicsCube.angularVelocity.set(0, 0, 0);
        }
        else if (rotateLeft) {
            activePhysicsCube.angularVelocity.set(0, 5 * rotationSpeed.value, 0);
        }
        else if (rotateRight) {
            activePhysicsCube.angularVelocity.set(0, -5 * rotationSpeed.value, 0);
        }
        else {
            activePhysicsCube.angularVelocity.set(0, 0, 0);
        }

        if (activePhysicsCube.velocity.y <= 0.005 && activePhysicsCube.velocity.y >= -0.005 && jump) {
            activePhysicsCube.applyImpulse(new CANNON.Vec3(0, 50, 0));
        }
    }

    orbit.update();

    for (var i = 0; i < cubes.length; i++) {
        cubes[i].position.copy(physicsCubes[i].position);
        cubes[i].quaternion.copy(physicsCubes[i].quaternion);
    }

    renderer.render(scene, camera);
};
