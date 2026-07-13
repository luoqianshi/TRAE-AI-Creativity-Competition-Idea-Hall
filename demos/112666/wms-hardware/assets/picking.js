// 智拣 - 穿戴式拣货终端逻辑
(function() {
  'use strict';
  var d = Store.data;
  var currentTask = null;
  var currentItemIdx = 0;
  var currentPickQty = 1;
  var recognition = null;
  var isListening = false;

  // ===== Clock =====
  function updateClock(){var n=new Date();document.getElementById('clock').textContent=n.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}
  updateClock();setInterval(updateClock,30000);

  // ===== Screen =====
  window.showScreen = function(name){
    document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active')});
    var el=document.getElementById('screen-'+name);if(el)el.classList.add('active');
    var titles={welcome:'任务就绪','task-select':'选择任务',picking:'拣货中',complete:'任务完成'};
    document.getElementById('screenTitle').textContent=titles[name]||'';
  };

  // ===== Toast =====
  function toast(msg,type){
    var t=document.getElementById('terminalToast');t.textContent=msg;t.className='terminal-toast '+(type||'')+' show';
    clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('show')},2000);
    vibrate();
  }

  // ===== Vibrate =====
  function vibrate(){
    if(navigator.vibrate){navigator.vibrate([50,30,50])}
    var v=document.getElementById('vibrateOverlay');v.style.display='block';
    setTimeout(function(){v.style.display='none'},300);
  }

  // ===== Voice =====
  function initVoice(){
    var SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SpeechRecognition){document.getElementById('voiceStatus').style.display='none';return}
    recognition=new SpeechRecognition();
    recognition.lang='zh-CN';
    recognition.continuous=true;
    recognition.interimResults=false;
    recognition.onresult=function(e){
      var text=e.results[e.results.length-1][0].transcript.trim();
      document.getElementById('voiceText').textContent='听到: "'+text+'"';
      handleVoiceCommand(text);
    };
    recognition.onerror=function(){stopListening()};
    recognition.onend=function(){if(isListening){try{recognition.start()}catch(ex){stopListening()}}};
    document.getElementById('voiceStatus').style.display='flex';
    startListening();
  }

  function startListening(){
    if(!recognition)return;
    try{recognition.start();isListening=true;document.getElementById('voiceDot').classList.add('active');document.getElementById('waveIndicator').style.display='flex';document.getElementById('voiceText').textContent='正在聆听...'}catch(ex){}
  }

  function stopListening(){
    isListening=false;
    try{recognition.stop()}catch(ex){}
    document.getElementById('voiceDot').classList.remove('active');
    document.getElementById('waveIndicator').style.display='none';
    document.getElementById('voiceText').textContent='语音就绪 · 说"开始拣货"启动';
  }

  function handleVoiceCommand(text){
    if(text.indexOf('开始拣货')>-1||text.indexOf('开始')>-1){startPicking();return}
    if(text.indexOf('确认')>-1||text.indexOf('完成')>-1||text.indexOf('好的')>-1){if(currentTask&&currentItemIdx<currentTask.items.length)confirmPick();return}
    if(text.indexOf('跳过')>-1){skipItem();return}
    if(text.indexOf('返回')>-1||text.indexOf('首页')>-1){resetPicking();showScreen('welcome');return}
  }

  // ===== Refresh =====
  function reloadData(){try{var raw=localStorage.getItem(Store.STORAGE_KEY);if(raw){d=JSON.parse(raw);Store.data=d}}catch(ex){}}

  function refreshWelcome(){
    reloadData();
    var pending=d.pickingOrders.filter(function(o){return o.status==='待拣货'||o.status==='拣货中'}).length;
    document.getElementById('pendingTaskCount').textContent=pending;
    var completed=d.pickingOrders.filter(function(o){return o.status==='已完成'}).length;
    document.getElementById('todayCompleted').textContent=completed+' 单';
  }

  // ===== Start Picking =====
  window.startPicking = function(){
    reloadData();
    var available=d.pickingOrders.filter(function(o){return o.status==='待拣货'||o.status==='拣货中'});
    if(available.length===0){toast('暂无待拣货任务','error');return}

    if(available.length===1){
      selectTask(available[0]);
    }else{
      // Show task selection
      var list=document.getElementById('taskList');
      list.innerHTML=available.map(function(o){
        return '<div class="task-card" onclick="selectTaskById('+o.id+')" style="cursor:pointer"><div class="task-header"><span class="task-no">'+o.orderNo+'</span><span class="badge" style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:0.7rem;background:'+(o.priority==='高'?'#fee2e2;color:#991b1b':'#fef3c7;color:#92400e')+'">'+o.priority+'</span></div><div class="task-customer">'+o.customer+'</div><div class="task-meta"><span>📦 '+o.items.length+' 种货品</span><span>'+o.waveNo+'</span></div></div>';
      }).join('');
      showScreen('task-select');
    }
    toast('任务已加载，准备拣货','success');
  };

  window.selectTaskById = function(id){
    reloadData();
    var o=d.pickingOrders.find(function(x){return x.id===id});
    if(o) selectTask(o);
  };

  function selectTask(task){
    currentTask=task;
    currentItemIdx=0;
    // Mark as picking
    if(task.status==='待拣货'){task.status='拣货中';task.assignee='张三';Store.persist()}
    // Find first unpicked item
    for(var i=0;i<task.items.length;i++){if(task.items[i].status!=='已完成'){currentItemIdx=i;break}}
    if(currentItemIdx>=task.items.length){completeTask();return}
    currentPickQty=1;
    showScreen('picking');
    renderTaskCard();
    renderCurrentItem();
    toast('开始拣货: '+task.orderNo,'success');
    if(isListening){speakText('开始拣货，请前往 '+task.items[currentItemIdx].location+' 库位')}
  }

  function renderTaskCard(){
    var t=currentTask;
    var card=document.getElementById('activeTaskCard');
    card.innerHTML='<div class="task-header"><span class="task-no">'+t.orderNo+'</span></div><div class="task-customer">'+t.customer+'</div><div class="task-meta"><span>📦 '+t.items.length+' 种货品</span><span>'+t.waveNo+'</span></div>';
  }

  function renderCurrentItem(){
    if(!currentTask||currentItemIdx>=currentTask.items.length){completeTask();return}
    var it=currentTask.items[currentItemIdx];
    document.getElementById('itemLocation').textContent=it.location;
    document.getElementById('itemName').textContent=it.productName;
    document.getElementById('itemQty').textContent='需拣: '+it.qty+it.unit+' | 已拣: '+it.picked+it.unit;
    document.getElementById('itemBarcode').textContent='条码: '+it.barcode;
    document.getElementById('qtyDisplay').textContent=currentPickQty;
    document.getElementById('manualBarcode').value='';
    document.getElementById('manualBarcode').focus();

    // Progress
    var total=currentTask.items.reduce(function(s,i){return s+i.qty},0);
    var picked=currentTask.items.reduce(function(s,i){return s+i.picked},0);
    var pct=total>0?Math.round((picked/total)*100):0;
    document.getElementById('pickProgress').style.width=pct+'%';
    document.getElementById('pickProgressText').textContent=picked+'/'+total;

    // Navigation arrow
    var arrows={A:'⬆',B:'➡',C:'⬅',D:'⬇',E:'↗'};
    document.getElementById('navArrow').textContent=arrows[it.location.charAt(0)]||'📍';
  }

  // ===== Change Qty =====
  window.changeQty=function(delta){
    currentPickQty=Math.max(1,currentPickQty+delta);
    var it=currentTask.items[currentItemIdx];
    var remain=it.qty-it.picked;
    if(currentPickQty>remain)currentPickQty=remain;
    document.getElementById('qtyDisplay').textContent=currentPickQty;
  };

  // ===== Scanner =====
  window.focusScanner=function(){document.getElementById('manualBarcode').focus()};

  window.verifyBarcode=function(){
    if(!currentTask||currentItemIdx>=currentTask.items.length)return;
    var input=document.getElementById('manualBarcode').value.trim();
    var it=currentTask.items[currentItemIdx];
    if(!input){toast('请输入或扫描条码','error');return}
    if(input===it.barcode){
      toast('条码验证通过！✅','success');
      document.getElementById('scannerArea').style.borderColor='var(--accent2)';
      setTimeout(function(){document.getElementById('scannerArea').style.borderColor='';},1500);
      document.getElementById('btnConfirmPick').focus();
    }else{
      toast('条码不匹配！请核对货品','error');
      document.getElementById('scannerArea').style.borderColor='var(--danger)';
      setTimeout(function(){document.getElementById('scannerArea').style.borderColor='';},1500);
      vibrate();vibrate();
    }
  };

  // ===== Confirm Pick =====
  window.confirmPick=function(){
    if(!currentTask||currentItemIdx>=currentTask.items.length)return;
    var it=currentTask.items[currentItemIdx];
    var remain=it.qty-it.picked;
    if(currentPickQty>remain){currentPickQty=remain}

    // Verify barcode
    var input=document.getElementById('manualBarcode').value.trim();
    if(input!==it.barcode){toast('请先扫描/输入正确条码','error');document.getElementById('manualBarcode').focus();return}

    it.picked+=currentPickQty;
    if(it.picked>=it.qty){it.status='已完成'}

    // Update inventory
    var inv=d.inventory.find(function(i){return i.barcode===it.barcode});
    if(inv){inv.qty=Math.max(0,inv.qty-currentPickQty);inv.status=inv.qty<=0?'缺货':(inv.qty<inv.safety?'低库存':'正常')}

    // Update loc usage
    d.locations.forEach(function(l){
      l.used=d.inventory.filter(function(i){return i.location===l.code}).reduce(function(s,i){return s+i.qty},0);
    });

    Store.persist();
    toast('✅ +'+currentPickQty+it.unit+' '+it.productName,'success');
    vibrate();

    // Move to next item
    var found=false;
    for(var i=currentItemIdx+1;i<currentTask.items.length;i++){if(currentTask.items[i].status!=='已完成'){currentItemIdx=i;found=true;break}}
    if(!found){for(var j=0;j<currentItemIdx;j++){if(currentTask.items[j].status!=='已完成'){currentItemIdx=j;found=true;break}}}
    if(!found){completeTask();return}

    currentPickQty=1;
    renderCurrentItem();
    if(isListening){speakText('下一货品，'+currentTask.items[currentItemIdx].location+' 库位')}
  };

  window.skipItem=function(){
    if(!currentTask||currentItemIdx>=currentTask.items.length)return;
    var found=false;
    for(var i=currentItemIdx+1;i<currentTask.items.length;i++){if(currentTask.items[i].status!=='已完成'){currentItemIdx=i;found=true;break}}
    if(!found){for(var j=0;j<currentItemIdx;j++){if(currentTask.items[j].status!=='已完成'){currentItemIdx=j;found=true;break}}}
    if(!found){completeTask();return}
    currentPickQty=1;
    renderCurrentItem();
    toast('已跳过','');
  };

  // ===== Complete =====
  function completeTask(){
    if(currentTask){
      currentTask.status='已完成';
      Store.persist();
      var total=currentTask.items.reduce(function(s,i){return s+i.qty},0);
      var picked=currentTask.items.reduce(function(s,i){return s+i.picked},0);
      document.getElementById('completeStats').innerHTML='订单: '+currentTask.orderNo+'<br>客户: '+currentTask.customer+'<br>完成: '+picked+'/'+total+' 件';
    }
    currentTask=null;
    currentItemIdx=0;
    showScreen('complete');
    toast('🎉 拣货任务完成！','success');
    if(isListening){speakText('任务完成，辛苦了')}
    refreshWelcome();
  }

  window.resetPicking=function(){
    currentTask=null;currentItemIdx=0;currentPickQty=1;
    refreshWelcome();
    startListening();
    showScreen('welcome');
  };

  // ===== Speak =====
  function speakText(text){
    if('speechSynthesis' in window){
      var u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=0.9;u.pitch=1;
      window.speechSynthesis.cancel();
      setTimeout(function(){window.speechSynthesis.speak(u)},200);
    }
  }

  // ===== Listen for storage changes =====
  window.addEventListener('storage',function(e){
    if(e.key===Store.STORAGE_KEY||e.key===Store.SYNC_KEY){
      reloadData();
      if(currentTask){
        var updated=d.pickingOrders.find(function(o){return o.id===currentTask.id});
        if(updated)currentTask=updated;
        renderCurrentItem();
      }
      refreshWelcome();
    }
  });

  // ===== Init =====
  refreshWelcome();
  initVoice();
  setTimeout(function(){document.getElementById('manualBarcode').focus()},500);

  // Keyboard shortcuts
  document.addEventListener('keydown',function(e){
    if(e.key==='F1'){startPicking();e.preventDefault()}
    if(e.key==='Enter'&&document.activeElement===document.getElementById('manualBarcode')){verifyBarcode();e.preventDefault()}
    if(e.key===' '&&currentTask){confirmPick();e.preventDefault()}
  });
})();