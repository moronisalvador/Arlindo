const fs = require("fs"), zlib = require("zlib");
const buf = fs.readFileSync("webfetch-1784419904546-7k75k1.pdf");
let out = [];
let idx = 0;
while (true) {
  let s = buf.indexOf("stream", idx);
  if (s < 0) break;
  let start = s + 6;
  if (buf[start] === 13) start++;
  if (buf[start] === 10) start++;
  let e = buf.indexOf("endstream", start);
  if (e < 0) break;
  let chunk = buf.slice(start, e);
  try {
    let d = zlib.inflateSync(chunk).toString("latin1");
    out.push(d);
  } catch (err) {}
  idx = e + 9;
}
let text = out.join("\n");
let matches = text.match(/\((?:[^()\\]|\\.)*\)/g) || [];
let decoded = matches.map(m => m.slice(1, -1).replace(/\\([()\\])/g, "$1").replace(/\\n/g, " ")).join(" ");
fs.writeFileSync("extracted.txt", decoded);
console.log("LEN", decoded.length);
