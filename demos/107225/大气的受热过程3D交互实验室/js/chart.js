// 温度图表模块 - 基于物理计算的24小时温度曲线
let tempChart;

function initTempChart() {
  const ctx = document.getElementById('tempChart').getContext('2d');
  tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({length:25},(_,i)=>i+'h'),
      datasets: [
        { label:'地表温度', data:genCurve('surface'), borderColor:'#ff6b35', backgroundColor:'rgba(255,107,53,0.08)', borderWidth:2, fill:true, tension:0.4, pointRadius:0 },
        { label:'近地气温', data:genCurve('air'), borderColor:'#4a9eff', backgroundColor:'rgba(74,158,255,0.08)', borderWidth:2, fill:true, tension:0.4, pointRadius:0 }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false} },
      scales: {
        x:{ ticks:{color:'#445566',font:{size:9},maxTicksLimit:5}, grid:{color:'rgba(255,255,255,0.04)'} },
        y:{ ticks:{color:'#445566',font:{size:9}}, grid:{color:'rgba(255,255,255,0.04)'} }
      },
      interaction:{intersect:false,mode:'index'}
    }
  });
}

function genCurve(type) {
  const d = calculateData();
  const base = type==='surface' ? d.T_ground : d.T_air;
  const diff = type==='surface' ? 8 : 5;
  const arr = [];
  for(let i=0;i<=24;i++){ 
    const f=Math.sin((i-6)*Math.PI/12); 
    arr.push(Math.round((base+f*diff-diff*0.3)*10)/10); 
  }
  return arr;
}

function updateTempChart(d) {
  if(!tempChart) return;
  const sb=d.T_ground, ab=d.T_air;
  const sArr=[], aArr=[];
  for(let i=0;i<=24;i++){ 
    const f=Math.sin((i-6)*Math.PI/12); 
    sArr.push(Math.round((sb+f*8-2.4)*10)/10); 
    aArr.push(Math.round((ab+f*5-1.5)*10)/10); 
  }
  tempChart.data.datasets[0].data=sArr; 
  tempChart.data.datasets[1].data=aArr;
  tempChart.update('none');
}
