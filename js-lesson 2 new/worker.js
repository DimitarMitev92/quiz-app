import {
  BlobWriter,
  HttpReader,
  TextReader,
  ZipWriter,
} from "https://unpkg.com/@zip.js/zip.js/index.js";

onmessage = async (e) => {
  let userData = e.data.userData;

  const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
  await zipWriter.add("result.txt", new TextReader(userData));
  const blob = await zipWriter.close();
  postMessage(blob);
};
