(function () {
  var source = window.CHAT_SOURCE || "";
  var messagesRoot = document.querySelector("[data-messages]");
  var countNode = document.querySelector("[data-count]");
  var isEnglish = document.documentElement.lang === "en";
  var md = isEnglish
    ? window.CHAT_TRANSCRIPT_MD_EN || window.CHAT_TRANSCRIPT_MD || ""
    : window.CHAT_TRANSCRIPT_MD || "";

  if (!messagesRoot) return;

  var labels = isEnglish
    ? {
        user: "User",
        shell: "Shell",
        empty: "No messages parsed.",
        count: "Showing",
        source: "Source file",
      }
    : {
        user: "用户",
        shell: "Shell",
        empty: "没有解析到聊天记录。",
        count: "已展示",
        source: "来源文件",
      };

  var pattern =
    /##\s+(🧑 User|🤖 AI)\s+\[([^\]]+)\]\n\n([\s\S]*?)(?=\n##\s+(?:🧑 User|🤖 AI)\s+\[[^\]]+\]|\s*$)/g;

  var messages = [];
  var match;
  while ((match = pattern.exec(md)) !== null) {
    var roleToken = match[1];
    var timestamp = match[2].trim();
    var content = match[3].trim();

    if (!content || content === "Using tools...") continue;

    messages.push({
      role: roleToken.indexOf("User") > -1 ? "user" : "assistant",
      timestamp: timestamp,
      content: content,
    });
  }

  if (!messages.length) {
    var empty = document.createElement("p");
    empty.className = "note";
    empty.textContent = labels.empty;
    messagesRoot.appendChild(empty);
    if (countNode) countNode.textContent = labels.empty;
    return;
  }

  messages.forEach(function (msg) {
    var row = document.createElement("article");
    row.className = "row " + (msg.role === "user" ? "user" : "shell");

    var meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = msg.role === "user" ? labels.user : labels.shell;

    var bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = msg.content;

    row.appendChild(meta);
    row.appendChild(bubble);
    messagesRoot.appendChild(row);
  });

  if (countNode) {
    countNode.textContent =
      labels.count +
      " " +
      messages.length +
      " " +
      (isEnglish ? "messages" : "条消息");
  }
})();
