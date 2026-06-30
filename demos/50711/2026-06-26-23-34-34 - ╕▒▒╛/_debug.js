const fs = require('fs');
const c = fs.readFileSync('C:/Users/DELL/WorkBuddy/2026-06-26-23-34-34/app.js', 'utf8').replace(/\r/g, '');

// Try to find the issue by testing progressively larger chunks
const lines = c.split('\n');
console.log('Total lines:', lines.length);

// Find where it breaks
for (let end = 1; end <= lines.length; end++) {
  try {
    new Function(lines.slice(0, end).join('\n'));
  } catch(e) {
    // Now binary search within this range
    let lo = Math.max(1, end - 10);
    let hi = end;
    let lastOk = 0;
    for (let mid = lo; mid <= hi; mid++) {
      try {
        new Function(lines.slice(0, mid).join('\n'));
        lastOk = mid;
      } catch(e2) {
        // fails at mid
        if (mid === lastOk + 1) {
          console.log('Fails between line ' + lastOk + ' and ' + mid);
          console.log('Line ' + mid + ':', lines[mid - 1].trim().substring(0, 120));
          break;
        }
        hi = mid - 1;
      }
    }
    break;
  }
}
