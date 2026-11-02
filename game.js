let scene, camera, renderer, runner;
let moveLeft = false, moveRight = false;
let mixer;
const clock = new THREE.Clock();

init();
animate();

function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.015);

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 7);

    // 3. Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 5. Track Setup
    const groundGeo = new THREE.PlaneGeometry(20, 1000);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const lineGeo = new THREE.BoxGeometry(0.2, 0.05, 1000);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lineLeft = new THREE.Mesh(lineGeo, lineMat);
    lineLeft.position.set(-2, 0.01, 0);
    scene.add(lineLeft);

    const lineRight = new THREE.Mesh(lineGeo, lineMat);
    lineRight.position.set(2, 0.01, 0);
    scene.add(lineRight);

    // 6. Load 3D Model
    const loader = new THREE.GLTFLoader();
    loader.load(
        'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb', 
        function (gltf) {
            runner = gltf.scene;
            runner.scale.set(0.6, 0.6, 0.6);
            runner.position.set(0, 0, 0);
            runner.rotation.y = Math.PI;
            scene.add(runner);

            mixer = new THREE.AnimationMixer(runner);
            const clips = gltf.animations;
            const runAnim = THREE.AnimationClip.findByName(clips, 'Running') || clips[0];
            if (runAnim) {
                const action = mixer.clipAction(runAnim);
                action.play();
            }
        },
        undefined,
        function (error) {
            console.error('Error loading model:', error);
        }
    );

    // 7. PC Keyboard Controls
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft = true;
        if (e.key === 'ArrowRight' || e.key === 'd') moveRight = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft = false;
        if (e.key === 'ArrowRight' || e.key === 'd') moveRight = false;
    });

    // 8. Mobile Touch / Click Controls for Buttons
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');

    leftBtn.addEventListener('touchstart', () => { moveLeft = true; });
    leftBtn.addEventListener('touchend', () => { moveLeft = false; });
    leftBtn.addEventListener('mousedown', () => { moveLeft = true; });
    leftBtn.addEventListener('mouseup', () => { moveLeft = false; });

    rightBtn.addEventListener('touchstart', () => { moveRight = true; });
    rightBtn.addEventListener('touchend', () => { moveRight = false; });
    rightBtn.addEventListener('mousedown', () => { moveRight = true; });
    rightBtn.addEventListener('mouseup', () => { moveRight = false; });

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    if (runner) {
        if (moveLeft && runner.position.x > -1.8) {
            runner.position.x -= 0.1;
        }
        if (moveRight && runner.position.x < 1.8) {
            runner.position.x += 0.1;
        }
        camera.position.x = runner.position.x * 0.5;
    }

    renderer.render(scene, camera);
      }
