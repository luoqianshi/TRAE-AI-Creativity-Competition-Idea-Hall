import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// The sidebar to remove starts from <ul>...</ul> below <p>如若选择已有日期覆盖...</p>
// We can just remove the whole "历史抄表库查询与导出" div
const sidebarRegex = /<div className="border-t border-zinc-100 pt-5 space-y-4 flex-1 flex flex-col">[\s\S]*?<h4 className="text-xs font-semibold text-zinc-900">历史抄表库查询与导出<\/h4>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

// Wait, the regex might be tricky. Let's see how many `</div>` there are.
// I can just replace the whole text from ` <div className="border-t border-zinc-100 pt-5 ` up to before the `</div>` closing `w-1/3 space-y-6`.
