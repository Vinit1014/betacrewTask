const PACKET_CONTENTS = [
    { name: "symbol", type: "ascii", size: 4 },
    { name: "buysellindicator", type: "ascii", size: 1 },
    { name: "quantity", type: "int32", size: 4 },
    { name: "price", type: "int32", size: 4 },
    { name: "packetSequence", type: "int32", size: 4 },
  ];
  
  const PACKET_SIZE = PACKET_CONTENTS.reduce((acc, field) => acc + field.size, 0);
  
  const createPayloadToSend = (packetData) => {
    let offset = 0;
    const buffer = Buffer.alloc(PACKET_SIZE);
  
    PACKET_CONTENTS.forEach((field) => {
      const { name, type, size } = field;
      if (type === "int32") {
        buffer.writeInt32BE(packetData[name], offset);
      } else if (type === "ascii") {
        buffer.write(packetData[name], offset, size, "ascii");
      }
      offset += size;
    });
  
    return buffer;
  };
  
  module.exports = {
    createPayloadToSend,
  };
  