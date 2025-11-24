const { provider, wallet, contract } = require("../src/config/blockchain");

(async () => {
  const network = await provider.getNetwork();
  console.log("🌐 Network:", network.name);
  console.log("🧾 Wallet:", wallet.address);

  // Ghi hash mẫu
  const tx = await contract.storeBatchHash(1, "hash-demo-123");
  console.log("🧠 Transaction sent:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Transaction mined in block:", receipt.blockNumber);

  // Đọc lại dữ liệu
  const [hash, timestamp] = await contract.getBatchHash(1);
  console.log("📦 Stored hash:", hash);
  console.log("🕒 Timestamp:", timestamp.toString());
})();
