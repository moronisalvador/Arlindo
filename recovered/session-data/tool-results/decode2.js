const fs = require("fs");
let t = fs.readFileSync("extracted.txt", "latin1");
// literal backslash-octal sequences -> readable
const rep = {
  "\\036": "0", "\\027": "1", "\\026": "2", "\\030": "3", "\\033": "4",
  "\\035": "5", "\\034": "6", "\\025": "7", "\\032": "8", "\\031": "9",
  "\\226": "-", "\\024": "fi", "\\037": "fi", "\\225": "* ", "\\022": "ff",
  "\\020": "ffi", "\\023": "fl", "\\021": "ffl"
};
for (const [k, v] of Object.entries(rep)) {
  t = t.split(k).join(v);
}
// strip remaining backslash-octal
t = t.replace(/\\[0-3][0-7][0-7]/g, "");
// remove stray control bytes
t = t.replace(/[^\x20-\x7e]/g, " ").replace(/\s+/g, " ");
fs.writeFileSync("decoded.txt", t);
console.log("len", t.length, "| Term LSW at", t.indexOf("T erm LSW"));
