/**
 * ============================================================
 * JobScope - 首页 Three.js 3D 背景动画
 * 粒子系统 + 几何体动画 / 数据流动 / 科技感主题
 * ============================================================
 */
(function () {
    'use strict';

    var canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // ---- 场景初始化 ----
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // ---- 粒子系统 - 数据流粒子 ----
    var PARTICLE_COUNT = 1200;
    var particleGeometry = new THREE.BufferGeometry();
    var positions = new Float32Array(PARTICLE_COUNT * 3);
    var velocities = [];
    var particleSizes = new Float32Array(PARTICLE_COUNT);

    for (var i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 120;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

        velocities.push({
            x: (Math.random() - 0.5) * 0.03,
            y: (Math.random() - 0.5) * 0.04 + 0.01,
            z: (Math.random() - 0.5) * 0.02,
        });

        particleSizes[i] = Math.random() * 2.5 + 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    // 自定义着色器材质 - 圆形发光粒子
    var particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColorA: { value: new THREE.Color(0x00f0ff) },
            uColorB: { value: new THREE.Color(0xa855f7) },
        },
        vertexShader: [
            'attribute float size;',
            'varying float vSize;',
            'varying vec3 vPos;',
            'void main() {',
            '   vSize = size;',
            '   vPos = position;',
            '   vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
            '   gl_PointSize = size * (300.0 / -mvPosition.z);',
            '   gl_Position = projectionMatrix * mvPosition;',
            '}'
        ].join('\n'),
        fragmentShader: [
            'uniform float uTime;',
            'uniform vec3 uColorA;',
            'uniform vec3 uColorB;',
            'varying float vSize;',
            'varying vec3 vPos;',
            'void main() {',
            '   float dist = length(gl_PointCoord - vec2(0.5));',
            '   if (dist > 0.5) discard;',
            '   float alpha = 1.0 - smoothstep(0.2, 0.5, dist);',
            '   float mixFactor = (vPos.y + 40.0) / 80.0;',
            '   vec3 color = mix(uColorA, uColorB, mixFactor);',
            '   alpha *= 0.6;',
            '   gl_FragColor = vec4(color, alpha);',
            '}'
        ].join('\n'),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    var particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ---- 连线几何体 - 数据网络 ----
    var lineGeometry = new THREE.BufferGeometry();
    var linePositions = new Float32Array(300 * 6); // 最多300条线
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    var lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
    });

    var lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // ---- 中央核心几何体 - 浮动环面 ----
    var torusGeometry = new THREE.TorusGeometry(12, 0.15, 16, 100);
    var torusMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.08,
        wireframe: true,
    });
    var torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(0, 0, -10);
    scene.add(torus);

    // 第二个环面
    var torus2Geometry = new THREE.TorusGeometry(18, 0.1, 16, 100);
    var torus2 = new THREE.Mesh(torus2Geometry, torusMaterial.clone());
    torus2.material.opacity = 0.05;
    torus2.material.color.setHex(0xa855f7);
    torus2.position.set(0, 0, -15);
    torus2.rotation.x = Math.PI * 0.4;
    scene.add(torus2);

    // ---- 动画循环 ----
    var clock = new THREE.Clock();

    function updateParticles() {
        var posAttr = particleGeometry.attributes.position;
        var arr = posAttr.array;

        for (var i = 0; i < PARTICLE_COUNT; i++) {
            var idx = i * 3;

            arr[idx]     += velocities[i].x;
            arr[idx + 1] += velocities[i].y;
            arr[idx + 2] += velocities[i].z;

            // 边界循环
            if (arr[idx + 1] > 50) {
                arr[idx + 1] = -50;
                arr[idx] = (Math.random() - 0.5) * 120;
                arr[idx + 2] = (Math.random() - 0.5) * 80;
            }
            if (arr[idx] > 65)  arr[idx] = -65;
            if (arr[idx] < -65) arr[idx] = 65;
            if (arr[idx + 2] > 45)  arr[idx + 2] = -45;
            if (arr[idx + 2] < -45) arr[idx + 2] = 45;
        }

        posAttr.needsUpdate = true;
    }

    function updateLines() {
        var posArr = particleGeometry.attributes.position.array;
        var lineArr = lineGeometry.attributes.position.array;
        var lineIdx = 0;
        var maxDist = 20;
        var maxLines = 300;

        for (var i = 0; i < PARTICLE_COUNT && lineIdx < maxLines; i++) {
            for (var j = i + 1; j < PARTICLE_COUNT && lineIdx < maxLines; j++) {
                var dx = posArr[i * 3] - posArr[j * 3];
                var dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
                var dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
                var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < maxDist && Math.random() > 0.97) {
                    var li = lineIdx * 6;
                    lineArr[li]     = posArr[i * 3];
                    lineArr[li + 1] = posArr[i * 3 + 1];
                    lineArr[li + 2] = posArr[i * 3 + 2];
                    lineArr[li + 3] = posArr[j * 3];
                    lineArr[li + 4] = posArr[j * 3 + 1];
                    lineArr[li + 5] = posArr[j * 3 + 2];
                    lineIdx++;
                }
            }
        }

        // 清空剩余线条
        for (var k = lineIdx * 6; k < lineArr.length; k++) {
            lineArr[k] = 0;
        }

        lineGeometry.attributes.position.needsUpdate = true;
    }

    function animate() {
        requestAnimationFrame(animate);

        var elapsed = clock.getElapsedTime();

        // 更新粒子位置
        updateParticles();
        updateLines();

        // 更新着色器时间
        particleMaterial.uniforms.uTime.value = elapsed;

        // 相机轻微浮动
        camera.position.x = Math.sin(elapsed * 0.15) * 3;
        camera.position.y = Math.cos(elapsed * 0.12) * 2;
        camera.lookAt(scene.position);

        // 环面旋转
        torus.rotation.z = elapsed * 0.15;
        torus.rotation.x = Math.sin(elapsed * 0.1) * 0.2;
        torus2.rotation.z = -elapsed * 0.1;
        torus2.rotation.y = elapsed * 0.05;

        // 整个粒子系统缓慢旋转
        particles.rotation.y = elapsed * 0.02;
        lines.rotation.y = elapsed * 0.02;

        renderer.render(scene, camera);
    }

    animate();

    // ---- 响应式处理 ----
    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

})();

// ============================================================
// 免责声明弹窗逻辑
// ============================================================
(function () {
    'use strict';

    var modal = document.getElementById('disclaimer-modal');

    window.openDisclaimer = function () {
        if (modal) {
            modal.style.display = 'flex';
            requestAnimationFrame(function () {
                modal.classList.add('active');
            });
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeDisclaimer = function (e) {
        if (e && e.target !== modal && !e.target.closest('.modal-close')) return;
        if (modal) {
            modal.classList.remove('active');
            setTimeout(function () {
                modal.style.display = 'none';
            }, 250);
            document.body.style.overflow = '';
        }
    };

    // ESC 键关闭
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeDisclaimer();
        }
    });

})();
