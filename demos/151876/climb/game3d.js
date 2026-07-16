/**
 * ============================================================
 *  山峰攀登游戏 - Three.js 3D 场景模块
 *  通过 CDN script 标签全局加载 Three.js
 * ============================================================
 */

(function () {
    "use strict";

    // 等待 THREE 全局对象就绪
    if (typeof THREE === 'undefined') {
        console.error('Three.js 未加载，请检查 CDN 连接');
        return;
    }

// ────────── 场景初始化 ──────────
const container = document.getElementById('scene3d');
const scene = new THREE.Scene();

/* 天空蓝背景 */
scene.background = new THREE.Color('#B0E0FF');

/* 渲染器 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

/* 透视摄像机 - 全景视角 */
const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 200);
camera.position.set(55, 8, 55);
camera.lookAt(0, 0, 0);

let cameraDistance = 12;
let panoramaMode = true;

container.addEventListener('wheel', function(e) {
    e.preventDefault();
    cameraDistance += e.deltaY * 0.01;
    cameraDistance = Math.max(8, Math.min(20, cameraDistance));
}, { passive: false });

/* 环境光 + 方向光 */
const ambientLight = new THREE.AmbientLight('#ffffff', 1.0);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight('#fffef0', 0.9);
sunLight.position.set(20, 30, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 80;
sunLight.shadow.camera.left = -25;
sunLight.shadow.camera.right = 25;
sunLight.shadow.camera.top = 35;
sunLight.shadow.camera.bottom = -5;
scene.add(sunLight);

/* 半球光补充底部亮度 */
const hemiLight = new THREE.HemisphereLight('#87CEEB', '#8BC34A', 0.3);
scene.add(hemiLight);

// ────────── 常量 ──────────
const MOUNTAIN_HEIGHT = 45;
const MOUNTAIN_BASE_RADIUS = 15;
const MAX_GAME_HEIGHT = 10000;

// ────────── 地面 ──────────
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshToonMaterial({
    color: '#7EC850',
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -22.5;
ground.receiveShadow = true;
scene.add(ground);

// ────────── 山峰模型（三层堆叠圆柱体） ──────────
const mountainGroup = new THREE.Group();

/* 底层 - 深绿色山脚 (0 ~ 27) */
const baseGeo = new THREE.CylinderGeometry(6, 15, 27, 32);
const baseMat = new THREE.MeshToonMaterial({
    color: '#388E3C',
});
const base = new THREE.Mesh(baseGeo, baseMat);
base.position.y = 13.5;
base.castShadow = true;
base.receiveShadow = true;
mountainGroup.add(base);

/* 中层 - 深绿色岩石带 (27 ~ 40.5) */
const midGeo = new THREE.CylinderGeometry(2, 6, 13.5, 32);
const midMat = new THREE.MeshToonMaterial({
    color: '#66BB6A',
});
const mid = new THREE.Mesh(midGeo, midMat);
mid.position.y = 33.75;
mid.castShadow = true;
mid.receiveShadow = true;
mountainGroup.add(mid);

/* 顶层 - 浅绿色峰顶 (40.5 ~ 45) */
const topGeo = new THREE.CylinderGeometry(0, 2, 4.5, 32);
const topMat = new THREE.MeshToonMaterial({
    color: '#A5D6A7',
});
const top = new THREE.Mesh(topGeo, topMat);
top.position.y = 42.75;
top.castShadow = true;
top.receiveShadow = true;
mountainGroup.add(top);

// ────────── 山面岩石 ──────────
const rockMat = new THREE.MeshToonMaterial({ color: '#9E9E9E' });
for (let i = 0; i < 30; i++) {
    const rockY = Math.random() * (MOUNTAIN_HEIGHT - 2);
    const r = MOUNTAIN_BASE_RADIUS * (1 - rockY / MOUNTAIN_HEIGHT);
    const angle = Math.random() * Math.PI * 2;
    const rockGeo = new THREE.BoxGeometry(
        0.2 + Math.random() * 0.5,
        0.15 + Math.random() * 0.3,
        0.2 + Math.random() * 0.5
    );
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(
        Math.cos(angle) * (r + 0.1),
        rockY,
        Math.sin(angle) * (r + 0.1)
    );
    rock.rotation.x = Math.random() * Math.PI;
    rock.rotation.z = Math.random() * Math.PI;
    mountainGroup.add(rock);
}

// ────────── 山面灌木 ──────────
const bushColors = ['#66BB6A', '#81C784', '#4CAF50'];
for (let i = 0; i < 20; i++) {
    const bushY = Math.random() * 20;
    const r = MOUNTAIN_BASE_RADIUS * (1 - bushY / MOUNTAIN_HEIGHT);
    const angle = Math.random() * Math.PI * 2;
    const bushGeo = new THREE.ConeGeometry(0.2 + Math.random() * 0.35, 0.4 + Math.random() * 0.5, 6);
    const bushMat = new THREE.MeshToonMaterial({ color: bushColors[Math.floor(Math.random() * bushColors.length)] });
    const bush = new THREE.Mesh(bushGeo, bushMat);
    bush.position.set(
        Math.cos(angle) * (r + 0.15),
        bushY,
        Math.sin(angle) * (r + 0.15)
    );
    mountainGroup.add(bush);
}

// ────────── 溪流 ──────────
const streamMat = new THREE.MeshToonMaterial({ color: '#64B5F6' });
const streamPoints = 30;
const streamAngle = Math.PI * 0.3; // fixed angle for stream side
for (let i = 0; i < streamPoints; i++) {
    const t = i / streamPoints;
    const streamY = MOUNTAIN_HEIGHT * 0.6 * (1 - t); // from 60% height down to 0
    const r = MOUNTAIN_BASE_RADIUS * (1 - streamY / MOUNTAIN_HEIGHT) + 0.15;
    const wobble = Math.sin(t * 8) * 0.5;
    const streamGeo = new THREE.PlaneGeometry(0.3, 0.8);
    const streamSeg = new THREE.Mesh(streamGeo, streamMat);
    streamSeg.position.set(
        Math.cos(streamAngle + wobble * 0.1) * r,
        streamY,
        Math.sin(streamAngle + wobble * 0.1) * r
    );
    streamSeg.lookAt(new THREE.Vector3(0, streamY, 0));
    mountainGroup.add(streamSeg);
}

mountainGroup.position.y = -22.5;
scene.add(mountainGroup);

// ────────── 远景山脉（4座山丘） ──────────
const distantMountainParams = [
    { angle: 60 * Math.PI / 180, radius: 50, height: 10, color: '#7CB342' },
    { angle: 150 * Math.PI / 180, radius: 57, height: 14, color: '#9CCC65' },
    { angle: 210 * Math.PI / 180, radius: 63, height: 11, color: '#AED581' },
    { angle: 300 * Math.PI / 180, radius: 72, height: 17, color: '#C5E1A5' },
];

for (let i = 0; i < distantMountainParams.length; i++) {
    const p = distantMountainParams[i];
    const hillGeo = new THREE.ConeGeometry(4, p.height, 16);
    const hillMat = new THREE.MeshToonMaterial({ color: p.color });
    const hill = new THREE.Mesh(hillGeo, hillMat);
    hill.position.set(
        Math.cos(p.angle) * p.radius,
        -22.5 + p.height / 2,
        Math.sin(p.angle) * p.radius
    );
    hill.castShadow = false;
    hill.receiveShadow = false;
    scene.add(hill);
}

// ────────── 湖泊 ──────────
const lakeGeo = new THREE.CircleGeometry(7, 32);
const lakeMat = new THREE.MeshToonMaterial({ color: '#5C9CE5' });
const lake = new THREE.Mesh(lakeGeo, lakeMat);
lake.rotation.x = -Math.PI / 2;
lake.position.set(42, -22.42, 15);
scene.add(lake);

// ────────── 漂浮云朵 ──────────
const clouds = [];

for (let i = 0; i < 10; i++) {
    const cloudGroup = new THREE.Group();
    const boxMat = new THREE.MeshToonMaterial({ color: '#FFFFFF' });

    const boxCount = 2 + Math.floor(Math.random() * 2);
    for (let j = 0; j < boxCount; j++) {
        const boxGeo = new THREE.BoxGeometry(
            1 + Math.random() * 2,
            0.3 + Math.random() * 0.5,
            1 + Math.random() * 2
        );
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 3
        );
        cloudGroup.add(box);
    }

    cloudGroup.position.set(
        (Math.random() - 0.5) * 80,
        20 + Math.random() * 18,
        (Math.random() - 0.5) * 80
    );
    const scale = 1.0 + Math.random() * 1.5;
    cloudGroup.scale.setScalar(scale);
    scene.add(cloudGroup);
    clouds.push(cloudGroup);
}

// ────────── 树木装饰（山脚周围随机散布） ──────────
function createTree(x, z) {
    const treeGroup = new THREE.Group();

    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.22, 1.8, 6);
    const trunkMat = new THREE.MeshToonMaterial({ color: '#8B6914' });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.9;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const foliageGeo = new THREE.ConeGeometry(1.0, 2.2, 8);
    const foliageMat = new THREE.MeshToonMaterial({ color: '#66BB6A' });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.y = 2.4;
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    treeGroup.add(foliage);

    /* 小树冠 */
    const foliage2Geo = new THREE.ConeGeometry(0.7, 1.5, 8);
    const foliage2 = new THREE.Mesh(foliage2Geo, foliageMat);
    foliage2.position.y = 3.5;
    foliage2.castShadow = true;
    treeGroup.add(foliage2);

    treeGroup.position.set(x, -22.5, z);
    const scale = 0.6 + Math.random() * 0.8;
    treeGroup.scale.setScalar(scale);
    treeGroup.rotation.y = Math.random() * Math.PI * 2;

    return treeGroup;
}

for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 45;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    scene.add(createTree(x, z));
}

// ────────── 3D 玩家人物 ──────────
const skinMat = new THREE.MeshToonMaterial({ color: '#FF8A65' });
const redMat = new THREE.MeshToonMaterial({ color: '#E53935' });
const blueMat = new THREE.MeshToonMaterial({ color: '#4527A0' });
const yellowMat = new THREE.MeshToonMaterial({ color: '#FFEB3B' });

const playerGroup = new THREE.Group();

/* 头部 */
const headGeo = new THREE.BoxGeometry(0.55, 0.55, 0.45);
const head = new THREE.Mesh(headGeo, skinMat);
head.position.y = 3.85;
playerGroup.add(head);

/* 帽子 */
const hatGeo = new THREE.BoxGeometry(0.6, 0.2, 0.5);
const hat = new THREE.Mesh(hatGeo, yellowMat);
hat.position.y = 0.25;
head.add(hat);

/* 身体 */
const bodyGeo = new THREE.BoxGeometry(0.6, 1.5, 0.4);
const body = new THREE.Mesh(bodyGeo, redMat);
body.position.y = 2.55;
playerGroup.add(body);

/* 左臂组（肩关节 pivot 在 y = 3.3） */
const leftArmGroup = new THREE.Group();
leftArmGroup.position.set(0.35, 3.3, 0);

const leftUpperArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 1, 0.22),
    redMat
);
leftUpperArm.position.y = -0.5;
leftArmGroup.add(leftUpperArm);

