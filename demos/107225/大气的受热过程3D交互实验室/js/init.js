// 模态框和初始化模块
function openModal(id){ 
  document.getElementById(id).classList.add('show'); 
}

function closeModal(id){ 
  document.getElementById(id).classList.remove('show'); 
}

function initThree() {
  const container = document.getElementById('canvas-container');
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0e27, 0.006);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 22, 42);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.maxPolarAngle = Math.PI / 2.15;
  controls.minDistance = 12;
  controls.maxDistance = 80;
  controls.target.set(0, 1, 0);

  scene.add(new THREE.AmbientLight(0x334466, 0.5));
  const dirLight = new THREE.DirectionalLight(0xffeedd, 1.3);
  dirLight.position.set(25, 35, 15);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(2048, 2048);
  const sc = dirLight.shadow.camera;
  sc.near=0.5; sc.far=100; sc.left=-35; sc.right=35; sc.top=35; sc.bottom=-35;
  scene.add(dirLight);
  scene.add(new THREE.HemisphereLight(0x87ceeb, 0x362d1b, 0.35));

  createTerrain();
  createSurfaceObjects();
  createClouds();
  createSun();
  createStars();
  createRadiationArrows();
  createParticles();

  window.addEventListener('resize', onResize);
  animate();
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', ()=>{ 
  initThree(); 
  initTempChart(); 
  updateDataPanel(); 
  
  // 绑定模态框关闭事件
  document.querySelectorAll('.modal-overlay').forEach(m=>{ 
    m.addEventListener('click',e=>{ 
      if(e.target===m) m.classList.remove('show'); 
    }); 
  });
});
