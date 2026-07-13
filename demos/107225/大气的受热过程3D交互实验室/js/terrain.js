// 地形创建模块
function createTerrain() {
  console.log('[创建地形] 开始, surface类型:', state.surface);
  const geo = new THREE.PlaneGeometry(65, 65, 80, 80);
  const verts = geo.attributes.position.array;
  
  for (let i = 0; i < verts.length; i += 3) {
    const x = verts[i], y = verts[i+1];
    let h = 0;
    
    if (state.surface === 'desert') {
      h = Math.sin(x*0.12)*4.5 + Math.cos(y*0.10)*3.8 + Math.sin(x*0.25+y*0.18)*2.0;
    } else if (state.surface === 'lake') {
      h = Math.sin(x*0.08)*0.2 + Math.cos(y*0.06)*0.15;
    } else if (state.surface === 'snow') {
      h = Math.sin(x*0.15)*3.0 + Math.cos(y*0.12)*2.5 + Math.abs(Math.sin(x*0.30))*1.5;
    } else if (state.surface === 'city') {
      h = 0;
    } else if (state.surface === 'farmland') {
      h = Math.sin(x*0.12)*1.0 + Math.cos(y*0.10)*0.9;
    } else {
      h = Math.sin(x*0.18)*2.5 + Math.cos(y*0.15)*2.0 + Math.sin(x*0.40+y*0.25)*1.0;
    }
    verts[i+2] = h + Math.random()*0.15;
  }
  geo.computeVertexNormals();

  const colors = { 
    forest:0x4CAF50,
    city:0x9E9E9E,
    lake:0x2196F3,
    desert:0xFFC107,
    snow:0xE3F2FD,
    farmland:0x8BC34A
  };
  
  const mat = new THREE.MeshLambertMaterial({ 
    color: colors[state.surface]||0x2d5a1e, 
    side: THREE.DoubleSide 
  });
  terrain = new THREE.Mesh(geo, mat);
  terrain.rotation.x = -Math.PI/2;
  terrain.receiveShadow = true;
  scene.add(terrain);
  console.log('[创建地形] 完成, 颜色:', colors[state.surface]);

  if (state.surface === 'lake') {
    const waterGeo = new THREE.PlaneGeometry(60, 60);
    const waterMat = new THREE.MeshLambertMaterial({ 
      color: 0x2080b0, 
      transparent: true, 
      opacity: 0.75, 
      side: THREE.DoubleSide 
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI/2;
    water.position.y = 0.3;
    water.userData.isWater = true;
    scene.add(water);
    surfaceObjects.push(water);
    console.log('[创建地形] 湖泊水面已创建');
  }
}
