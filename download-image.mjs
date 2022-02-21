import { readFileSync, writeFileSync } from "fs";
import { argv } from "process";
import path from "path";
import { request } from "https";
import { Transform } from "stream";

const recordFile = path.join(path.resolve(), "images/record.json")
const record = JSON.parse(readFileSync(recordFile));

let fileId = 0;
const getDest = (url, filePath) => path.join("images", `${path.basename(filePath).split("-")[0]}-${fileId + 1}${path.extname(url)}`, )


const URL_REG = /!\[[^\]]*\]\((https:\/\/[^\)]*)\)/g;

const filePaths = argv.slice(2).map(file => path.join(path.resolve(), file));

(async () => {
  try {
    await process(filePaths);
  } finally {
    writeFileSync(recordFile, JSON.stringify(record));
  };
})();

function process(filePaths) {
  const allFiles = filePaths.map((filePath) => {
    return new Promise((resolve) => {
      let fileContent = readFileSync(filePath, { encoding: "utf-8" });
      const allUrls = []
      fileContent = fileContent.replace(URL_REG, ($1, url) => {
        allUrls.push(url)
        return $1.replace(url, `{${url}}`);
      })

      const downloadProcess = allUrls
        .filter(url => !record[url])
        .map(url => downloadFile(url, getDest(url, filePath)));

      Promise.all(downloadProcess).then(files => {
        files.forEach(file => {
          const [url, dest] = file;
          record[url] = dest;
          fileContent = fileContent.replace(new RegExp(`{${url}}`, 'g'), dest);
        })
        writeFileSync(filePath, fileContent);
        resolve();
      })
    })
  })
  return Promise.all(allFiles);
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    request(url, (res) => {
      var data = new Transform();
      res.on('data', (chunk) => {
        data.push(chunk);
      });
      res.on('end', () => {
        writeFileSync(dest, data.read());
        resolve([url, dest]);
      });
      res.on("error", (error) => {
        console.log(error);
        reject();
      })
    }).end();
  })
}