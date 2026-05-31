// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ArcSwap
 * @notice Simple fixed-rate swap between USDC and EURC on ARC Testnet.
 *         Rate: 1 USDC = 0.92 EURC | 1 EURC = 1.087 USDC
 *         Owner must seed both token reserves for swaps to work.
 *         For testnet demo purposes only.
 */
contract ArcSwap {
    IERC20 public immutable usdc;
    IERC20 public immutable eurc;
    address public owner;

    // Fixed rate scaled by 1e6 (0.92 = 920000, 1.087 = 1087000)
    uint256 public constant USDC_TO_EURC_RATE = 920000;
    uint256 public constant EURC_TO_USDC_RATE = 1087000;
    uint256 public constant RATE_DECIMALS = 1e6;

    // Fee: 0.1% (10 basis points)
    uint256 public constant FEE_BPS = 10;
    uint256 public constant BPS_DENOMINATOR = 10000;

    event Swapped(
        address indexed user,
        address indexed fromToken,
        address indexed toToken,
        uint256 amountIn,
        uint256 amountOut,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _usdc, address _eurc) {
        usdc = IERC20(_usdc);
        eurc = IERC20(_eurc);
        owner = msg.sender;
    }

    /// @notice Swap USDC for EURC
    function swapUSDCtoEURC(uint256 amountIn) external {
        require(amountIn > 0, "Zero amount");

        uint256 amountOut = (amountIn * USDC_TO_EURC_RATE) / RATE_DECIMALS;
        uint256 fee = (amountOut * FEE_BPS) / BPS_DENOMINATOR;
        uint256 amountReceived = amountOut - fee;

        require(eurc.balanceOf(address(this)) >= amountReceived, "Insufficient EURC liquidity");

        usdc.transferFrom(msg.sender, address(this), amountIn);
        eurc.transfer(msg.sender, amountReceived);

        emit Swapped(msg.sender, address(usdc), address(eurc), amountIn, amountReceived, block.timestamp);
    }

    /// @notice Swap EURC for USDC
    function swapEURCtoUSDC(uint256 amountIn) external {
        require(amountIn > 0, "Zero amount");

        uint256 amountOut = (amountIn * EURC_TO_USDC_RATE) / RATE_DECIMALS;
        uint256 fee = (amountOut * FEE_BPS) / BPS_DENOMINATOR;
        uint256 amountReceived = amountOut - fee;

        require(usdc.balanceOf(address(this)) >= amountReceived, "Insufficient USDC liquidity");

        eurc.transferFrom(msg.sender, address(this), amountIn);
        usdc.transfer(msg.sender, amountReceived);

        emit Swapped(msg.sender, address(eurc), address(usdc), amountIn, amountReceived, block.timestamp);
    }

    /// @notice Get expected output for a swap
    function getAmountOut(bool isUSDCtoEURC, uint256 amountIn) external pure returns (uint256 amountOut, uint256 fee) {
        uint256 rate = isUSDCtoEURC ? USDC_TO_EURC_RATE : EURC_TO_USDC_RATE;
        uint256 gross = (amountIn * rate) / RATE_DECIMALS;
        fee = (gross * FEE_BPS) / BPS_DENOMINATOR;
        amountOut = gross - fee;
    }

    /// @notice Owner can withdraw reserves
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }

    /// @notice View pool reserves
    function reserves() external view returns (uint256 usdcReserve, uint256 eurcReserve) {
        usdcReserve = usdc.balanceOf(address(this));
        eurcReserve = eurc.balanceOf(address(this));
    }
}
