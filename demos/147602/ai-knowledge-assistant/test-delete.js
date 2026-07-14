const fetch = require('node-fetch');

async function testDelete() {
  const filesRes = await fetch('http://localhost:3000/api/files');
  const filesData = await filesRes.json();
  
  if (filesData.data.length === 0) {
    console.log('暂无文件');
    return;
  }
  
  const fileToDelete = filesData.data[0];
  console.log('尝试删除:', fileToDelete.name, 'ID:', fileToDelete.id);
  
  const deleteRes = await fetch(`http://localhost:3000/api/files/${fileToDelete.id}`, {
    method: 'DELETE'
  });
  
  const result = await deleteRes.json();
  console.log('删除结果:', result);
  
  const afterRes = await fetch('http://localhost:3000/api/files');
  const afterData = await afterRes.json();
  console.log('删除后剩余文件:', afterData.data.map(f => f.name));
}

testDelete();