// --- 1. SAHNA VA MINIMALIST DIZAYN SOZLAMALARI ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x121216); // Chiroyli quyuq minimalist fon rangi
scene.fog = new THREE.FogExp2(0x121216, 0.015); // Yumshoq tuman

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// --- 2. YUMSHOQ MINIMALIST YORUG'LIKLAR ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Har bir rasm ustidan tushuvchi professional galereya spot-yorug'liklari
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(0, 10, -10);
scene.add(dirLight);

// --- 3. XONA ELEMENTLARI (MINIMALIST TO'STUR) ---
const roomWidth = 10;
const roomHeight = 6;
const roomLength = 35;

// Matnli / silliq pol (Minimalist oqish-kulrang tusda)
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth, roomLength),
    new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.15, metalness: 0.1 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Shift (Shift chiroyli yorug'roq tusda)
const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth, roomLength),
    new THREE.MeshStandardMaterial({ color: 0x0e0e12, roughness: 0.9 })
);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = roomHeight;
scene.add(ceiling);

// Minimalist devorlar (ochiqroq va silliq to'q kulrang)
const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e1e26, roughness: 0.85 });

const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(roomLength, roomHeight), wallMat);
leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
leftWall.rotation.y = Math.PI / 2;
scene.add(leftWall);

const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(roomLength, roomHeight), wallMat);
rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
rightWall.rotation.y = -Math.PI / 2;
scene.add(rightWall);

const backWall = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), wallMat);
backWall.position.set(0, roomHeight / 2, -roomLength / 2);
scene.add(backWall);

// --- 4. 8 TA RASMNI MINIMALIST RAMKALASH ---
const imageFiles = [
    'picture1.jpg', 'picture2.jpg', 'picture3.jpg', 'picture4.jpg', 
    'picture5.jpg', 'picture6.jpg', 'picture7.jpg', 'picture8.jpg'
];

const framePositions = [
    { x: -roomWidth / 2 + 0.05, z: -4,  rot: Math.PI / 2 },  // 1-rasm
    { x: roomWidth / 2 - 0.05,  z: -7,  rot: -Math.PI / 2 }, // 2-rasm
    { x: -roomWidth / 2 + 0.05, z: -10, rot: Math.PI / 2 },  // 3-rasm (8.5 MB)
    { x: roomWidth / 2 - 0.05,  z: -13, rot: -Math.PI / 2 }, // 4-rasm
    { x: -roomWidth / 2 + 0.05, z: -16, rot: Math.PI / 2 },  // 5-rasm
    { x: roomWidth / 2 - 0.05,  z: -19, rot: -Math.PI / 2 }, // 6-rasm
    { x: -roomWidth / 2 + 0.05, z: -22, rot: Math.PI / 2 },  // 7-rasm
    { x: 0,                   z: -34.9, rot: 0 }           // 8-rasm (Orqa devor)
];

const imgLoader = new THREE.ImageLoader();

imageFiles.forEach((file, index) => {
    const pos = framePositions[index];

    // Minimalist ingichka va nafis ramka
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 2.3, 1.9),
        new THREE.MeshStandardMaterial({ color: 0x2d2d38, roughness: 0.2, metalness: 0.5 })
    );
    frame.position.set(pos.x, 3, pos.z);
    scene.add(frame);

    // Rasm joylashuvi
    const imgMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.7, 2.1),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    imgMesh.position.set(pos.x + (pos.rot > 0 ? 0.05 : (pos.rot < 0 ? -0.05 : 0)), 3, pos.z + (pos.rot === 0 ? 0.05 : 0));
    imgMesh.rotation.y = pos.rot;
    scene.add(imgMesh);

    // Rasmni yuklash
    imgLoader.load(file, (image) => {
        const texture = new THREE.CanvasTexture(image);
        imgMesh.material.map = texture;
        imgMesh.material.needsUpdate = true;
    }, undefined, (err) => {
        console.log("Rasm topilmadi: " + file);
    });
});

