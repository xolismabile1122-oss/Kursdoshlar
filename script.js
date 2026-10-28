const profiles = [
    { name: "Saidusmon", handle: "@az1mjonov_721", url: "https://www.instagram.com/az1mjonov_721?exln=eHZsdXJtMXU5Y3dw", img: "picture1.jpg" },
    { name: "Iftixor", handle: "@1ft1x0ro9", url: "https://www.instagram.com/1ft1x0ro9?vrfl=dnZ2cWMwemNubDQw", img: "picture2.jpg" },
    { name: "Abdulboriy", handle: "@_maestro07_", url: "https://www.instagram.com/_maestro07_?obrf=MXdkYXJxZGc3ODl1Ng==", img: "picture3.jpg" },
    { name: "Mohlaroy", handle: "@ruxsar.__", url: "https://www.instagram.com/ruxsar.__?exln=MWI1azVzcmZucG0z", img: "picture4.jpg" },
    { name: "Muhammadrizo", handle: "@rizosdiaries", url: "https://www.instagram.com/rizosdiaries?srtk=MXY5aGhvOWhzZGZzYg==", img: "picture5.jpg" },
    { name: "Xondamir", handle: "@xon_damir04", url: "https://www.instagram.com/xon_damir04?exln=MXQzc3hmOHhkZmxocA==", img: "picture6.jpg" },
    { name: "Muhammadziyo", handle: "@ziyo.xd", url: "https://www.instagram.com/ziyo.xd?mdxt=MXF0ZHMxZGUwdnUzbw==", img: "picture7.jpg" },
    { name: "Mubina", handle: "@___mvnx___", url: "https://www.instagram.com/___mvnx___?obrf=MXV5NXNleDdvem45Mw==", img: "picture8.jpg" },
    { name: "ikkinchi acounti", handle: "ikkinchi acounti", url: "https://www.instagram.com/tillo.athlete?mdxt=N2praThiaWo1cmZ1", img: "picture9.jpg" },
    { name: "Qudratillo", handle: "@isomiddinov.dev", url: "https://www.instagram.com/isomiddinov.dev?mdxt=MWF6Ym5ydm9zMW5kcg%3D%3D&utm_source=qr", img: "picture10.jpg" }
];

let scene, camera, renderer;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let targetRotationX = 0;
let targetRotationY = 0;
let cameraRotationX = 0;
let cameraRotationY = 0;

