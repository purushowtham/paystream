// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/PayPerSecond.sol";

contract DeployScript is Script {
    function run() external returns (PayPerSecond) {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        
        vm.startBroadcast(deployerPrivateKey);
        PayPerSecond payStream = new PayPerSecond();
        vm.stopBroadcast();

        console.log("PayPerSecond contract deployed at:", address(payStream));
        return payStream;
    }
}
