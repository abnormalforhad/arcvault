// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
    function name() external view returns (string memory);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title ArcVault
 * @notice Simple USDC staking vault on ARC Testnet
 * @dev Users deposit USDC via approve+transferFrom pattern.
 *      Tracks individual balances and total deposits.
 *      Emits events for frontend consumption.
 */
contract ArcVault {
    // --- State ---
    IERC20 public immutable usdc;
    address public owner;
    uint256 public totalDeposits;
    
    mapping(address => uint256) public balances;
    mapping(address => DepositRecord[]) public depositHistory;
    
    struct DepositRecord {
        uint256 amount;
        uint256 timestamp;
        bool isDeposit; // true = deposit, false = withdrawal
    }

    // --- Events ---
    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 timestamp);

    // --- Errors ---
    error ZeroAmount();
    error InsufficientBalance();
    error TransferFailed();

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
    }

    /**
     * @notice Deposit USDC into the vault
     * @param amount Amount of USDC to deposit (6 decimals)
     */
    function deposit(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        
        bool success = usdc.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        
        balances[msg.sender] += amount;
        totalDeposits += amount;
        
        depositHistory[msg.sender].push(DepositRecord({
            amount: amount,
            timestamp: block.timestamp,
            isDeposit: true
        }));
        
        emit Deposited(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Withdraw USDC from the vault
     * @param amount Amount of USDC to withdraw (6 decimals)
     */
    function withdraw(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        if (balances[msg.sender] < amount) revert InsufficientBalance();
        
        balances[msg.sender] -= amount;
        totalDeposits -= amount;
        
        bool success = usdc.transfer(msg.sender, amount);
        if (!success) revert TransferFailed();
        
        depositHistory[msg.sender].push(DepositRecord({
            amount: amount,
            timestamp: block.timestamp,
            isDeposit: false
        }));
        
        emit Withdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Get user's vault balance
     */
    function balanceOf(address user) external view returns (uint256) {
        return balances[user];
    }

    /**
     * @notice Get number of deposit/withdrawal records for user
     */
    function getHistoryCount(address user) external view returns (uint256) {
        return depositHistory[user].length;
    }

    /**
     * @notice Get a specific deposit record
     */
    function getHistoryRecord(address user, uint256 index) external view returns (
        uint256 amount,
        uint256 timestamp,
        bool isDeposit
    ) {
        DepositRecord memory record = depositHistory[user][index];
        return (record.amount, record.timestamp, record.isDeposit);
    }
}