let interactableMeshes = [];
let doorMesh = null;
let isDoorOpen = false;
let currentClosestProfile = null;
const raycaster = new THREE.Raycaster();

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1c24);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Foydalanuvchi dastlab tashqarida (muzey eshigining ro'parasida) turadi
    camera.position.set(0, 1.6, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    createEnvironment();
    setupControls();
}

function createEnvironment() {
    const textureLoader = new THREE.TextureLoader();

    // 1. Tashqi hudud va Ichki xona uchun pol
    const floorGeo = new THREE.PlaneGeometry(35, 50);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f2b33, roughness: 0.3 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = 5;
    scene.add(floor);

    // Shift
    const ceilingGeo = new THREE.PlaneGeometry(35, 50);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x16424e, roughness: 0.9 });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 5.5, 5);
    scene.add(ceiling);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1d5f6f, roughness: 0.8 });

    // Ichki xona devorlari (z: 0 dan oldinda joylashgan)
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(28, 5.5), wallMat);
    backWall.position.set(0, 2.75, -14);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(30, 5.5), wallMat);
    leftWall.position.set(-14, 2.75, 1);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(30, 5.5), wallMat);
    rightWall.position.set(14, 2.75, 1);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);

    // Oldingi devor (Eshik joylashgan devor, z = 14)
    // O'rtasida eshik uchun bo'shliq qoldiramiz (chap va o'ng qism)
    const frontWallLeft = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 5.5), wallMat);
    frontWallLeft.position.set(-7.75, 2.75, 14);
    scene.add(frontWallLeft);

    const frontWallRight = new THREE.Mesh(new THREE.PlaneGeometry(12.5, 5.5), wallMat);
    frontWallRight.position.set(7.75, 2.75, 14);
    scene.add(frontWallRight);

    const frontWallTop = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.8), wallMat);
    frontWallTop.position.set(0, 4.6, 14);
    scene.add(frontWallTop);

    // --- ESHIK VA STIKER ---
    const doorGroup = new THREE.Group();
    doorGroup.position.set(0, 1.85, 14);

    // Eshik paneli (ochiladigan qism)
    const doorGeo = new THREE.PlaneGeometry(3, 3.7);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x0b1c24, roughness: 0.4 });
    doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.userData = { isDoor: true };
    interactableMeshes.push(doorMesh);
    doorGroup.add(doorMesh);

    // Eshik ustidagi stiker yozuvi ("1-guruh profil muzeyi – Kirish")
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 1024;
    signCanvas.height = 256;
    const sCtx = signCanvas.getContext('2d');

    sCtx.fillStyle = '#0f172a';
    sCtx.fillRect(0, 0, 1024, 256);
    sCtx.lineWidth = 12;
    sCtx.strokeStyle = '#dc2743';
    sCtx.strokeRect(6, 6, 1012, 244);

    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 45px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText("1-guruh profil muzeyi", 512, 85);

    sCtx.fillStyle = '#38bdf8';
    sCtx.font = 'bold 40px sans-serif';
    sCtx.fillText("🚪 K I R I S H (Eshikni bosing)", 512, 175);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signGeo = new THREE.PlaneGeometry(2.6, 1.0);
    const signMat = new THREE.MeshBasicMaterial({ map: signTexture, transparent: true });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, 2.3, 0.05);
    doorGroup.add(signMesh);

    scene.add(doorGroup);

    // --- 10 TA RAMKA VA RASMLARNI ICHKI XONAGA JOYLASHTIRISH ---
    const positions = [
        { x: -7.5, y: 2.5, z: -13.8, rotY: 0 },
        { x: -2.5, y: 2.5, z: -13.8, rotY: 0 },
        { x: 2.5,  y: 2.5, z: -13.8, rotY: 0 },
        { x: 7.5,  y: 2.5, z: -13.8, rotY: 0 },
        { x: 13.8, y: 2.5, z: -6,    rotY: -Math.PI / 2 },
        { x: 13.8, y: 2.5, z: 0,     rotY: -Math.PI / 2 },
        { x: 13.8, y: 2.5, z: 6,     rotY: -Math.PI / 2 },
        { x: 3,    y: 2.5, z: 10,    rotY: Math.PI },
        { x: -3,   y: 2.5, z: 10,    rotY: Math.PI },
        { x: -13.8,y: 2.5, z: 0,     rotY: Math.PI / 2 }
    ];

    profiles.forEach((profile, index) => {
        const pos = positions[index];
        const frameGroup = new THREE.Group();
        frameGroup.position.set(pos.x, pos.y, pos.z);
        frameGroup.rotation.y = pos.rotY;

        // Ramka
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = 256;
        frameCanvas.height = 320;
        const fCtx = frameCanvas.getContext('2d');
        const grad = fCtx.createLinearGradient(0, 0, 256, 320);
        grad.addColorStop(0, '#f09433');
        grad.addColorStop(0.25, '#e6683c');
        grad.addColorStop(0.5, '#dc2743');
        grad.addColorStop(0.75, '#cc2366');
        grad.addColorStop(1, '#bc1888');
        fCtx.fillStyle = grad;
        fCtx.fillRect(0, 0, 256, 320);

        const frameTexture = new THREE.CanvasTexture(frameCanvas);
        const frameGeo = new THREE.BoxGeometry(2.3, 3.2, 0.12);
        const frameMat = new THREE.MeshBasicMaterial({ map: frameTexture });
        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        
        frameMesh.userData = profile;
        interactableMeshes.push(frameMesh);
        frameGroup.add(frameMesh);

        // Rasm
        const imgGeo = new THREE.PlaneGeometry(2.1, 2.7);
        textureLoader.load(
            profile.img,
            (texture) => {
                const imgMat = new THREE.MeshBasicMaterial({ map: texture });
                const imgMesh = new THREE.Mesh(imgGeo, imgMat);
                imgMesh.position.set(0, 0, 0.08);
                imgMesh.userData = profile;
                interactableMeshes.push(imgMesh);
                frameGroup.add(imgMesh);
            },
            undefined,
            () => {
                const fallbackMat = new THREE.MeshBasicMaterial({ color: 0x0095f6 });
                const fallbackMesh = new THREE.Mesh(imgGeo, fallbackMat);
                fallbackMesh.position.set(0, 0, 0.08);
                fallbackMesh.userData = profile;
                interactableMeshes.push(fallbackMesh);
                frameGroup.add(fallbackMesh);
            }
        );

        // Devordagi ism
        const nameCanvas = document.createElement('canvas');
        nameCanvas.width = 1024;
        nameCanvas.height = 200;
        const nCtx = nameCanvas.getContext('2d');
        nCtx.fillStyle = '#ffffff';
        nCtx.font = 'bold 80px sans-serif';
        nCtx.textAlign = 'center';
        nCtx.textBaseline = 'middle';
        nCtx.fillText(profile.name, 512, 100);

        const nameTexture = new THREE.CanvasTexture(nameCanvas);
        const nameMat = new THREE.MeshBasicMaterial({ map: nameTexture, transparent: true });
        const nameGeo = new THREE.PlaneGeometry(2.2, 0.45);
        const nameMesh = new THREE.Mesh(nameGeo, nameMat);
        nameMesh.position.set(0, 2.1, 0.05);
        frameGroup.add(nameMesh);

        // Nikneym
        const nickCanvas = document.createElement('canvas');
        nickCanvas.width = 1024;
        nickCanvas.height = 200;
        const nickCtx = nickCanvas.getContext('2d');
        
        const nickGrad = nickCtx.createLinearGradient(0, 0, 1024, 0);
        nickGrad.addColorStop(0, '#3b82f6'); 
        nickGrad.addColorStop(1, '#ef4444'); 
        nickCtx.fillStyle = nickGrad;
        nickCtx.font = 'bold 75px sans-serif';
        nickCtx.textAlign = 'center';
        nickCtx.textBaseline = 'middle';
        nickCtx.fillText(profile.handle, 512, 100);

        const nickTexture = new THREE.CanvasTexture(nickCanvas);
        const nickMat = new THREE.MeshBasicMaterial({ map: nickTexture, transparent: true });
        const nickGeo = new THREE.PlaneGeometry(2.2, 0.45);
        const nickMesh = new THREE.Mesh(nickGeo, nickMat);
        nickMesh.position.set(0, -1.95, 0.05);
        frameGroup.add(nickMesh);

        scene.add(frameGroup);
    });
}

