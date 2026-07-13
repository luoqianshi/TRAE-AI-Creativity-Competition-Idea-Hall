// 云层创建模块 - 支持动态重建
function createClouds() {
  // 移除旧云层
  clouds.forEach(c => scene.remove(c));
  clouds = [];
  
  const cloudMat = new THREE.MeshLambertMaterial({ 
    color: 0xf0f0f0, 
    transparent: true, 
    opacity: 0.88 
  });
  
  // 云量决定云层数量
  const numClouds = Math.max(1, Math.ceil(state.cloud / 8));
  
  for (let i = 0; i < numClouds; i++) {
    const group = new THREE.Group();
    const numBlobs = 4 + Math.floor(Math.random() * 5);
    
    for (let j = 0; j < numBlobs; j++) {
      const size = 2.5 + Math.random() * 3.5;
      const blob = new THREE.Mesh(new THREE.SphereGeometry(size, 10, 7), cloudMat);
      blob.position.set(j * 2.2 - numBlobs * 1.1, Math.random() * 1.2, Math.random() * 2.5 - 1.2);
      blob.scale.y = 0.55;
      group.add(blob);
    }
    
    group.position.set((Math.random() - 0.5) * 45, 14 + Math.random() * 8, (Math.random() - 0.5) * 35);
    group.userData = { 
      speed: 0.015 + Math.random() * 0.025, 
      origX: group.position.x 
    };
    
    scene.add(group); 
    clouds.push(group);
  }
}
