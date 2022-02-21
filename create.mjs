import { readFileSync, writeFileSync } from "fs";
import { argv } from "process";


const title = argv.slice(2)[0];

const readme = readFileSync("./README.md", { encoding: "utf-8" });
const [lastLine] = readme.split("\n").filter(line => line.trim()).reverse();
const numberMatched = lastLine.match(/\d{4}/);
const lastNumber = numberMatched && +numberMatched[0] || 0;
const newNumber = lastNumber + 1; `${lastNumber + 1}`.padStart(4, 0);
const newFile = `${String(newNumber).padStart(4, 0)}-${title.toLowerCase().split(" ").join("-")}.md`;
const newLine = `\n### [${newNumber}. ${title}](./${newFile})`;

writeFileSync("./README.md", newLine, { flag: 'a' });
writeFileSync(newFile, `# ${title}`);