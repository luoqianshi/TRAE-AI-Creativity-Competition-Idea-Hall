// 辐射箭头创建模块 - 支持动态缩放
function createArrow(color, length, radius) {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(radius*0.35, radius*0.35, length*0.65, 6),
    new THREE.MeshBasicMaterial({color, transparent:true, opacity:0.85})
  );
  shaft.position.y = length*0.12;
  g.add(shaft);
  const head = new THREE.Mesh(
    new THREE.ConeGeometry(radius*1.1, length*0.38, 6),
    new THREE.MeshBasicMaterial({color, transparent:true, opacity:0.95})
  );
  head.position.y = length*0.52;
  g.add(head);
  return g;
}

function createRadiationArrows() {
  [solarArrows, groundArrows, atmoArrows, reflectArrows].forEach(arr => {
    arr.forEach(a => scene.remove(a));
  });
  solarArrows = []; groundArrows = []; atmoArrows = []; reflectArrows = [];

  // 太阳短波辐射箭头（黄色，向下）- 14个
  for (let i = 0; i < 14; i++) {
    const arrow = createArrow(0xffd700, 4.5, 0.35);
    arrow.position.set((Math.random()-0.5)*32, 22+Math.random()*5, (Math.random()-0.5)*32);
    const aRad = state.angle * Math.PI/180;
    arrow.rotation.z = Math.PI + (Math.PI/2 - aRad)*0.4;
    arrow.userData = { 
      speed: 0.025+Math.random()*0.02, 
      origY: arrow.position.y, 
      origX: arrow.position.x, 
      origZ: arrow.position.z 
    };
    scene.add(arrow); 
    solarArrows.push(arrow);
  }

  // 反射箭头（白色，从大气层向上飞向太空）- 8个
  for (let i = 0; i < 8; i++) {
    const arrow = createArrow(0xddeeff, 3, 0.25);
    arrow.position.set((Math.random()-0.5)*25, 18+Math.random()*4, (Math.random()-0.5)*25);
    arrow.userData = { 
      speed: 0.02+Math.random()*0.015, 
      origY: 18+Math.random()*4 
    };
    scene.add(arrow); 
    reflectArrows.push(arrow);
  }

  // 地面长波辐射箭头（橙红色，向上）- 12个
  for (let i = 0; i < 12; i++) {
    const arrow = createArrow(0xff6b35, 3.2, 0.28);
    arrow.position.set((Math.random()-0.5)*28, 1, (Math.random()-0.5)*28);
    arrow.userData = { 
      speed: 0.02+Math.random()*0.015, 
      origY: 1 
    };
    scene.add(arrow); 
    groundArrows.push(arrow);
  }

  // 大气逆辐射箭头（紫色，向下）- 10个
  for (let i = 0; i < 10; i++) {
    const arrow = createArrow(0xba68c8, 3.2, 0.28);
    arrow.position.set((Math.random()-0.5)*28, 18+Math.random()*3, (Math.random()-0.5)*28);
    arrow.rotation.z = Math.PI;
    arrow.userData = { 
      speed: 0.018+Math.random()*0.015, 
      origY: arrow.position.y 
    };
    scene.add(arrow); 
    atmoArrows.push(arrow);
  }
}
