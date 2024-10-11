Here's a step-by-step explanation for running the BetaCrew exchange app:

---

### **How to Run the BetaCrew Exchange Server Application**

#### **Prerequisites**

1. **Node.js**: Ensure you have Node.js installed. You can download it from [here](https://nodejs.org/).
2. **Git**: Ensure Git is installed on your system. You can download it from [here](https://git-scm.com/).
3. **Clone the Repository**: Use the following command to clone the repository:
   ```bash
   git clone betacrewTask
   ```
#### **Steps to Run the App**

1. **Install Dependencies**:
   After cloning the repository, navigate to the project directory and install the necessary dependencies:
   ```bash
   cd betacrew_exchange_server
   npm install
   ```

2. **Start the TCP Server**:
   The server needs to be running in a separate terminal window. To start the server:
   ```bash
   node src/server.js
   ```
   This will start the TCP server on port `3000`. You should see:
   ```bash
   TCP server started on port 3000.
   ```

3. **Run the Client Application**:
   Open a new terminal window to run the client:
   ```bash
   node client.js
   ```
   When you run this command, the client will connect to the server. You'll be prompted to choose between the two options:
   
   - **Option 1**: Stream all packets
   - **Option 2**: Request a specific packet to be resent

4. **Select the Desired Call Type**:
   After running the client, you’ll see the following prompt:
   ```bash
   Enter 1 for 'Stream All Packets' or 2 for 'Resend Packet':
   ```
   Choose the call type:
   - Enter `1` to stream all available packets.
   - Enter `2` to request a specific packet. You’ll be asked for the `resendSeq` (sequence number of the packet).

5. **Handle Duplicate Packets**:
   If you request a packet with **Call Type 2** and it already exists in `packets.json`, the client will respond with:
   ```bash
   Packet already present in packets.json
   ```
   Otherwise, it will fetch the packet from the server and update `packets.json` with the new packet.

6. **Check the Output**:
   - After streaming packets (Option 1) or receiving a specific packet (Option 2), the client will save all data in a file named `packets.json`. Each packet will be stored as an object with its respective sequence number, ensuring no missing sequences.
   - The JSON file can be found in the root of the project.

7. **Error Handling**:
   In case of any server or connection error, the terminal will display appropriate error messages. Ensure the server is running before starting the client.

---