const leftForearm = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.8, 0.18),
    skinMat
);
leftForearm.position.y = -1.4;
leftArmGroup.add(leftForearm);

playerGroup.add(leftArmGroup);

/* 右臂组 */
const rightArmGroup = new THREE.Group();
rightArmGroup.position.set(-0.35, 3.3, 0);

const rightUpperArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 1, 0.22),
    redMat
);
rightUpperArm.position.y = -0.5;
rightArmGroup.add(rightUpperArm);

const rightForearm = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.8, 0.18),
    skinMat
);
rightForearm.position.y = -1.4;
rightArmGroup.add(rightForearm);

playerGroup.add(rightArmGroup);

/* 左腿组（髋关节 pivot 在 y = 1.8） */
const leftLegGroup = new THREE.Group();
leftLegGroup.position.set(0, 1.8, 0.12);

const leftThigh = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.9, 0.28),
    blueMat
);
leftThigh.position.y = -0.45;
leftLegGroup.add(leftThigh);

const leftCalf = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.9, 0.22),
    blueMat
);
leftCalf.position.y = -1.35;
leftLegGroup.add(leftCalf);

playerGroup.add(leftLegGroup);

/* 右腿组 */
const rightLegGroup = new THREE.Group();
rightLegGroup.position.set(0, 1.8, -0.12);

