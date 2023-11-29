onmessage = (e) => {
  let workerResult = e.data;
  console.log(workerResult);
  postMessage(returnResult);
};
