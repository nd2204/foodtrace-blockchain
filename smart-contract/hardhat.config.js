require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: __dirname + "/../backend/.env" });

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
