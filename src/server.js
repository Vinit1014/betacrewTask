const net = require("net");
const { createPayloadToSend } = require("./utils/packetUtils");
const packetData = require("./data/packetData");

const orderBook = packetData.packetStream;
let BUFFER_COLLECTOR = Buffer.alloc(0);

// Create a TCP server
const server = net.createServer((client) => {
  console.log("Client connected.");

  client.on("data", (data) => {
    BUFFER_COLLECTOR = Buffer.concat([BUFFER_COLLECTOR, data]);

    // Ensure we process the incoming data correctly
    while (BUFFER_COLLECTOR.length >= 2) {
      const header = BUFFER_COLLECTOR.slice(0, 2);
      const messageType = header.readInt8(0);
      const packetSequence = header.readInt8(1);
      BUFFER_COLLECTOR = BUFFER_COLLECTOR.slice(2);

      if (messageType === 1) {
        // Call Type 1: Stream All Packets
        orderBook.forEach((packet) => {
          if (Math.random() > 0.75) return; // Random packet selection
          const payload = createPayloadToSend(packet);
          client.write(payload);
        });
        // Closing connection after sending all packets
        client.end();
        console.log("Packets sent. Client disconnected.");
      } else if (messageType === 2) {
        // Call Type 2: Resend Packet
        const packetToResend = orderBook.find(
          (packet) => packet.packetSequence === packetSequence
        );
        if (packetToResend) {
          const payload = createPayloadToSend(packetToResend);
          client.write(payload);
          console.log("Packet resent.");
        } else {
          console.log(`No packet found for sequence: ${packetSequence}`);
        }
      } else {
        console.log("Unknown message type.");
      }
    }
  });

  client.on("end", () => {
    console.log("Client disconnected.");
  });

  client.on("error", (err) => {
    console.error("Client error:", err);
  });
});

// Listening for incoming connections
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`TCP server started on port ${PORT}.`);
});

module.exports = server;