const rightThigh = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.9, 0.28),
    blueMat
);
rightThigh.position.y = -0.45;
rightLegGroup.add(rightThigh);

const rightCalf = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.9, 0.22),
    blueMat
);
rightCalf.position.y = -1.35;
rightLegGroup.add(rightCalf);

playerGroup.add(rightLegGroup);

/* 初始位置：山脚侧面 */
function getConeRadius(y) {
    if (y >= MOUNTAIN_HEIGHT) return 0;
    return MOUNTAIN_BASE_RADIUS * (1 - y / MOUNTAIN_HEIGHT);
}

function positionPlayerAtHeight(height) {
    const r = getConeRadius(height);
    const yOffset = mountainGroup.position.y;
    playerGroup.position.set(r + 0.5, height + yOffset, 0);
    /* 人物面向山体中心 */
    playerGroup.lookAt(0, height + yOffset, 0);
}

positionPlayerAtHeight(0);
scene.add(playerGroup);

// ────────── 攀爬动画 ──────────
const CLIMB_ANIM_DURATION = 350; /* ms */
let climbAnimId = null;
let climbStartTime = 0;

function playClimbAnimation() {
    if (climbAnimId) cancelAnimationFrame(climbAnimId);
    climbStartTime = performance.now();

    function animate(now) {
        const elapsed = now - climbStartTime;
        const progress = Math.min(elapsed / CLIMB_ANIM_DURATION, 1);

        /* 正弦波驱动四肢交替摆动 */
        const swing = Math.sin(progress * Math.PI * 4) * 0.55;

        leftArmGroup.rotation.x = swing;
        rightArmGroup.rotation.x = -swing;
        leftLegGroup.rotation.x = -swing;
        rightLegGroup.rotation.x = swing;

        if (progress < 1) {
            climbAnimId = requestAnimationFrame(animate);
        } else {
            /* 动画结束，复位 */
            leftArmGroup.rotation.x = 0;
            rightArmGroup.rotation.x = 0;
            leftLegGroup.rotation.x = 0;
            rightLegGroup.rotation.x = 0;
            climbAnimId = null;
        }
    }

    climbAnimId = requestAnimationFrame(animate);
}

