// assets/charts.js — v3.0 (10-round iteration)
(function() {
  var s = getComputedStyle(document.documentElement);
  var accent = s.getPropertyValue('--accent').trim();
  var accent2 = s.getPropertyValue('--accent2').trim();
  var ink = s.getPropertyValue('--ink').trim();
  var muted = s.getPropertyValue('--muted').trim();
  var rule = s.getPropertyValue('--rule').trim();
  var bg2 = s.getPropertyValue('--bg2').trim();
  var accentRgb = '74, 124, 89';

  // --- chart-market: 市场规模 ---
  var el = document.getElementById('chart-market');
  if (el) {
    var c = echarts.init(el, null, {renderer:'svg'});
    c.setOption({
      tooltip:{trigger:'axis',appendToBody:true,backgroundColor:bg2,borderColor:rule,borderWidth:1,textStyle:{color:ink,fontSize:13}},
      animation:false,
      grid:{left:50,right:20,top:20,bottom:40},
      xAxis:{type:'category',data:['2024','2025','2026E','2027E','2028E','2029E','2030E'],axisLine:{lineStyle:{color:rule}},axisLabel:{color:muted,fontSize:11}},
      yAxis:{type:'value',name:'亿元',nameTextStyle:{color:muted,fontSize:11},axisLine:{show:false},axisLabel:{color:muted,fontSize:11,formatter:'{value}'},splitLine:{lineStyle:{color:rule,type:'dashed'}}},
      series:[{type:'bar',data:[28,33,40,48,57,68,85].map(function(v,i){return{value:v,itemStyle:{color:i>1?accent:accent2,borderRadius:[4,4,0,0]}}}),barWidth:'55%',label:{show:true,position:'top',formatter:'{c}亿',color:ink,fontSize:11,fontWeight:600}}]
    });
    window.addEventListener('resize',function(){c.resize()});
  }

  // --- chart-ltv: LTV 曲线 ---
  var el2 = document.getElementById('chart-ltv');
  if (el2) {
    var c2 = echarts.init(el2, null, {renderer:'svg'});
    c2.setOption({
      tooltip:{trigger:'axis',appendToBody:true,backgroundColor:bg2,borderColor:rule,borderWidth:1,textStyle:{color:ink,fontSize:13}},
      animation:false,
      legend:{data:['LTV曲线','CAC线'],bottom:0,left:'center',textStyle:{color:muted,fontSize:11}},
      grid:{left:50,right:20,top:20,bottom:50},
      xAxis:{type:'category',data:['第1月','第3月','第6月','第9月','第12月','第18月','第24月'],axisLine:{lineStyle:{color:rule}},axisLabel:{color:muted,fontSize:11}},
      yAxis:{type:'value',name:'元',nameTextStyle:{color:muted,fontSize:11},axisLine:{show:false},axisLabel:{color:muted,fontSize:11},splitLine:{lineStyle:{color:rule,type:'dashed'}}},
      series:[{name:'LTV曲线',type:'line',smooth:true,symbol:'circle',symbolSize:6,data:[35,55,78,90,105,145,195],lineStyle:{color:accent,width:3},areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:'rgba('+accentRgb+',0.25)'},{offset:1,color:'rgba('+accentRgb+',0.02)'}]}}},{name:'CAC线',type:'line',data:[42,42,42,42,42,42,42],lineStyle:{color:'#C0392B',width:2,type:'dashed'},symbol:'none',markPoint:{data:[{coord:['第3月',42],symbol:'pin',symbolSize:35,itemStyle:{color:'#C0392B'},label:{formatter:'CAC回收点'+'\\n'+'3个月',color:'#fff',fontSize:10}}]}}]
    });
    window.addEventListener('resize',function(){c2.resize()});
  }

  // --- chart-radar: 植物健康雷达 ---
  var el3 = document.getElementById('chart-radar');
  if (el3) {
    var c3 = echarts.init(el3, null, {renderer:'svg'});
    c3.setOption({
      tooltip:{trigger:'item',appendToBody:true,backgroundColor:bg2,borderColor:rule,borderWidth:1,textStyle:{color:ink,fontSize:13}},
      animation:false,
      radar:{indicator:[{name:'土壤湿度',max:100},{name:'光照强度',max:100},{name:'环境温度',max:100},{name:'养分状况',max:100},{name:'叶片健康',max:100},{name:'综合评分',max:100}],shape:'circle',splitNumber:4,axisName:{color:ink,fontSize:12,fontWeight:600},splitLine:{lineStyle:{color:rule}},splitArea:{areaStyle:{color:['rgba('+accentRgb+',0.02)','rgba('+accentRgb+',0.05)']}},axisLine:{lineStyle:{color:rule}}},
      series:[{type:'radar',data:[{value:[82,65,78,55,92,74],name:'当前状态',areaStyle:{color:'rgba('+accentRgb+',0.25)'},lineStyle:{color:accent,width:2},itemStyle:{color:accent}},{value:[70,60,70,70,80,70],name:'理想状态',lineStyle:{color:accent2,width:2,type:'dashed'},itemStyle:{color:accent2},areaStyle:{opacity:0}}]}],
      legend:{data:['当前状态','理想状态'],bottom:0,left:'center',textStyle:{color:muted,fontSize:12}}
    });
    window.addEventListener('resize',function(){c3.resize()});
  }

  // --- chart-pain-rev: 双图表（痛点+收入） ---
  var el4 = document.getElementById('chart-pain-rev');
  if (el4) {
    var c4 = echarts.init(el4, null, {renderer:'svg'});
    c4.setOption({
      tooltip:{trigger:'axis',appendToBody:true,backgroundColor:bg2,borderColor:rule,borderWidth:1,textStyle:{color:ink,fontSize:13}},
      animation:false,
      legend:{data:['硬件收入','订阅收入','商城收入'],bottom:0,left:'center',textStyle:{color:muted,fontSize:10}},
      grid:{left:50,right:20,top:20,bottom:50},
      xAxis:{type:'category',data:['第1年','第2年','第3年'],axisLine:{lineStyle:{color:rule}},axisLabel:{color:muted,fontSize:11}},
      yAxis:{type:'value',name:'万元',nameTextStyle:{color:muted,fontSize:11},axisLine:{show:false},axisLabel:{color:muted,fontSize:11},splitLine:{lineStyle:{color:rule,type:'dashed'}}},
      series:[{name:'硬件收入',type:'bar',stack:'total',data:[{value:12,itemStyle:{color:accent,borderRadius:[0,0,0,0]}},{value:60,itemStyle:{color:accent,borderRadius:[0,0,0,0]}},{value:180,itemStyle:{color:accent,borderRadius:[4,4,0,0]}}]},{name:'订阅收入',type:'bar',stack:'total',data:[{value:3,itemStyle:{color:accent2,borderRadius:[0,0,0,0]}},{value:24,itemStyle:{color:accent2,borderRadius:[0,0,0,0]}},{value:96,itemStyle:{color:accent2,borderRadius:[0,0,0,0]}}]},{name:'商城收入',type:'bar',stack:'total',data:[{value:1,itemStyle:{color:'#B8CFA5',borderRadius:[0,0,0,0]}},{value:8,itemStyle:{color:'#B8CFA5',borderRadius:[0,0,0,0]}},{value:24,itemStyle:{color:'#B8CFA5',borderRadius:[0,0,0,0]}}]}],
      label:{show:true,position:'inside',formatter:function(p){var vals={0:16,1:92,2:300};return vals[p.dataIndex]+'万';},color:'#fff',fontSize:10,fontWeight:600}
    });
    window.addEventListener('resize',function(){c4.resize()});
  }
})();