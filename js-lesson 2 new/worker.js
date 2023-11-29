// import {
//   BlobWriter,
//   HttpReader,
//   TextReader,
//   ZipWriter,
// } from "https://unpkg.com/@zip.js/zip.js/index.js";

onmessage = (e) => {
  let workerResult = e.data;
  postMessage(workerResult);
};