// ────────── 滑落动画 ──────────
let fallAnimId = null;

function playFallAnimation(fromHeight, duration) {
    /* 取消可能正在运行的动画 */
    if (fallAnimId) cancelAnimationFrame(fallAnimId);
    if (climbAnimId) {
        cancelAnimationFrame(climbAnimId);
        climbAnimId = null;
    }

    /* 复位四肢姿态 */
    leftArmGroup.rotation.x = 0;
    rightArmGroup.rotation.x = 0;
    leftLegGroup.rotation.x = 0;
    rightLegGroup.rotation.x = 0;

    const startTime = performance.now();

    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        /* 翻滚旋转 */
        playerGroup.rotation.y += 0.12;

        /* 手臂伸展模拟失控 */
        const sprawl = Math.sin(progress * Math.PI * 2) * 0.8;
        leftArmGroup.rotation.x = sprawl;
        rightArmGroup.rotation.x = -sprawl;

        if (progress < 1) {
            fallAnimId = requestAnimationFrame(animate);
        } else {
            /* 动画结束，复位 */
            playerGroup.rotation.y = 0;
            leftArmGroup.rotation.x = 0;
            rightArmGroup.rotation.x = 0;
            fallAnimId = null;
        }
    }

    fallAnimId = requestAnimationFrame(animate);
}

// ────────── 高度同步 ──────────
function updatePlayerHeight(gameHeight) {
    /* 映射：游戏高度(0~3000) → 3D高度(0~30) */
    const threeY = (gameHeight / MAX_GAME_HEIGHT) * MOUNTAIN_HEIGHT;
    positionPlayerAtHeight(threeY);
}

// ────────── 窗口 resize 响应 ──────────
function onResize() {
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    renderer.setSize(rect.width, rect.height);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
}

window.addEventListener('resize', onResize);
/* 初始调用确保首帧尺寸正确 */
onResize();

// ────────── 渲染循环 ──────────
function render() {
    requestAnimationFrame(render);

    // 获取玩家世界坐标
    const playerPos = new THREE.Vector3();
    playerGroup.getWorldPosition(playerPos);

    if (!panoramaMode) {
        // 计算"身后"方向：从山体中心(0, playerPos.y, 0)指向玩家的反向
        const outwardDir = new THREE.Vector3()
            .subVectors(playerPos, new THREE.Vector3(0, playerPos.y, 0))
            .normalize();

        // 如果玩家在山顶附近（半径很小），使用默认方向
        let behindDir;
        if (outwardDir.length() < 0.01) {
            behindDir = new THREE.Vector3(0, 0, 1);
        } else {
            behindDir = outwardDir;
        }

        // 摄像机目标位置：玩家身后 + 上方
        const targetCamPos = new THREE.Vector3()
            .copy(playerPos)
            .add(behindDir.clone().multiplyScalar(cameraDistance))
            .add(new THREE.Vector3(0, 4, 0));

        // 摄像机目标注视点：玩家位置（略微抬高到身体中部）
        const targetLookAt = new THREE.Vector3()
            .copy(playerPos)
            .add(new THREE.Vector3(0, 2, 0));

        // 平滑插值（lerp factor = 0.1）
        camera.position.lerp(targetCamPos, 0.1);
        camera.lookAt(targetLookAt);
    }

    // Animate clouds drifting
    const time = performance.now() * 0.0001;
    clouds.forEach(function(cloud, i) {
        cloud.position.x += Math.sin(time + i) * 0.003;
        cloud.position.z += Math.cos(time + i * 0.7) * 0.003;
        if (cloud.position.x > 60) cloud.position.x = -60;
        if (cloud.position.x < -60) cloud.position.x = 60;
        if (cloud.position.z > 60) cloud.position.z = -60;
        if (cloud.position.z < -60) cloud.position.z = 60;
    });

    renderer.render(scene, camera);
}
render();

// ────────── 公开 API ──────────
window.game3d = {
    updatePlayerHeight: updatePlayerHeight,
    playClimbAnimation: playClimbAnimation,
    playFallAnimation: playFallAnimation,
    exitPanorama: function() { panoramaMode = false; },
};

})();
