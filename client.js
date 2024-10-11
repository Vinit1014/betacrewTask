const net = require("net");

const client = new net.Socket();
const PORT = 3000;

client.connect(PORT, "localhost", () => {
  console.log("Connected to server!");

  // Send a request for packets (message type 1)
  const requestType1 = Buffer.from([1, 0]); // Type 1, sequence 0
  client.write(requestType1);
});

// Handle data received from server
client.on("data", (data) => {
  console.log("Received:", data);
  client.destroy(); // Close the connection after receiving data
});

// Handle connection close
client.on("close", () => {
  console.log("Connection closed");
});
