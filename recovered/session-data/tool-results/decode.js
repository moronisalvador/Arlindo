const fs = require("fs");
let raw = fs.readFileSync("extracted.txt", "latin1");
// digit map from octal char codes
const map = {
  "\x1e": "0", "\x17": "1", "\x16": "2", "\x18": "3", "\x1b": "4",
  "\x1d": "5", "\x1c": "6", "\x15": "7", "\x1a": "8", "\x19": "9",
  "\x96": "-", "\x14": "fi", "\x1f": "fi", "\x00": " "
};
let t = "";
for (const ch of raw) {
  if (map[ch] !== undefined) t += map[ch];
  else if (ch.charCodeAt(0) < 32 || ch.charCodeAt(0) > 126) t += " ";
  else t += ch;
}
t = t.replace(/\s+/g, " ");
fs.writeFileSync("decoded.txt", t);
console.log("len", t.length);
// locate term section
let i = t.indexOf("Term LSW");
console.log("Term LSW idx", i);
