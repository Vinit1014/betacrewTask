const net = require("net");
const readline = require("readline");
const fs = require("fs");

const PORT = 3000;
const receivedPackets = [];

// Load packets from packets.json if it exists
const PACKETS_FILE = "packets.json";
let savedPackets = [];
if (fs.existsSync(PACKETS_FILE)) {
  savedPackets = JSON.parse(fs.readFileSync(PACKETS_FILE, "utf8"));
}

const client = new net.Socket();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to check if packet with given sequence number exists in savedPackets
const isPacketInFile = (packetSequence) => {
  return savedPackets.some((packet) => packet.packetSequence === packetSequence);
};

// Handle incoming data from the server
client.on("data", (data) => {
  console.log("Received raw data:", data);

  // Decode the received data
  while (data.length >= 17) { // Each packet is 17 bytes long
    const symbol = data.slice(0, 4).toString("ascii").trim();
    const buySellIndicator = String.fromCharCode(data.readUInt8(4));
    const quantity = data.readInt32BE(5);
    const price = data.readInt32BE(9);
    const packetSequence = data.readInt32BE(13);

    // Store the received packet
    const packet = { symbol, buySellIndicator, quantity, price, packetSequence };
    
    // Only add packet if it isn't already saved
    if (!isPacketInFile(packetSequence)) {
      receivedPackets.push(packet);
      savedPackets.push(packet); // Update the in-memory savedPackets
    }

    // Process the remaining data
    data = data.slice(17); // Move past the current packet
  }

  // Write the received packets to a JSON file once the connection is closed
  if (data.length === 0 && receivedPackets.length > 0) {
    fs.writeFileSync(PACKETS_FILE, JSON.stringify(savedPackets, null, 2));
    console.log("New packets saved to packets.json");
  }
});

// Handle when the server closes the connection
client.on("end", () => {
  console.log("Connection closed by server.");
  rl.close();
});

// Connect to the server and prompt user for input
client.connect(PORT, "localhost", () => {
  console.log("Connected to server!");

  // Ask the user which call type they want to use
  rl.question("Enter 1 for 'Stream All Packets' or 2 for 'Resend Packet': ", (callTypeInput) => {
    const callType = parseInt(callTypeInput, 10);

    if (callType === 1) {
      // Call Type 1: Stream All Packets
      const requestPayload = Buffer.from([callType, 0]); // resendSeq is 0 for Call Type 1
      client.write(requestPayload);
    } else if (callType === 2) {
      // Call Type 2: Resend Packet
      rl.question("Enter the sequence number (resendSeq) to resend: ", (resendSeqInput) => {
        const resendSeq = parseInt(resendSeqInput, 10);

        // Check if the packet is already present in packets.json
        if (isPacketInFile(resendSeq)) {
          console.log(`Packet with sequence ${resendSeq} is already present in packets.json.`);
          client.destroy(); // Close connection since we don't need to request anything
        } else {
          const requestPayload = Buffer.from([callType, resendSeq]); // Send callType 2 and resendSeq
          client.write(requestPayload);
        }
      });
    } else {
      console.log("Invalid call type.");
      client.destroy(); // Close connection if invalid input
    }
  });
});

// Handle errors
client.on("error", (err) => {
  console.error("Connection error:", err);
  rl.close();
});
