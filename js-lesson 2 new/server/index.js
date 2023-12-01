const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (data) => {
    console.log(`Client has send us: ${data}`);

    ws.send(`https://dog.ceo/api/breed/${data}/images/random`);
  });

  ws.on("close", () => {
    console.log("Client has disconnected");
  });
});
