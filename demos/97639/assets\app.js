(function () {
  var levels = [
    {
      id: "qin",
      title: "秦统一六国后",
      era: "LEVEL 01 · 制度统一",
      person: "身份：秦始皇",
      risk: "风险：地方阻力",
      goal: "目标：加强管理",
      context: "六国刚刚统一，各地文字、货币和度量衡并不相同。你站在新的帝国中心，需要决定是否用统一制度把广阔土地连接起来。",
      choices: [
        {
          text: "推行统一文字、货币和度量衡",
          intro: "你选择用制度把国家连接起来。",
          shortTerm: "各地管理成本下降，政令、交易和记录更容易统一，但推行过程中会遇到旧贵族和地方习惯的反弹。",
          longTerm: "统一制度加强了中央集权，也促进了经济交流和文化沟通，让“统一国家”的观念更稳定。",
          real: "真实历史中，秦朝统一文字、货币、度量衡，并以制度统一巩固国家管理。"
        },
        {
          text: "暂缓统一，先减少地方不满",
          intro: "你选择降低改革速度，先观察各地反应。",
          shortTerm: "地方抵触可能减少，但不同制度继续并存，政令传达和经济往来仍然复杂。",
          longTerm: "国家统一的实际效果会变弱，中央对地方的管理难度更高。",
          real: "真实历史中，秦朝没有选择长期暂缓，而是快速推进统一制度。"
        }
      ]
    },
    {
      id: "hongmen",
      title: "鸿门宴",
      era: "LEVEL 02 · 楚汉转折",
      person: "身份：项羽",
      risk: "风险：判断失误",
      goal: "目标：掌握局势",
      context: "刘邦先入关中，局势变得微妙。你拥有强大的军事实力，却要判断眼前的人是暂时盟友，还是未来威胁。",
      choices: [
        {
          text: "放走刘邦，保持英雄气度",
          intro: "你选择暂时放过刘邦。",
          shortTerm: "宴会冲突被化解，表面上的联盟关系仍能维持。",
          longTerm: "刘邦获得保存实力和重新布局的机会，楚汉局势会继续变化。",
          real: "真实历史中，刘邦在鸿门宴后脱身，后来楚汉相争，最终建立汉朝。"
        },
        {
          text: "果断除掉刘邦，消除威胁",
          intro: "你选择把政治风险扼杀在宴席之上。",
          shortTerm: "最大竞争者被削弱，但可能引发其他势力恐惧和反弹。",
          longTerm: "楚汉格局会被改写，但项羽仍要面对治理能力、联盟关系和民心问题。",
          real: "真实历史中，项羽没有在鸿门宴除掉刘邦。"
        }
      ]
    },
    {
      id: "zhuge",
      title: "蜀汉后期北伐",
      era: "LEVEL 03 · 战略选择",
      person: "身份：诸葛亮",
      risk: "风险：国力有限",
      goal: "目标：恢复汉室",
      context: "蜀汉实力有限，但北伐承载着政治理想和战略主动权。你需要在理想、资源和现实之间选择。",
      choices: [
        {
          text: "坚持北伐，争取战略主动",
          intro: "你选择继续出兵北伐。",
          shortTerm: "蜀汉维持进取姿态，也能凝聚内部目标，但粮草和兵力压力很大。",
          longTerm: "北伐体现了战略理想，也暴露出弱国对强敌作战的历史局限。",
          real: "真实历史中，诸葛亮多次北伐，但未能实现统一目标。"
        },
        {
          text: "休养生息，减少军事消耗",
          intro: "你选择保存国力。",
          shortTerm: "国家负担减轻，百姓和军队能获得恢复时间。",
          longTerm: "蜀汉可能失去主动进攻的机会，也难以改变三国力量对比。",
          real: "真实历史中，诸葛亮仍以北伐作为重要战略方向。"
        }
      ]
    },
    {
      id: "zhenghe",
      title: "郑和下西洋",
      era: "LEVEL 04 · 海上交流",
      person: "身份：郑和",
      risk: "风险：成本巨大",
      goal: "目标：对外交流",
      context: "船队远航需要大量资源，也能带来外交影响和海上交流。你需要判断国家是否继续把目光投向海洋。",
      choices: [
        {
          text: "继续远航，扩大交流",
          intro: "你选择扬帆出海。",
          shortTerm: "明朝影响力扩大，与海外地区的联系更紧密。",
          longTerm: "远航展示了航海能力和对外交流，但也需要国家政策持续支持。",
          real: "真实历史中，郑和七下西洋，促进了中外交流。"
        },
        {
          text: "停止远航，节省资源",
          intro: "你选择把资源留在国内。",
          shortTerm: "财政和人力压力降低，国家可把注意力放回内政。",
          longTerm: "海上交流的持续性下降，国家海洋视野可能收缩。",
          real: "真实历史中，郑和远航后来停止，与国家政策变化有关。"
        }
      ]
    },
    {
      id: "lin",
      title: "虎门销烟前夜",
      era: "LEVEL 05 · 近代转折",
      person: "身份：林则徐",
      risk: "风险：国际冲突",
      goal: "目标：禁绝鸦片",
      context: "鸦片泛滥正在伤害社会和财政。你知道强硬禁烟可能引发冲突，但退让也会让危机继续扩大。",
      choices: [
        {
          text: "坚决禁烟，维护国家利益",
          intro: "你选择强硬禁烟。",
          shortTerm: "禁烟行动震动巨大，显示出抵制鸦片的决心。",
          longTerm: "民族危机和外部冲突进一步显现，中国近代史出现重大转折。",
          real: "真实历史中，林则徐主持虎门销烟，成为近代中国反侵略斗争的重要事件。"
        },
        {
          text: "放缓禁烟，避免直接冲突",
          intro: "你选择降低冲突风险。",
          shortTerm: "外部压力可能暂时缓和，但鸦片问题仍会继续侵蚀社会。",
          longTerm: "危机不会自动消失，国家仍要面对贸易、主权和社会问题。",
          real: "真实历史中，林则徐采取了坚决禁烟的路线。"
        }
      ]
    }
  ];

  var currentLevel = 0;
  var selectedChoice = null;

  var levelList = document.getElementById("levelList");
  var eraLabel = document.getElementById("eraLabel");
  var levelTitle = document.getElementById("levelTitle");
  var personTag = document.getElementById("personTag");
  var riskTag = document.getElementById("riskTag");
  var goalTag = document.getElementById("goalTag");
  var contextText = document.getElementById("contextText");
  var choices = document.getElementById("choices");
  var resultBox = document.getElementById("resultBox");
  var resultTitle = document.getElementById("resultTitle");
  var resultIntro = document.getElementById("resultIntro");
  var shortTerm = document.getElementById("shortTerm");
  var longTerm = document.getElementById("longTerm");
  var realHistory = document.getElementById("realHistory");
  var reportBtn = document.getElementById("reportBtn");
  var decisionReport = document.getElementById("decisionReport");

  function renderLevelList() {
    levelList.innerHTML = "";
    levels.forEach(function (level, index) {
      var button = document.createElement("button");
      button.className = "level-btn";
      button.type = "button";
      button.setAttribute("aria-pressed", index === currentLevel ? "true" : "false");
      button.innerHTML = level.title + "<span>" + level.person + "</span>";
      button.addEventListener("click", function () {
        currentLevel = index;
        selectedChoice = null;
        render();
      });
      levelList.appendChild(button);
    });
  }

  function render() {
    var level = levels[currentLevel];
    eraLabel.textContent = level.era;
    levelTitle.textContent = level.title;
    personTag.textContent = level.person;
    riskTag.textContent = level.risk;
    goalTag.textContent = level.goal;
    contextText.textContent = level.context;
    resultBox.classList.remove("show");
    choices.innerHTML = "";

    level.choices.forEach(function (choice, index) {
      var button = document.createElement("button");
      button.className = "choice-btn";
      button.type = "button";
      button.textContent = choice.text;
      button.addEventListener("click", function () {
        selectedChoice = index;
        showResult();
        Array.prototype.forEach.call(document.querySelectorAll(".choice-btn"), function (item) {
          item.classList.remove("selected");
        });
        button.classList.add("selected");
      });
      choices.appendChild(button);
    });

    renderLevelList();
  }

  function showResult() {
    var level = levels[currentLevel];
    var choice = level.choices[selectedChoice];
    resultTitle.textContent = "你的选择：" + choice.text;
    resultIntro.textContent = choice.intro;
    shortTerm.textContent = choice.shortTerm;
    longTerm.textContent = choice.longTerm;
    realHistory.textContent = choice.real;
    resultBox.classList.add("show");
  }

  function createReport() {
    if (selectedChoice === null) {
      return;
    }
    var level = levels[currentLevel];
    var choice = level.choices[selectedChoice];
    decisionReport.innerHTML =
      "<h3>我的历史决策报告</h3>" +
      "<p><strong>历史身份：</strong>" + level.person.replace("身份：", "") + "</p>" +
      "<p><strong>关键现场：</strong>" + level.title + "</p>" +
      "<p><strong>我的决定：</strong>" + choice.text + "</p>" +
      "<p><strong>我理解到：</strong>" + choice.longTerm + "</p>" +
      "<p><strong>真实历史对照：</strong>" + choice.real + "</p>";
    decisionReport.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  reportBtn.addEventListener("click", createReport);
  render();
})();
