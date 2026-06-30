// ======================== 全局变量 ========================
let provider;
let signer;
let contract;
let currentProjectId = null;

// 合约ABI
const CONTRACT_ABI = [
  "function owner() view returns (address)",
  "function projectCount() view returns (uint256)",
  "function projects(uint256) view returns (uint256 id, string name, string description, address creator, uint256 goalAmount, uint256 raisedAmount, uint256 withdrawnAmount, bool active, uint256 createdAt)",
  "function createProject(string _name, string _description, uint256 _goalAmount) returns (uint256)",
  "function donate(uint256 _projectId, string _message) payable",
  "function withdraw(uint256 _projectId, uint256 _amount, string _purpose)",
  "function pauseProject(uint256 _projectId)",
  "function resumeProject(uint256 _projectId)",
  "function getProject(uint256 _projectId) view returns (tuple(uint256 id, string name, string description, address creator, uint256 goalAmount, uint256 raisedAmount, uint256 withdrawnAmount, bool active, uint256 createdAt))",
  "function getDonationCount(uint256 _projectId) view returns (uint256)",
  "function getDonation(uint256 _projectId, uint256 _index) view returns (tuple(address donor, uint256 amount, uint256 projectId, uint256 timestamp, string message))",
  "function getWithdrawalCount(uint256 _projectId) view returns (uint256)",
  "function getWithdrawal(uint256 _projectId, uint256 _index) view returns (tuple(uint256 amount, uint256 projectId, string purpose, uint256 timestamp))",
  "function getDonorProjects(address _donor) view returns (uint256[])",
  "function getProgress(uint256 _projectId) view returns (uint256)",
  "event ProjectCreated(uint256 indexed projectId, string name, address creator, uint256 goalAmount)",
  "event DonationMade(uint256 indexed projectId, address indexed donor, uint256 amount, string message)",
  "event FundsWithdrawn(uint256 indexed projectId, uint256 amount, string purpose)"
];

// ======================== 初始化 ========================

async function init() {
  // 加载配置文件
  try {
    const res = await fetch("config.json");
    if (res.ok) {
      const config = await res.json();
      window._contractAddress = config.address;
      window._contractAbi = config.abi || CONTRACT_ABI;
    }
  } catch (e) {
    console.log("未找到config.json，将使用默认ABI");
  }

  // 尝试初始化 provider
  if (typeof window.ethereum !== "undefined") {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    window.ethereum.on("accountsChanged", () => {
      window.location.reload();
    });
  }
}

// ======================== 钱包连接 ========================

async function connectWallet() {
  try {
    // 确保 provider 已初始化
    if (!provider) {
      if (typeof window.ethereum === "undefined") {
        alert("未检测到 MetaMask，请确保已安装并启用！");
        return;
      }
      provider = new ethers.providers.Web3Provider(window.ethereum);
    }
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);

    document.getElementById("connect-btn").textContent = "已连接";
    document.getElementById("connect-btn").disabled = true;
    const addrSpan = document.getElementById("wallet-address");
    addrSpan.textContent = address.slice(0, 6) + "..." + address.slice(-4) +
      " | 余额: " + parseFloat(ethers.utils.formatEther(balance)).toFixed(4) + " ETH";
    addrSpan.classList.remove("hidden");

    // 加载合约地址（如果init还没完成则重新加载）
    let contractAddress = window._contractAddress;
    let abi = window._contractAbi || CONTRACT_ABI;
    if (!contractAddress) {
      try {
        const res = await fetch("config.json");
        const config = await res.json();
        contractAddress = config.address;
        abi = config.abi || abi;
      } catch (e) {}
    }
    if (!contractAddress) {
      alert("请先部署合约并生成 config.json 文件！");
      return;
    }
    contract = new ethers.Contract(contractAddress, abi, signer);

    await loadProjects();
  } catch (err) {
    console.error("连接钱包失败:", err);
    alert("连接钱包失败: " + err.message);
  }
}

// ======================== 加载项目 ========================

