// 太阳和星星创建模块 - 支持动态响应
function createSun() {
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffee44 });
  sun = new THREE.Mesh(new THREE.SphereGeometry(3.5, 20, 20), sunMat);
  scene.add(sun);
  
  // 内层光晕
  const innerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(5.5, 16, 16), 
    new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.25
    })
  );
  sun.add(innerGlow);
  
  // 外层光晕
  const outerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(8, 12, 12), 
    new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.1
    })
  );
  sun.add(outerGlow);
}

function createStars() {
  const geo = new THREE.BufferGeometry();
  const pos = [];
  for (let i = 0; i < 600; i++) pos.push((Math.random()-0.5)*250, 25+Math.random()*80, (Math.random()-0.5)*250);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  
  // 星星透明度随时段变化
  const timeOpacity = { day: 0.0, dusk: 0.3, night: 0.7 }[state.time] || 0.0;
  
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.25,
    transparent: true,
    opacity: timeOpacity
  }));
  stars.userData.type = 'stars';
  scene.add(stars);
}
