const server = require("./services/exchangeServer");

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`TCP server started on port ${PORT}.`);
});