// --- 5. BOSHQARUV (JOYSTICK VA PUBG USLUBIDAGI KAMERA) ---
let moveX = 0;
let moveZ = 0;
let joystickTouchId = null;
let cameraTouchId = null;

const joystickZone = document.getElementById('joystick-zone');
const thumb = document.getElementById('joystick-thumb');
const maxDist = 45;
let joystickCenter = { x: 0, y: 0 };

let previousTouchPosition = { x: 0, y: 0 };
let cameraAngleX = 0;
let cameraAngleY = 0.3;

window.addEventListener('touchstart', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const rect = joystickZone.getBoundingClientRect();
        const jCenterX = rect.left + rect.width / 2;
        const jCenterY = rect.top + rect.height / 2;
        const distToJoystick = Math.hypot(touch.clientX - jCenterX, touch.clientY - jCenterY);

        if (distToJoystick < 90 && joystickTouchId === null) {
            joystickTouchId = touch.identifier;
            joystickCenter = { x: jCenterX, y: jCenterY };
        } 
        else if (cameraTouchId === null) {
            cameraTouchId = touch.identifier;
            previousTouchPosition = { x: touch.clientX, y: touch.clientY };
        }
    }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        if (touch.identifier === joystickTouchId) {
            let dx = touch.clientX - joystickCenter.x;
            let dy = touch.clientY - joystickCenter.y;
            const dist = Math.hypot(dx, dy);

            if (dist > maxDist) {
                dx = (dx / dist) * maxDist;
                dy = (dy / dist) * maxDist;
            }

            thumb.style.transform = `translate(${dx}px, ${dy}px)`;
            moveX = dx / maxDist;
            moveZ = dy / maxDist;
        }

        if (touch.identifier === cameraTouchId) {
            const deltaX = touch.clientX - previousTouchPosition.x;
            const deltaY = touch.clientY - previousTouchPosition.y;

            cameraAngleX -= deltaX * 0.005;
            cameraAngleY -= deltaY * 0.005;

            cameraAngleY = Math.max(0.05, Math.min(1.4, cameraAngleY));
            previousTouchPosition = { x: touch.clientX, y: touch.clientY };
        }
    }
}, { passive: false });

window.addEventListener('touchend', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchId) {
            joystickTouchId = null;
            moveX = 0;
            moveZ = 0;
            thumb.style.transform = `translate(0px, 0px)`;
        }
        if (touch.identifier === cameraTouchId) {
            cameraTouchId = null;
        }
    }
});

// --- 6. ANIMATSIYA ---
const cameraPos = new THREE.Vector3(0, 2.5, 5);

function animate() {
    requestAnimationFrame(animate);

    const speed = 0.08;
    const forwardX = Math.sin(cameraAngleX);
    const forwardZ = Math.cos(cameraAngleX);
    const rightX = Math.sin(cameraAngleX + Math.PI / 2);
    const rightZ = Math.cos(cameraAngleX + Math.PI / 2);

    const vx = (moveX * rightX + moveZ * forwardX) * speed;
    const vz = (moveX * rightZ + moveZ * forwardZ) * speed;

    cameraPos.x += vx;
    cameraPos.z += vz;

    cameraPos.x = Math.max(-roomWidth / 2 + 1, Math.min(roomWidth / 2 - 1, cameraPos.x));
    cameraPos.z = Math.max(-roomLength / 2 + 1, Math.min(roomLength / 2 - 1, cameraPos.z));

    const targetX = cameraPos.x - Math.sin(cameraAngleX) * Math.cos(cameraAngleY);
    const targetY = cameraPos.y + Math.sin(cameraAngleY);
    const targetZ = cameraPos.z - Math.cos(cameraAngleX) * Math.cos(cameraAngleY);

    camera.position.copy(cameraPos);
    camera.lookAt(targetX, targetY, targetZ);

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
