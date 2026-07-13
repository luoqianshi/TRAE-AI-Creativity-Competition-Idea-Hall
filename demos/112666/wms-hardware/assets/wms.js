// WMS Hardware - Main Dashboard Logic
(function() {
  'use strict';
  var d = Store.data;

  // ===== Page Nav =====
  window.switchPage = function(name) {
    document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});
    document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active')});
    var pg = document.getElementById('page-'+name); if(pg) pg.classList.add('active');
    var nav = document.querySelector('.nav-item[data-page="'+name+'"]'); if(nav) nav.classList.add('active');
    document.getElementById('sidebar').classList.remove('open');
    if(name==='dashboard') refreshDashboard();
    if(name==='picking') renderPickTable();
    if(name==='inventory') renderInvTable();
    if(name==='inbound') renderIbTable();
    if(name==='outbound') renderObTable();
    if(name==='location') { renderLocTable(); initLocChart(); }
  };

  // ===== Toast =====
  function toast(msg,type){
    var t=document.getElementById('toast');t.textContent=msg;t.className='toast '+(type||'info')+' show';
    clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('show')},2500);
  }
  window.openModal=function(id){document.getElementById(id).classList.add('show')};
  window.closeModal=function(id){document.getElementById(id).classList.remove('show')};

  // ===== Helpers =====
  function statusBadge(s){
    var m={'正常':'success','低库存':'warning','缺货':'danger','已完成':'success','已发货':'success','待收货':'info','待发货':'warning','已取消':'default','拣货中':'info','待拣货':'warning','空闲':'success','使用中':'info','已满':'danger'};
    return '<span class="badge '+(m[s]||'default')+'">'+s+'</span>';
  }
  function getInvStatus(it){ if(it.qty<=0) return '缺货'; if(it.qty<it.safety) return '低库存'; return '正常'; }
  function getLocStatus(l){ var r=l.capacity>0?l.used/l.capacity:0; if(r>=0.95) return '已满'; if(r>=0.7) return '使用中'; return '空闲'; }
  function today(){ return new Date().toISOString().slice(0,10); }
  function now(){ return new Date().toLocaleString('zh-CN'); }

  function populateLocSelect(id,sel){
    var e=document.getElementById(id); if(!e) return;
    e.innerHTML=d.locations.map(function(l){return '<option value="'+l.code+'"'+(l.code===sel?' selected':'')+'>'+l.code+' ('+l.zone+')</option>';}).join('');
  }
  function populateProductSelect(id){
    var e=document.getElementById(id); if(!e) return;
    e.innerHTML=d.inventory.map(function(i){return '<option value="'+i.name+'|'+i.barcode+'|'+i.unit+'">'+i.name+' ('+i.code+')</option>';}).join('');
  }

  function updateLocUsage(){
    d.locations.forEach(function(l){
      l.used=d.inventory.filter(function(i){return i.location===l.code}).reduce(function(s,i){return s+i.qty},0);
    });
    Store.persist();
  }

  // ===== Dashboard =====
  function refreshDashboard(){
    document.getElementById('updateTime').textContent=now();
    var totalQty=d.inventory.reduce(function(s,i){return s+i.qty},0);
    var pickingCount=d.pickingOrders.filter(function(o){return o.status==='拣货中'}).length;
    var pendingPick=d.pickingOrders.filter(function(o){return o.status==='待拣货'}).length;
    var pendingIn=d.inboundOrders.filter(function(o){return o.status==='待收货'}).length;
    document.getElementById('statCards').innerHTML=
      '<div class="stat-card"><div class="stat-icon blue">📦</div><div class="stat-info"><div class="stat-value">'+totalQty.toLocaleString()+'</div><div class="stat-label">库存总量</div></div></div>'+
      '<div class="stat-card"><div class="stat-icon green">🏃</div><div class="stat-info"><div class="stat-value">'+pickingCount+'</div><div class="stat-label">拣货中</div></div></div>'+
      '<div class="stat-card"><div class="stat-icon orange">⏳</div><div class="stat-info"><div class="stat-value">'+pendingPick+'</div><div class="stat-label">待拣货任务</div></div></div>'+
      '<div class="stat-card"><div class="stat-icon red">📥</div><div class="stat-info"><div class="stat-value">'+pendingIn+'</div><div class="stat-label">待收货入库</div></div></div>';
    // Activity
    var acts=[];
    d.pickingOrders.forEach(function(o){
      o.items.forEach(function(it){ if(it.picked>0) acts.push({dot:'pick',text:'拣货 '+it.productName+' ×'+it.picked+it.unit,time:o.createTime}); });
    });
    d.inboundOrders.filter(function(o){return o.status==='已完成'}).forEach(function(o){acts.push({dot:'in',text:'入库 '+o.productName+' ×'+o.qty+o.unit,time:o.date});});
    d.outboundOrders.filter(function(o){return o.status==='已发货'}).forEach(function(o){acts.push({dot:'out',text:'出库 '+o.productName+' ×'+o.qty+o.unit,time:o.date});});
    acts.sort(function(a,b){return b.time.localeCompare(a.time)}); acts=acts.slice(0,8);
    document.getElementById('activityList').innerHTML=acts.map(function(a){return '<li><span class="activity-dot '+a.dot+'"></span><span>'+a.text+'</span><span class="activity-time">'+a.time+'</span></li>';}).join('')||'<li style="justify-content:center;color:var(--muted)">暂无操作记录</li>';
    initCharts();
  }

  function initCharts(){
    var style=getComputedStyle(document.documentElement);
    var accent=style.getPropertyValue('--accent').trim();
    var accent2=style.getPropertyValue('--accent2').trim();
    var muted=style.getPropertyValue('--muted').trim();
    var rule=style.getPropertyValue('--rule').trim();

    var dom1=document.getElementById('chart-pick-trend');
    if(dom1){var c1=echarts.init(dom1,null,{renderer:'svg'});c1.setOption({animation:false,tooltip:{trigger:'axis',appendToBody:true},grid:{left:50,right:20,top:20,bottom:30},xAxis:{type:'category',data:['07-05','07-06','07-07','07-08','07-09','07-10','07-11'],axisLine:{lineStyle:{color:rule}},axisLabel:{color:muted}},yAxis:{type:'value',name:'件/小时',axisLine:{lineStyle:{color:rule}},splitLine:{lineStyle:{color:rule}},axisLabel:{color:muted}},series:[{type:'line',data:[45,52,48,60,55,68,72],smooth:true,lineStyle:{color:accent,width:2},itemStyle:{color:accent},areaStyle:{color:accent+'22'}}]});window.addEventListener('resize',function(){c1.resize()})}

    var dom2=document.getElementById('chart-pick-status');
    if(dom2){var c2=echarts.init(dom2,null,{renderer:'svg'});c2.setOption({animation:false,tooltip:{trigger:'item',appendToBody:true},legend:{bottom:0,textStyle:{color:muted}},series:[{type:'pie',radius:['45%','75%'],center:['50%','45%'],label:{color:muted},data:[{name:'已完成',value:15,itemStyle:{color:accent2}},{name:'拣货中',value:d.pickingOrders.filter(function(o){return o.status==='拣货中'}).length,itemStyle:{color:accent}},{name:'待拣货',value:d.pickingOrders.filter(function(o){return o.status==='待拣货'}).length,itemStyle:{color:'#f59e0b'}}]}]});window.addEventListener('resize',function(){c2.resize()})}
  }

  function initLocChart(){
    var dom=document.getElementById('chart-location-bar'); if(!dom) return;
    var style=getComputedStyle(document.documentElement);
    var accent=style.getPropertyValue('--accent').trim();
    var accent2=style.getPropertyValue('--accent2').trim();
    var muted=style.getPropertyValue('--muted').trim();
    var rule=style.getPropertyValue('--rule').trim();
    var c=echarts.init(dom,null,{renderer:'svg'});
    c.setOption({animation:false,tooltip:{trigger:'axis',appendToBody:true},legend:{data:['已用','空闲'],bottom:0,textStyle:{color:muted}},grid:{left:50,right:20,top:20,bottom:40},xAxis:{type:'category',data:d.locations.map(function(l){return l.code}),axisLabel:{color:muted,fontSize:10},axisLine:{lineStyle:{color:rule}}},yAxis:{type:'value',axisLine:{lineStyle:{color:rule}},splitLine:{lineStyle:{color:rule}},axisLabel:{color:muted}},series:[{name:'已用',type:'bar',stack:'total',data:d.locations.map(function(l){return l.used}),itemStyle:{color:accent},barMaxWidth:24,label:{show:true,position:'inside',color:'#fff',fontSize:10,formatter:function(p){return p.value>0?p.value:''}}},{name:'空闲',type:'bar',stack:'total',data:d.locations.map(function(l){return Math.max(0,l.capacity-l.used)}),itemStyle:{color:rule},barMaxWidth:24}]});
    window.addEventListener('resize',function(){c.resize()});
  }

  // ===== Inventory =====
  window.renderInvTable = function(){
    var s=(document.getElementById('invSearch').value||'').toLowerCase();
    var cat=document.getElementById('invCatFilter').value;
    var st=document.getElementById('invStatusFilter').value;
    var data=d.inventory.filter(function(i){return (!s||i.name.toLowerCase().indexOf(s)>-1||i.code.toLowerCase().indexOf(s)>-1||i.barcode.toLowerCase().indexOf(s)>-1)&&(!cat||i.category===cat)&&(!st||i.status===st)});
    document.getElementById('invCount').textContent=data.length;
    var tb=document.getElementById('invTableBody');
    if(!data.length){tb.innerHTML='<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">📭</div><p>暂无匹配记录</p></div></td></tr>';return}
    tb.innerHTML=data.map(function(i){return '<tr><td><code>'+i.barcode+'</code></td><td><strong>'+i.code+'</strong></td><td>'+i.name+'</td><td>'+i.category+'</td><td>'+i.spec+'</td><td><strong>'+i.qty.toLocaleString()+'</strong></td><td>'+i.unit+'</td><td>'+i.location+'</td><td>'+statusBadge(i.status)+'</td><td><button class="btn btn-xs btn-outline" onclick="editInv('+i.id+')">✏️</button> <button class="btn btn-xs btn-danger" onclick="delInv('+i.id+')">🗑️</button></td></tr>'}).join('');
  };
  window.openInvModal=function(){
    document.getElementById('invModalTitle').textContent='新增货品';document.getElementById('invEditId').value='';
    document.getElementById('invBarcode').value='';document.getElementById('invCode').value='';document.getElementById('invName').value='';
    document.getElementById('invCategory').value='电子元器件';document.getElementById('invSpec').value='';
    document.getElementById('invQty').value='0';document.getElementById('invUnit').value='个';document.getElementById('invSafety').value='0';
    populateLocSelect('invLocation');openModal('invModal');
  };
  window.editInv=function(id){
    var i=d.inventory.find(function(x){return x.id===id});if(!i)return;
    document.getElementById('invModalTitle').textContent='编辑货品';document.getElementById('invEditId').value=i.id;
    document.getElementById('invBarcode').value=i.barcode;document.getElementById('invCode').value=i.code;document.getElementById('invName').value=i.name;
    document.getElementById('invCategory').value=i.category;document.getElementById('invSpec').value=i.spec;
    document.getElementById('invQty').value=i.qty;document.getElementById('invUnit').value=i.unit;document.getElementById('invSafety').value=i.safety;
    populateLocSelect('invLocation',i.location);openModal('invModal');
  };
  window.saveInv=function(){
    var id=document.getElementById('invEditId').value;
    var barcode=document.getElementById('invBarcode').value.trim();
    var code=document.getElementById('invCode').value.trim();
    var name=document.getElementById('invName').value.trim();
    if(!barcode||!code||!name){toast('请填写条码、编码和名称','error');return}
    var cat=document.getElementById('invCategory').value;
    var spec=document.getElementById('invSpec').value.trim();
    var qty=parseInt(document.getElementById('invQty').value)||0;
    var unit=document.getElementById('invUnit').value;
    var loc=document.getElementById('invLocation').value;
    var safety=parseInt(document.getElementById('invSafety').value)||0;
    if(id){
      var it=d.inventory.find(function(x){return x.id===parseInt(id)});
      if(it){it.barcode=barcode;it.code=code;it.name=name;it.category=cat;it.spec=spec;it.qty=qty;it.unit=unit;it.location=loc;it.safety=safety;it.status=getInvStatus(it)}
      toast('货品更新成功','success');
    }else{
      d.inventory.push({id:d.nextIds.inventory++,barcode:barcode,code:code,name:name,category:cat,spec:spec,qty:qty,unit:unit,location:loc,safety:safety,status:getInvStatus({qty:qty,safety:safety})});
      toast('货品添加成功','success');
    }
    Store.persist();updateLocUsage();closeModal('invModal');renderInvTable();refreshDashboard();
  };
  window.delInv=function(id){if(!confirm('确定删除？'))return;d.inventory=d.inventory.filter(function(i){return i.id!==id});Store.persist();updateLocUsage();renderInvTable();toast('已删除','info');refreshDashboard()};

  // ===== Picking Orders =====
  window.renderPickTable=function(){
    var s=(document.getElementById('pickSearch').value||'').toLowerCase();
    var st=document.getElementById('pickStatusFilter').value;
    var data=d.pickingOrders.filter(function(o){return (!s||o.orderNo.toLowerCase().indexOf(s)>-1||o.customer.toLowerCase().indexOf(s)>-1)&&(!st||o.status===st)});
    document.getElementById('pickCount').textContent=data.length;
    var tb=document.getElementById('pickTableBody');
    if(!data.length){tb.innerHTML='<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">📭</div><p>暂无匹配记录</p></div></td></tr>';return}
    tb.innerHTML=data.map(function(o){return '<tr><td><strong>'+o.orderNo+'</strong></td><td>'+o.waveNo+'</td><td>'+o.customer+'</td><td><span class="badge '+(o.priority==='高'?'danger':'warning')+'">'+o.priority+'</span></td><td>'+o.items.length+'</td><td>'+o.assignee+'</td><td>'+o.createTime+'</td><td>'+statusBadge(o.status)+'</td><td><button class="btn btn-xs btn-outline" onclick="viewPickDetail('+o.id+')">📋 详情</button></td></tr>'}).join('');
  };
  window.viewPickDetail=function(id){
    var o=d.pickingOrders.find(function(x){return x.id===id});if(!o)return;
    var html='<div style="max-height:400px;overflow-y:auto"><table><thead><tr><th>货品</th><th>条码</th><th>库位</th><th>需求</th><th>已拣</th><th>状态</th></tr></thead><tbody>';
    html+=o.items.map(function(it){return '<tr><td>'+it.productName+'</td><td><code>'+it.barcode+'</code></td><td>'+it.location+'</td><td>'+it.qty+it.unit+'</td><td><strong>'+it.picked+'</strong></td><td>'+statusBadge(it.status)+'</td></tr>'}).join('');
    html+='</tbody></table></div>';
    var w=window.open('','_blank','width=600,height=500');
    w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+o.orderNo+' 详情</title><style>body{font-family:sans-serif;padding:20px;margin:0}h2{margin:0 0 16px}table{width:100%;border-collapse:collapse;font-size:14px}th{background:#f8f9fb;padding:10px 12px;text-align:left;border-bottom:2px solid #e4e7ed}td{padding:10px 12px;border-bottom:1px solid #e4e7ed}code{background:#f3f4f6;padding:2px 6px;border-radius:3px;font-size:12px}.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:500}.badge.success{background:#d1fae5;color:#065f46}.badge.warning{background:#fef3c7;color:#92400e}.badge.info{background:#dbeafe;color:#1e40af}</style></head><body><h2>'+o.orderNo+' <small style="color:#8b8fa3">'+o.customer+'</small></h2>'+html+'</body></html>');
    w.document.close();
  };

  // ===== Inbound =====
  window.renderIbTable=function(){
    var s=(document.getElementById('ibSearch').value||'').toLowerCase();
    var st=document.getElementById('ibStatusFilter').value;
    var data=d.inboundOrders.filter(function(o){return (!s||o.orderNo.toLowerCase().indexOf(s)>-1||o.productName.toLowerCase().indexOf(s)>-1)&&(!st||o.status===st)});
    document.getElementById('ibCount').textContent=data.length;
    var tb=document.getElementById('ibTableBody');
    if(!data.length){tb.innerHTML='<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">📭</div><p>暂无匹配记录</p></div></td></tr>';return}
    tb.innerHTML=data.map(function(o){return '<tr><td><strong>'+o.orderNo+'</strong></td><td>'+o.productName+'</td><td>'+o.qty.toLocaleString()+o.unit+'</td><td><code>'+o.barcode+'</code></td><td>'+o.location+'</td><td>'+o.supplier+'</td><td>'+o.date+'</td><td>'+statusBadge(o.status)+'</td><td>'+(o.status==='待收货'?'<button class="btn btn-xs btn-success" onclick="confirmIb('+o.id+')">确认收货</button> ':'')+'<button class="btn btn-xs btn-danger" onclick="cancelIb('+o.id+')">取消</button></td></tr>'}).join('');
  };
  window.openIbModal=function(){populateProductSelect('ibProduct');populateLocSelect('ibLocation');document.getElementById('ibQty').value='1';document.getElementById('ibSupplier').value='';openModal('ibModal')};
  window.saveIb=function(){
    var pv=document.getElementById('ibProduct').value;if(!pv){toast('请选择货品','error');return}
    var parts=pv.split('|');var name=parts[0];var barcode=parts[1];var unit=parts[2];
    var qty=parseInt(document.getElementById('ibQty').value)||0;
    var loc=document.getElementById('ibLocation').value;
    var supplier=document.getElementById('ibSupplier').value.trim()||'--';
    if(qty<=0||!loc){toast('请填写完整','error');return}
    d.inboundOrders.unshift({id:d.nextIds.inbound++,orderNo:'IN-'+today().replace(/-/g,'')+'-'+String(d.nextIds.inbound).padStart(3,'0'),productName:name,qty:qty,unit:unit,location:loc,supplier:supplier,date:today(),status:'待收货',barcode:barcode});
    Store.persist();closeModal('ibModal');renderIbTable();refreshDashboard();toast('入库单创建成功','success');
  };
  window.confirmIb=function(id){
    if(!confirm('确认收货？将更新库存。'))return;
    var o=d.inboundOrders.find(function(x){return x.id===id});if(!o||o.status!=='待收货')return;
    o.status='已完成';
    var inv=d.inventory.find(function(i){return i.barcode===o.barcode});
    if(inv){inv.qty+=o.qty;inv.status=getInvStatus(inv)}
    Store.persist();updateLocUsage();renderIbTable();renderInvTable();refreshDashboard();toast('收货确认，库存已更新','success');
  };
  window.cancelIb=function(id){if(!confirm('确定取消？'))return;var o=d.inboundOrders.find(function(x){return x.id===id});if(o)o.status='已取消';Store.persist();renderIbTable();toast('已取消','info')};

  // ===== Outbound =====
  window.renderObTable=function(){
    var s=(document.getElementById('obSearch').value||'').toLowerCase();
    var st=document.getElementById('obStatusFilter').value;
    var data=d.outboundOrders.filter(function(o){return (!s||o.orderNo.toLowerCase().indexOf(s)>-1||o.productName.toLowerCase().indexOf(s)>-1)&&(!st||o.status===st)});
    document.getElementById('obCount').textContent=data.length;
    var tb=document.getElementById('obTableBody');
    if(!data.length){tb.innerHTML='<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">📭</div><p>暂无匹配记录</p></div></td></tr>';return}
    tb.innerHTML=data.map(function(o){return '<tr><td><strong>'+o.orderNo+'</strong></td><td>'+o.productName+'</td><td>'+o.qty.toLocaleString()+o.unit+'</td><td><code>'+o.barcode+'</code></td><td>'+o.location+'</td><td>'+o.customer+'</td><td>'+o.date+'</td><td>'+statusBadge(o.status)+'</td><td>'+(o.status==='待发货'?'<button class="btn btn-xs btn-success" onclick="confirmOb('+o.id+')">确认发货</button> ':'')+'<button class="btn btn-xs btn-danger" onclick="cancelOb('+o.id+')">取消</button></td></tr>'}).join('');
  };
  window.openObModal=function(){populateProductSelect('obProduct');populateLocSelect('obLocation');document.getElementById('obQty').value='1';document.getElementById('obCustomer').value='';openModal('obModal')};
  window.saveOb=function(){
    var pv=document.getElementById('obProduct').value;if(!pv){toast('请选择货品','error');return}
    var parts=pv.split('|');var name=parts[0];var barcode=parts[1];var unit=parts[2];
    var qty=parseInt(document.getElementById('obQty').value)||0;
    var loc=document.getElementById('obLocation').value;
    var customer=document.getElementById('obCustomer').value.trim()||'--';
    var inv=d.inventory.find(function(i){return i.barcode===barcode});
    if(inv&&inv.qty<qty){toast('库存不足！当前库存：'+inv.qty+inv.unit,'error');return}
    d.outboundOrders.unshift({id:d.nextIds.outbound++,orderNo:'OUT-'+today().replace(/-/g,'')+'-'+String(d.nextIds.outbound).padStart(3,'0'),productName:name,qty:qty,unit:unit,location:loc,customer:customer,date:today(),status:'待发货',barcode:barcode});
    Store.persist();closeModal('obModal');renderObTable();toast('出库单创建成功','success');
  };
  window.confirmOb=function(id){
    if(!confirm('确认发货？将扣减库存。'))return;
    var o=d.outboundOrders.find(function(x){return x.id===id});if(!o||o.status!=='待发货')return;
    o.status='已发货';
    var inv=d.inventory.find(function(i){return i.barcode===o.barcode});
    if(inv){inv.qty=Math.max(0,inv.qty-o.qty);inv.status=getInvStatus(inv)}
    Store.persist();updateLocUsage();renderObTable();renderInvTable();refreshDashboard();toast('发货确认，库存已更新','success');
  };
  window.cancelOb=function(id){if(!confirm('确定取消？'))return;var o=d.outboundOrders.find(function(x){return x.id===id});if(o)o.status='已取消';Store.persist();renderObTable();toast('已取消','info')};

  // ===== Location =====
  window.renderLocTable=function(){
    var tb=document.getElementById('locTableBody');
    tb.innerHTML=d.locations.map(function(l){var r=l.capacity>0?((l.used/l.capacity)*100).toFixed(1):0;return '<tr><td><strong>'+l.code+'</strong></td><td>'+l.zone+'</td><td>'+l.shelf+'</td><td>'+l.layer+'</td><td>'+l.capacity.toLocaleString()+'</td><td>'+l.used.toLocaleString()+'</td><td><strong>'+r+'%</strong></td><td>'+statusBadge(getLocStatus(l))+'</td><td><button class="btn btn-xs btn-danger" onclick="delLoc(\''+l.code+'\')">删除</button></td></tr>'}).join('');
  };
  window.openLocModal=function(){document.getElementById('locCode').value='';document.getElementById('locZone').value='A区-电子仓';document.getElementById('locShelf').value='';document.getElementById('locLayer').value='1';document.getElementById('locCapacity').value='';openModal('locModal')};
  window.saveLoc=function(){
    var code=document.getElementById('locCode').value.trim();
    var zone=document.getElementById('locZone').value;
    if(!code||!zone){toast('请填写编码和区域','error');return}
    if(d.locations.find(function(l){return l.code===code})){toast('库位编码已存在','error');return}
    d.locations.push({code:code,zone:zone,shelf:document.getElementById('locShelf').value.trim()||'--',layer:parseInt(document.getElementById('locLayer').value)||1,capacity:parseInt(document.getElementById('locCapacity').value)||100,used:0});
    Store.persist();closeModal('locModal');renderLocTable();initLocChart();toast('库位添加成功','success');
  };
  window.delLoc=function(code){if(d.inventory.some(function(i){return i.location===code})){toast('该库位上有货品，无法删除','error');return}if(!confirm('确定删除 '+code+'？'))return;d.locations=d.locations.filter(function(l){return l.code!==code});Store.persist();renderLocTable();initLocChart();toast('已删除','info')};

  // ===== Init =====
  updateLocUsage();
  refreshDashboard();
  renderInvTable();
  renderPickTable();
  renderIbTable();
  renderObTable();
  renderLocTable();
  initLocChart();

  document.querySelectorAll('.modal-overlay').forEach(function(o){o.addEventListener('click',function(e){if(e.target===o)o.classList.remove('show')})});

  // Storage sync listener
  window.addEventListener('storage',function(e){
    if(e.key===Store.STORAGE_KEY||e.key===Store.SYNC_KEY){
      try{Store.data=JSON.parse(localStorage.getItem(Store.STORAGE_KEY)||'{}');}catch(ex){}
      updateLocUsage();refreshDashboard();renderInvTable();renderPickTable();renderIbTable();renderObTable();renderLocTable();initLocChart();
    }
  });
})();