async function loadProjects() {
  const listEl = document.getElementById("project-list");
  listEl.innerHTML = '<p class="loading">加载中...</p>';

  try {
    const count = await contract.projectCount();
    document.getElementById("total-projects").textContent = count.toString();

    if (count.toNumber() === 0) {
      listEl.innerHTML = '<p class="no-records">暂无慈善项目</p>';
      return;
    }

    let totalDonations = 0;
    let totalRaised = ethers.BigNumber.from(0);
    let html = "";

    for (let i = count.toNumber(); i >= 1; i--) {
      const project = await contract.getProject(i);
      const donationCount = await contract.getDonationCount(i);
      totalDonations += donationCount.toNumber();
      totalRaised = totalRaised.add(project.raisedAmount);

      const progress = project.goalAmount.gt(0)
        ? project.raisedAmount.mul(10000).div(project.goalAmount).toNumber() / 100
        : 0;

      html += `
        <div class="project-card" onclick="openProject(${i})">
          <h3>${escapeHtml(project.name)}</h3>
          <p class="desc">${escapeHtml(project.description)}</p>
          <div class="info-row">
            <span>目标金额</span>
            <span>${ethers.utils.formatEther(project.goalAmount)} ETH</span>
          </div>
          <div class="info-row">
            <span>已募金额</span>
            <span>${ethers.utils.formatEther(project.raisedAmount)} ETH</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
            <span class="progress-text">${progress.toFixed(1)}%</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="status-badge ${project.active ? 'status-active' : 'status-paused'}">
              ${project.active ? '进行中' : '已暂停'}
            </span>
            <span style="font-size:0.8rem;color:var(--text-light);">
              ${donationCount.toNumber()} 笔捐款
            </span>
          </div>
        </div>
      `;
    }

    listEl.innerHTML = html;
    document.getElementById("total-donations").textContent = totalDonations;
    document.getElementById("total-raised").textContent = ethers.utils.formatEther(totalRaised);
  } catch (err) {
    console.error("加载项目失败:", err);
    listEl.innerHTML = '<p class="no-records">加载失败，请确保 Hardhat 节点已启动且合约已部署</p>';
  }
}

// ======================== 创建项目 ========================

async function createProject(event) {
  event.preventDefault();

  const name = document.getElementById("project-name").value.trim();
  const desc = document.getElementById("project-desc").value.trim();
  const goal = document.getElementById("project-goal").value;

  if (!name || !desc || !goal) {
    alert("请填写完整信息");
    return;
  }

  try {
    const tx = await contract.createProject(
      name,
      desc,
      ethers.utils.parseEther(goal)
    );
    alert("交易已提交，等待确认...");
    await tx.wait();
    alert("项目创建成功！");

    document.getElementById("create-form").reset();
    await loadProjects();
  } catch (err) {
    console.error("创建项目失败:", err);
    alert("创建失败: " + (err.reason || err.message));
  }
}

// ======================== 项目详情 ========================

async function openProject(projectId) {
  currentProjectId = projectId;
  const modal = document.getElementById("modal");
  modal.classList.remove("hidden");

  try {
    const project = await contract.getProject(projectId);
    const progress = project.goalAmount.gt(0)
      ? project.raisedAmount.mul(10000).div(project.goalAmount).toNumber() / 100
      : 0;

    document.getElementById("modal-title").textContent = project.name;
    document.getElementById("modal-desc").textContent = project.description;
    document.getElementById("modal-goal").textContent = ethers.utils.formatEther(project.goalAmount) + " ETH";
    document.getElementById("modal-raised").textContent = ethers.utils.formatEther(project.raisedAmount) + " ETH";
    document.getElementById("modal-withdrawn").textContent = ethers.utils.formatEther(project.withdrawnAmount) + " ETH";
    document.getElementById("modal-status").textContent = project.active ? "进行中" : "已暂停";
    document.getElementById("modal-status").style.color = project.active ? "var(--success)" : "var(--danger)";

    document.getElementById("modal-progress").style.width = Math.min(progress, 100) + "%";
    document.getElementById("modal-progress-text").textContent = progress.toFixed(1) + "%";

    // 显示/隐藏提取资金区域
    const withdrawSection = document.getElementById("withdraw-section");
    const currentAddr = await signer.getAddress();
    if (currentAddr.toLowerCase() === project.creator.toLowerCase() && project.active) {
      withdrawSection.style.display = "block";
    } else {
      withdrawSection.style.display = "none";
    }

    await loadDonations(projectId);
    await loadWithdrawals(projectId);
  } catch (err) {
    console.error("加载项目详情失败:", err);
  }
}

