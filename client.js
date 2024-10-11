const net = require("net");
const readline = require("readline");

const client = new net.Socket();
const PORT = 3000;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Connect to the server
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
        const requestPayload = Buffer.from([callType, resendSeq]); // Send callType 2 and resendSeq
        client.write(requestPayload);
      });
    } else {
      console.log("Invalid call type.");
      client.destroy();
    }
  });
});

// Function to decode the received data
function decodePacket(packetBuffer) {
  let offset = 0;

  // Extract Symbol (4 bytes, ASCII string)
  const symbol = packetBuffer.toString("ascii", offset, offset + 4);
  offset += 4;

  // Extract Buy/Sell Indicator (1 byte, ASCII string)
  const buySellIndicator = packetBuffer.toString("ascii", offset, offset + 1);
  offset += 1;

  // Extract Quantity (4 bytes, int32 in Big Endian)
  const quantity = packetBuffer.readInt32BE(offset);
  offset += 4;

  // Extract Price (4 bytes, int32 in Big Endian)
  const price = packetBuffer.readInt32BE(offset);
  offset += 4;

  // Extract Packet Sequence (4 bytes, int32 in Big Endian)
  const packetSequence = packetBuffer.readInt32BE(offset);
  offset += 4;

  // Return the decoded packet
  return {
    symbol,
    buySellIndicator,
    quantity,
    price,
    packetSequence,
  };
}

// Handle data received from server
client.on("data", (data) => {
  console.log("Received raw data:", data);

  // Assuming each packet is 17 bytes (4 + 1 + 4 + 4 + 4)
  const packetSize = 17;

  // Process each packet individually
  for (let i = 0; i < data.length; i += packetSize) {
    const packetBuffer = data.slice(i, i + packetSize);

    // Decode the packet
    const decodedPacket = decodePacket(packetBuffer);

    // Display the decoded packet
    console.log("Decoded Packet:", decodedPacket);
  }

  rl.close(); // Close the readline interface
  client.destroy(); // Close the connection after receiving data
});

// Handle connection close
client.on("close", () => {
  console.log("Connection closed");
});

// Handle error events
client.on("error", (err) => {
  console.error("Error occurred:", err);
});
