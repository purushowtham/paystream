// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/PayPerSecond.sol";

contract PayPerSecondTest is Test {
    PayPerSecond public payStream;

    address public user = address(0x111);
    address public creator = address(0x222);
    address public executor = address(0x333);

    function setUp() public {
        payStream = new PayPerSecond();
        vm.deal(user, 10 ether);
        vm.deal(executor, 1 ether);
    }

    function test_DepositAndWithdraw() public {
        vm.startPrank(user);
        payStream.deposit{value: 2 ether}();
        assertEq(payStream.balances(user), 2 ether);

        payStream.withdraw(1 ether);
        assertEq(payStream.balances(user), 1 ether);
        assertEq(user.balance, 9 ether);
        vm.stopPrank();
    }

    function test_CreateSessionAndPaySecond() public {
        uint256 pricePerSecond = 0.001 ether;
        uint256 maxSpend = 0.05 ether;
        uint256 duration = 3600;

        vm.startPrank(user);
        bytes32 sessionId = payStream.createSession{value: 1 ether}(
            creator,
            101, // videoId
            pricePerSecond,
            maxSpend,
            duration,
            executor
        );
        vm.stopPrank();

        assertEq(payStream.balances(user), 1 ether);

        // Execute payment as executor
        vm.startPrank(executor);
        uint256 initialCreatorBal = creator.balance;

        payStream.paySecond(sessionId);

        assertEq(creator.balance - initialCreatorBal, pricePerSecond);
        assertEq(payStream.balances(user), 1 ether - pricePerSecond);
        assertEq(payStream.creatorEarnings(creator), pricePerSecond);

        PayPerSecond.WatchSession memory session = payStream.getSession(sessionId);
        assertEq(session.secondsPaid, 1);
        assertEq(session.totalSpent, pricePerSecond);
        vm.stopPrank();
    }

    function test_RevertWhenInsufficientBalance() public {
        uint256 pricePerSecond = 0.1 ether;
        uint256 maxSpend = 1 ether;

        vm.startPrank(user);
        bytes32 sessionId = payStream.createSession{value: 0.15 ether}(
            creator,
            102,
            pricePerSecond,
            maxSpend,
            3600,
            executor
        );
        vm.stopPrank();

        vm.startPrank(executor);
        // First paySecond succeeds (0.15 - 0.1 = 0.05 remaining)
        payStream.paySecond(sessionId);

        // Second paySecond fails due to insufficient vault balance (0.05 < 0.1)
        vm.expectRevert("Insufficient user vault balance");
        payStream.paySecond(sessionId);
        vm.stopPrank();
    }

    function test_RevertWhenMaxSpendReached() public {
        uint256 pricePerSecond = 0.01 ether;
        uint256 maxSpend = 0.02 ether; // Allows exactly 2 payments

        vm.startPrank(user);
        bytes32 sessionId = payStream.createSession{value: 1 ether}(
            creator,
            103,
            pricePerSecond,
            maxSpend,
            3600,
            executor
        );
        vm.stopPrank();

        vm.startPrank(executor);
        payStream.paySecond(sessionId); // 1st payment
        payStream.paySecond(sessionId); // 2nd payment

        // 3rd payment exceeds maxSpend
        vm.expectRevert("Max spend reached");
        payStream.paySecond(sessionId);
        vm.stopPrank();
    }

    function test_RevertWhenExpired() public {
        uint256 pricePerSecond = 0.001 ether;
        uint256 duration = 100;

        vm.startPrank(user);
        bytes32 sessionId = payStream.createSession{value: 1 ether}(
            creator,
            104,
            pricePerSecond,
            1 ether,
            duration,
            executor
        );
        vm.stopPrank();

        // Warp time beyond expiry
        vm.warp(block.timestamp + 101);

        vm.startPrank(executor);
        vm.expectRevert("Session expired");
        payStream.paySecond(sessionId);
        vm.stopPrank();
    }

    function test_RevertUnauthorizedExecutor() public {
        vm.startPrank(user);
        bytes32 sessionId = payStream.createSession{value: 1 ether}(
            creator,
            105,
            0.001 ether,
            1 ether,
            3600,
            executor
        );
        vm.stopPrank();

        address rando = address(0x999);
        vm.startPrank(rando);
        vm.expectRevert("Unauthorized executor");
        payStream.paySecond(sessionId);
        vm.stopPrank();
    }
}