// ======================== 加载捐款记录 ========================

async function loadDonations(projectId) {
  const listEl = document.getElementById("donation-list");
  try {
    const count = await contract.getDonationCount(projectId);

    if (count.toNumber() === 0) {
      listEl.innerHTML = '<p class="no-records">暂无捐款记录</p>';
      return;
    }

    let html = "";
    for (let i = 0; i < count.toNumber(); i++) {
      const d = await contract.getDonation(projectId, i);
      const time = new Date(d.timestamp.toNumber() * 1000).toLocaleString("zh-CN");
      html += `
        <div class="record-item">
          <div>
            <div class="address">${d.donor}</div>
            ${d.message ? `<div style="font-size:0.8rem;margin-top:2px;">${escapeHtml(d.message)}</div>` : ''}
          </div>
          <div style="text-align:right;">
            <div class="amount">${ethers.utils.formatEther(d.amount)} ETH</div>
            <div class="time">${time}</div>
          </div>
        </div>
      `;
    }
    listEl.innerHTML = html;
  } catch (err) {
    listEl.innerHTML = '<p class="no-records">加载失败</p>';
  }
}

// ======================== 加载提取记录 ========================

async function loadWithdrawals(projectId) {
  const listEl = document.getElementById("withdrawal-list");
  try {
    const count = await contract.getWithdrawalCount(projectId);

    if (count.toNumber() === 0) {
      listEl.innerHTML = '<p class="no-records">暂无提取记录</p>';
      return;
    }

    let html = "";
    for (let i = 0; i < count.toNumber(); i++) {
      const w = await contract.getWithdrawal(projectId, i);
      const time = new Date(w.timestamp.toNumber() * 1000).toLocaleString("zh-CN");
      html += `
        <div class="record-item">
          <div>
            <div class="purpose">${escapeHtml(w.purpose)}</div>
          </div>
          <div style="text-align:right;">
            <div class="amount">${ethers.utils.formatEther(w.amount)} ETH</div>
            <div class="time">${time}</div>
          </div>
        </div>
      `;
    }
    listEl.innerHTML = html;
  } catch (err) {
    listEl.innerHTML = '<p class="no-records">加载失败</p>';
  }
}

// ======================== 捐款 ========================

async function donate() {
  const amount = document.getElementById("donate-amount").value;
  const message = document.getElementById("donate-message").value || "";

  if (!amount || parseFloat(amount) <= 0) {
    alert("请输入有效的捐款金额");
    return;
  }

  try {
    const tx = await contract.donate(currentProjectId, message, {
      value: ethers.utils.parseEther(amount)
    });
    alert("捐款交易已提交，等待确认...");
    await tx.wait();
    alert("捐款成功！感谢您的善举！");

    document.getElementById("donate-amount").value = "";
    document.getElementById("donate-message").value = "";

    await openProject(currentProjectId);
    await loadProjects();
  } catch (err) {
    console.error("捐款失败:", err);
    alert("捐款失败: " + (err.reason || err.message));
  }
}

// ======================== 提取资金 ========================

async function withdrawFund() {
  const amount = document.getElementById("withdraw-amount").value;
  const purpose = document.getElementById("withdraw-purpose").value.trim();

  if (!amount || parseFloat(amount) <= 0) {
    alert("请输入有效的提取金额");
    return;
  }
  if (!purpose) {
    alert("请填写资金用途");
    return;
  }

  try {
    const tx = await contract.withdraw(
      currentProjectId,
      ethers.utils.parseEther(amount),
      purpose
    );
    alert("提取交易已提交，等待确认...");
    await tx.wait();
    alert("资金提取成功！");

    document.getElementById("withdraw-amount").value = "";
    document.getElementById("withdraw-purpose").value = "";

    await openProject(currentProjectId);
    await loadProjects();
  } catch (err) {
    console.error("提取失败:", err);
    alert("提取失败: " + (err.reason || err.message));
  }
}

// ======================== 关闭弹窗 ========================

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  currentProjectId = null;
}

// 点击背景关闭
document.getElementById("modal").addEventListener("click", function(e) {
  if (e.target === this) closeModal();
});

// ESC关闭
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") closeModal();
});

// ======================== 工具函数 ========================

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ======================== 启动 ========================
init();
