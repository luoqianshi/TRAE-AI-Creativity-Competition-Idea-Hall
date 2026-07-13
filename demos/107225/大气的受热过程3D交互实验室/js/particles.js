// 粒子创建模块 - 支持尘埃浓度动态响应
function createParticles() {
  const geo = new THREE.BufferGeometry();
  const pos = [];
  for (let i = 0; i < 250; i++) pos.push((Math.random()-0.5)*55, 1.5+Math.random()*16, (Math.random()-0.5)*55);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  
  // 初始透明度根据尘埃浓度
  const dustFactor = state.dust / 100;
  const p = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xccaa88,
    size: 0.08 + dustFactor * 0.15,
    transparent: true,
    opacity: 0.1 + dustFactor * 0.5
  }));
  p.userData.type = 'dust';
  scene.add(p); 
  particles.push(p);
}