function setupControls() {
    let isMouseDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    window.addEventListener('mousedown', (e) => {
        isMouseDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
        if (!isMouseDragging) return;
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        targetRotationY -= deltaX * 0.003;
        targetRotationX -= deltaY * 0.003; 
        targetRotationX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotationX));

        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => { isMouseDragging = false; });

    // Joystik va Touch boshqaruvi
    const thumb = document.getElementById('joystick-thumb');
    const base = document.getElementById('joystick-base');
    let joystickActive = false;
    let joystickTouchId = null;
    let joystickCenter = { x: 0, y: 0 };
    let lookTouchId = null;
    let previousTouchPosition = { x: 0, y: 0 };

    window.addEventListener('touchstart', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);

            if (target && (target === base || target === thumb || base.contains(target))) {
                if (!joystickActive) {
                    joystickTouchId = touch.identifier;
                    joystickActive = true;
                    const rect = base.getBoundingClientRect();
                    joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                }
            } else {
                if (lookTouchId === null) {
                    lookTouchId = touch.identifier;
                    previousTouchPosition = { x: touch.clientX, y: touch.clientY };
                }
            }
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];

            if (joystickActive && touch.identifier === joystickTouchId) {
                let dx = touch.clientX - joystickCenter.x;
                let dy = touch.clientY - joystickCenter.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 35;

                if (dist > maxDist) {
                    dx = (dx / dist) * maxDist;
                    dy = (dy / dist) * maxDist;
                }

                thumb.style.transform = `translate(${dx}px, ${dy}px)`;

                moveForward = dy < -5;
                moveBackward = dy > 5;
                moveLeft = dx > 5;     
                moveRight = dx < -5;   
            }

            if (lookTouchId !== null && touch.identifier === lookTouchId) {
                const deltaX = touch.clientX - previousTouchPosition.x;
                const deltaY = touch.clientY - previousTouchPosition.y;

                targetRotationY -= deltaX * 0.003;
                targetRotationX -= deltaY * 0.003; 
                targetRotationX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotationX));

                previousTouchPosition = { x: touch.clientX, y: touch.clientY };
            }
        }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];

            if (joystickActive && touch.identifier === joystickTouchId) {
                joystickActive = false;
                joystickTouchId = null;
                thumb.style.transform = `translate(0px, 0px)`;
                moveForward = moveBackward = moveLeft = moveRight = false;
            }

            if (lookTouchId !== null && touch.identifier === lookTouchId) {
                lookTouchId = null;
            }
        }
    }, { passive: true });

    // Tugmani bosganda: agar eshikka qaralgan bo'lsa eshik ochiladi, rasmga qaralgan bo'lsa profil ochiladi
    const viewBtn = document.getElementById('view-profile-btn');
    viewBtn.addEventListener('click', () => {
        if (currentClosestProfile) {
            if (currentClosestProfile.isDoor) {
                // Eshikni ochish va ichkariga o'tkazish
                isDoorOpen = true;
                if (doorMesh) doorMesh.visible = false; // Eshik ochiladi
                document.getElementById('action-prompt').classList.add('hidden');
            } else {
                window.location.href = currentClosestProfile.url;
            }
        }
    });
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = Math.min((time - prevTime) / 1000, 0.1);

    cameraRotationY += (targetRotationY - cameraRotationY) * 0.2;
    cameraRotationX += (targetRotationX - cameraRotationX) * 0.2;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z -= direction.z * 35.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 35.0 * delta;

    const cos = Math.cos(cameraRotationY);
    const sin = Math.sin(cameraRotationY);

    camera.position.x += (velocity.z * sin + velocity.x * cos) * delta;
    camera.position.z += (velocity.z * cos - velocity.x * sin) * delta;

    // Harakat chegaralari (Agar eshik ochiq bo'lsa, xonaga bemalol kirib yura oladi)
    camera.position.x = Math.max(-12, Math.min(12, camera.position.x));
    if (!isDoorOpen) {
        camera.position.z = Math.max(8, Math.min(22, camera.position.z)); // Dastlab tashqarida ushlab turadi
    } else {
        camera.position.z = Math.max(-12, Math.min(22, camera.position.z)); // Xonaga kirgach to'liq erkinlik
    }

    camera.rotation.set(0, 0, 0);
    camera.rotateY(cameraRotationY);
    camera.rotateX(cameraRotationX);

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(interactableMeshes);

    const promptEl = document.getElementById('action-prompt');
    const btnEl = document.getElementById('view-profile-btn');
    const labelEl = document.getElementById('profile-nickname-label');

    if (intersects.length > 0 && intersects[0].distance < 5.5) {
        const objData = intersects[0].object.userData;
        currentClosestProfile = objData;

        if (objData.isDoor && !isDoorOpen) {
            labelEl.innerText = "Muzeyga kirish";
            btnEl.innerText = "Eshikni ochish";
            promptEl.classList.remove('hidden');
        } else if (!objData.isDoor) {
            labelEl.innerText = objData.handle;
            btnEl.innerText = "Profilni ko'rish";
            promptEl.classList.remove('hidden');
        } else {
            promptEl.classList.add('hidden');
        }
    } else {
        currentClosestProfile = null;
        promptEl.classList.add('hidden');
    }

    prevTime = time;
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
