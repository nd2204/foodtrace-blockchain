// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FoodTrace {
    struct Batch {
        string hash;
        uint256 timestamp;
    }

    mapping(uint256 => Batch) public batches;
    event BatchStored(uint256 batchId, string hash, uint256 timestamp);

    function storeBatchHash(uint256 batchId, string calldata hash) external {
        batches[batchId] = Batch(hash, block.timestamp);
        emit BatchStored(batchId, hash, block.timestamp);
    }

    function getBatchHash(uint256 batchId) external view returns (string memory, uint256) {
        Batch memory b = batches[batchId];
        return (b.hash, b.timestamp);
    }
}
