(function () {
  var tags = Array.prototype.slice.call(document.querySelectorAll('.tag'));
  var preview = document.getElementById('aiPreview');
  var count = document.getElementById('selectedCount');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));

  var fragments = {
    '开心': '心情里有一块明亮的地方，像是被今天温柔地托了一下',
    '开会': '工作节奏被几场会议切开，信息很多，但你也抓住了重点',
    '通勤': '通勤路上留出了一段缓冲时间，让思绪慢慢从一个场景走向另一个场景',
    '健身': '你没有把身体放在最后，运动让这一天重新有了掌控感',
    '外卖': '一顿简单的外卖解决了饥饿，也提醒你忙碌时可以对自己宽容一点',
    '焦虑': '焦虑短暂出现过，但它更像提醒，而不是对今天的否定',
    '朋友': '和朋友的连接让日常不只剩下任务，也多了一点被接住的感觉',
    '早睡': '你想把今晚留给休息，让明天从更轻松的状态开始',
    '学习': '学习让今天多了一点向前的证据，即使进度不大也值得记录',
    '散步': '散步把注意力从屏幕里拉出来，生活重新有了空气感'
  };

  function activeLabels() {
    return tags.filter(function (tag) {
      return tag.classList.contains('active');
    }).map(function (tag) {
      return tag.getAttribute('data-text');
    });
  }

  function renderPreview() {
    var labels = activeLabels();
    count.textContent = '已选 ' + labels.length + ' 个';

    if (!labels.length) {
      preview.innerHTML = '先随手点几个标签吧。哪怕只有一个词，也能成为今天被记住的入口。<span class="ghost-line"></span>';
      return;
    }

    var first = labels.slice(0, 4).map(function (label) {
      return fragments[label];
    }).filter(Boolean);

    var sentence = '今天被这些片段标记：' + labels.join('、') + '。' + first.join('；') + '。这些词不需要很完整，却已经足够拼出今天的轮廓。';
    preview.innerHTML = sentence + '<span class="ghost-line"></span>';
  }

  tags.forEach(function (tag) {
    tag.addEventListener('click', function () {
      tag.classList.toggle('active');
      renderPreview();
    });
  });

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (item) {
        item.classList.remove('active');
      });
      tab.classList.add('active');
    });
  });

  renderPreview();
})();
