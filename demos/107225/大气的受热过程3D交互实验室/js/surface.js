// 地表对象创建模块
function createSurfaceObjects() {
  console.log('[创建地表对象] 开始, surface类型:', state.surface);
  surfaceObjects.forEach(o => scene.remove(o));
  surfaceObjects = [];

  const type = state.surface;

  if (type === 'forest') {
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.22, 1.4, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3520 });
    const leafGeo = new THREE.ConeGeometry(1.1, 2.8, 7);
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x1a6b1a });
    for (let i = 0; i < 70; i++) {
      const x = (Math.random()-0.5)*52, z = (Math.random()-0.5)*52;
      const s = 0.5+Math.random()*0.9;
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, 0.7*s, z); 
      trunk.scale.set(s,s,s); 
      trunk.castShadow=true;
      scene.add(trunk); 
      surfaceObjects.push(trunk);
      
      const leaves = new THREE.Mesh(leafGeo, leafMat);
      leaves.position.set(x, 2.2*s, z); 
      leaves.scale.set(s,s,s); 
      leaves.castShadow=true;
      scene.add(leaves); 
      surfaceObjects.push(leaves);
    }
  } else if (type === 'city') {
    const buildingColors = [0x8899aa, 0x778899, 0x667788, 0x99aabb, 0x556677, 0xaabbcc];
    for (let i = 0; i < 40; i++) {
      const w = 1.5+Math.random()*2.5, d = 1.5+Math.random()*2.5, h = 2+Math.random()*6;
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshLambertMaterial({ color: buildingColors[Math.floor(Math.random()*buildingColors.length)] });
      const building = new THREE.Mesh(geo, mat);
      building.position.set((Math.random()-0.5)*45, h/2, (Math.random()-0.5)*45);
      building.castShadow = true; 
      building.receiveShadow = true;
      scene.add(building); 
      surfaceObjects.push(building);

      if (h > 3) {
        const winMat = new THREE.MeshBasicMaterial({ color: 0xffee88 });
        const rows = Math.floor(h/1.2);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < Math.floor(w/0.8); c++) {
            if (Math.random() > 0.4) {
              const win = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), winMat);
              win.position.set(
                building.position.x - w/2 + 0.4 + c*0.8,
                0.8 + r*1.2,
                building.position.z + d/2 + 0.01
              );
              scene.add(win); 
              surfaceObjects.push(win);
            }
          }
        }
      }
    }
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    for (let i = 0; i < 3; i++) {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(50, 1.5), roadMat);
      road.rotation.x = -Math.PI/2;
      road.position.set(0, 0.05, (i-1)*12);
      scene.add(road); 
      surfaceObjects.push(road);
    }
  } else if (type === 'lake') {
    const reedMat = new THREE.MeshLambertMaterial({ color: 0x4a7a3a });
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 22 + Math.random() * 8;
      const x = Math.cos(angle)*dist, z = Math.sin(angle)*dist;
      const reed = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.5+Math.random(), 4), reedMat);
      reed.position.set(x, 0.75, z);
      scene.add(reed); 
      surfaceObjects.push(reed);
    }
  } else if (type === 'desert') {
    const cactusMat = new THREE.MeshLambertMaterial({ color: 0x3a7a3a });
    for (let i = 0; i < 15; i++) {
      const x = (Math.random()-0.5)*45, z = (Math.random()-0.5)*45;
      const h = 1+Math.random()*2;
      const cactus = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, h, 6), cactusMat);
      cactus.position.set(x, h/2, z);
      scene.add(cactus); 
      surfaceObjects.push(cactus);
      
      if (Math.random() > 0.4) {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, h*0.5, 5), cactusMat);
        arm.position.set(x+0.4, h*0.6, z);
        arm.rotation.z = Math.PI/3;
        scene.add(arm); 
        surfaceObjects.push(arm);
      }
    }
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x998877 });
    for (let i = 0; i < 20; i++) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3+Math.random()*0.5, 0), rockMat);
      rock.position.set((Math.random()-0.5)*50, 0.2, (Math.random()-0.5)*50);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      scene.add(rock); 
      surfaceObjects.push(rock);
    }
  } else if (type === 'snow') {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a4030 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0xe8f0e8 });
    for (let i = 0; i < 50; i++) {
      const x = (Math.random()-0.5)*50, z = (Math.random()-0.5)*50;
      const s = 0.5+Math.random()*0.8;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 1.2, 5), trunkMat);
      trunk.position.set(x, 0.6*s, z); 
      trunk.scale.set(s,s,s);
      scene.add(trunk); 
      surfaceObjects.push(trunk);
      
      for (let layer = 0; layer < 3; layer++) {
        const snowLayer = new THREE.Mesh(
          new THREE.ConeGeometry(1.0-layer*0.2, 1.2, 6),
          leafMat
        );
        snowLayer.position.set(x, (1.5+layer*1.0)*s, z);
        snowLayer.scale.set(s,s,s);
        scene.add(snowLayer); 
        surfaceObjects.push(snowLayer);
      }
    }
    const snowMoundMat = new THREE.MeshLambertMaterial({ color: 0xf0f5ff });
    for (let i = 0; i < 12; i++) {
      const mound = new THREE.Mesh(new THREE.SphereGeometry(1+Math.random()*1.5, 8, 6), snowMoundMat);
      mound.position.set((Math.random()-0.5)*45, 0.3, (Math.random()-0.5)*45);
      mound.scale.y = 0.4;
      scene.add(mound); 
      surfaceObjects.push(mound);
    }
  } else if (type === 'farmland') {
    const cropMat = new THREE.MeshLambertMaterial({ color: 0x7aaa40 });
    for (let row = 0; row < 12; row++) {
      for (let col = 0; col < 20; col++) {
        const x = -22 + col*2.3 + (Math.random()-0.5)*0.3;
        const z = -22 + row*3.5 + (Math.random()-0.5)*0.3;
        const crop = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.8+Math.random()*0.4, 4), cropMat);
        crop.position.set(x, 0.4, z);
        scene.add(crop); 
        surfaceObjects.push(crop);
      }
    }
    const pathMat = new THREE.MeshLambertMaterial({ color: 0x8a7a5a });
    for (let i = 0; i < 3; i++) {
      const path = new THREE.Mesh(new THREE.PlaneGeometry(50, 0.8), pathMat);
      path.rotation.x = -Math.PI/2;
      path.position.set(0, 0.05, (i-1)*14);
      scene.add(path); 
      surfaceObjects.push(path);
    }
  }
  console.log('[创建地表对象] 完成, 创建了', surfaceObjects.length, '个对象');
}
