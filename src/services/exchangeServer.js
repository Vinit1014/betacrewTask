const net = require("net");
const { createPayloadToSend } = require("../utils/packetUtils");
const packetData = require("../data/packetData");

const orderBook = packetData.packetStream;
let BUFFER_COLLECTOR = Buffer.alloc(0);

// Create a TCP server
const server = net.createServer((client) => {
  console.log("Client connected.");

  client.on("data", (data) => {
    BUFFER_COLLECTOR = Buffer.concat([BUFFER_COLLECTOR, data]);
    
    while (BUFFER_COLLECTOR.length >= 2) {
      const header = BUFFER_COLLECTOR.slice(0, 2);
      const messageType = header.readInt8(0);
      const packetSequence = header.readInt8(1);
      BUFFER_COLLECTOR = BUFFER_COLLECTOR.slice(2);

      if (messageType === 1) {
        // Send packets to the client
        orderBook.forEach((packet) => {
          if (Math.random() > 0.75) return; // Random packet selection
          const payload = createPayloadToSend(packet);
          client.write(payload);
        });
        client.end();
        console.log("Packets sent. Client disconnected.");
      } else if (messageType === 2) {
        // Resend specific packet
        const packetToResend = orderBook.find(
          (packet) => packet.packetSequence === packetSequence
        );
        if (packetToResend) {
          const payload = createPayloadToSend(packetToResend);
          client.write(payload);
          console.log("Packet resent.");
        }
      }
    }
  });

  client.on("end", () => {
    console.log("Client disconnected.");
  });
});

module.exports = server;
