async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying with account:", deployer.address);

  const FoodTrace = await ethers.getContractFactory("FoodTrace");
  const contract = await FoodTrace.deploy();

  // 👇 Đây là dòng mới, thay cho contract.deployed()
  await contract.waitForDeployment();

  console.log("✅ Contract deployed to:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error deploying contract:", error);
    process.exit(1);
  });
