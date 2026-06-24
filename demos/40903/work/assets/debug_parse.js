const fs = require("fs");
const input = fs.readFileSync("全集.md", "utf-8");
const lines = input.split(/\r?\n/);

// 找第一个正文标题
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("1、儿歌·应舞狮")) {
    console.log(`Found title at line ${i + 1}: "${lines[i]}"`);
    for (let j = i; j < i + 20; j++) {
      console.log(`${j + 1}: "${lines[j]}"`);
    }
    break;
  }
}

// 测试正则
const title = "儿歌·应舞狮";
const pattern = new RegExp(`^1[^\\d\\w]*${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
console.log("Pattern:", pattern);
console.log("Test '1、儿歌·应舞狮':", pattern.test("1、儿歌·应舞狮"));
