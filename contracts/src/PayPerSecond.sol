// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PayPerSecond
 * @dev Streaming micro-payments for long-form video playback on Monad.
 * 1 second of playback = 1 on-chain payment transaction from user's vault to video creator.
 */
contract PayPerSecond {

    struct WatchSession {
        address user;
        address creator;
        uint256 videoId;
        uint256 pricePerSecond;
        uint256 maxSpend;
        uint256 secondsPaid;
        uint256 totalSpent;
        uint256 expiry;
        address executor;
        bool active;
    }

    // User vault balances (funded MON for pay-per-second streaming)
    mapping(address => uint256) public balances;
    
    // User nonce for unique session IDs
    mapping(address => uint256) public userNonces;

    // Active watch sessions mapped by ID
    mapping(bytes32 => WatchSession) public sessions;

    // Total creator earnings accumulated on-chain
    mapping(address => uint256) public creatorEarnings;

    // Events
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event SessionCreated(
        bytes32 indexed sessionId,
        address indexed user,
        address indexed creator,
        uint256 videoId,
        uint256 pricePerSecond,
        uint256 maxSpend,
        uint256 expiry,
        address executor
    );
    event SessionClosed(bytes32 indexed sessionId);
    event SecondPaid(
        bytes32 indexed sessionId,
        address indexed user,
        address indexed creator,
        uint256 videoId,
        uint256 second,
        uint256 amount
    );

    // Fallback & receive
    receive() external payable {
        deposit();
    }

    /**
     * @dev Deposit MON into user's streaming vault account.
     */
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be > 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw MON from user's streaming vault account.
     */
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient vault balance");
        balances[msg.sender] -= amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw transfer failed");
        emit Withdraw(msg.sender, amount);
    }

    /**
     * @dev Authorize a pay-per-second watch session for a video.
     * @param creator Wallet address of the content creator.
     * @param videoId ID of the video being watched.
     * @param pricePerSecond Price per second in wei (MON).
     * @param maxSpend Maximum total MON authorized for this session.
     * @param duration Session duration in seconds.
     * @param executor Optional authorized session key / executor address.
     */
    function createSession(
        address creator,
        uint256 videoId,
        uint256 pricePerSecond,
        uint256 maxSpend,
        uint256 duration,
        address executor
    ) external payable returns (bytes32 sessionId) {
        require(creator != address(0), "Invalid creator address");
        require(pricePerSecond > 0, "Price per second must be > 0");
        require(maxSpend >= pricePerSecond, "Max spend must be >= pricePerSecond");
        require(duration > 0, "Duration must be > 0");

        if (msg.value > 0) {
            balances[msg.sender] += msg.value;
            emit Deposit(msg.sender, msg.value);
        }

        require(balances[msg.sender] >= pricePerSecond, "Insufficient initial vault balance");

        address execAddr = executor == address(0) ? msg.sender : executor;
        uint256 nonce = userNonces[msg.sender]++;
        sessionId = keccak256(abi.encodePacked(msg.sender, creator, videoId, block.timestamp, nonce));

        sessions[sessionId] = WatchSession({
            user: msg.sender,
            creator: creator,
            videoId: videoId,
            pricePerSecond: pricePerSecond,
            maxSpend: maxSpend,
            secondsPaid: 0,
            totalSpent: 0,
            expiry: block.timestamp + duration,
            executor: execAddr,
            active: true
        });

        emit SessionCreated(
            sessionId,
            msg.sender,
            creator,
            videoId,
            pricePerSecond,
            maxSpend,
            block.timestamp + duration,
            execAddr
        );
    }

    /**
     * @dev Execute payment for 1 second of actual playback.
     * Called by the user or their authorized session executor.
     */
    function paySecond(bytes32 sessionId) external {
        WatchSession storage s = sessions[sessionId];
        require(s.active, "Session inactive");
        require(block.timestamp <= s.expiry, "Session expired");
        require(msg.sender == s.user || msg.sender == s.executor, "Unauthorized executor");
        require(s.totalSpent + s.pricePerSecond <= s.maxSpend, "Max spend reached");
        require(balances[s.user] >= s.pricePerSecond, "Insufficient user vault balance");

        // Deduct vault balance & update accounting
        balances[s.user] -= s.pricePerSecond;
        s.secondsPaid += 1;
        s.totalSpent += s.pricePerSecond;
        creatorEarnings[s.creator] += s.pricePerSecond;

        // Direct MON transfer to creator
        (bool success, ) = payable(s.creator).call{value: s.pricePerSecond}("");
        require(success, "Transfer to creator failed");

        emit SecondPaid(
            sessionId,
            s.user,
            s.creator,
            s.videoId,
            s.secondsPaid,
            s.pricePerSecond
        );
    }

    /**
     * @dev Close an active watch session manually.
     */
    function closeSession(bytes32 sessionId) external {
        WatchSession storage s = sessions[sessionId];
        require(msg.sender == s.user || msg.sender == s.executor, "Not authorized to close");
        require(s.active, "Session already inactive");
        s.active = false;
        emit SessionClosed(sessionId);
    }

    /**
     * @dev Helper view function to check if a session is valid and payable.
     */
    function isSessionPayable(bytes32 sessionId) external view returns (bool payableStatus, string memory reason) {
        WatchSession memory s = sessions[sessionId];
        if (!s.active) return (false, "Session inactive");
        if (block.timestamp > s.expiry) return (false, "Session expired");
        if (s.totalSpent + s.pricePerSecond > s.maxSpend) return (false, "Max spend reached");
        if (balances[s.user] < s.pricePerSecond) return (false, "Insufficient vault balance");
        return (true, "OK");
    }

    /**
     * @dev View function to get session details.
     */
    function getSession(bytes32 sessionId) external view returns (WatchSession memory) {
        return sessions[sessionId];
    }
}
