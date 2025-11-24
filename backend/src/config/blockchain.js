const { ethers } = require("ethers");
require("dotenv").config();

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ABI = require("./contractABI.json"); // file ABI bạn copy từ smart-contract

// 👉 Tạo provider kết nối Hardhat local node
const provider = new ethers.JsonRpcProvider(RPC_URL);

// 👉 Tạo ví để ký giao dịch (từ private key local)
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 👉 Tạo đối tượng contract để thao tác
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

console.log("✅ Connected to local blockchain:", RPC_URL);
console.log("🔑 Using account:", wallet.address);
console.log("📦 Contract address:", CONTRACT_ADDRESS);

module.exports = { provider, wallet, contract };
