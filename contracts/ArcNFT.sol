// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcNFT
 * @notice Free-mint ERC-721 NFT collection on ARC Testnet.
 *         4 NFT types, each with unique metadata. Anyone can mint.
 *         Max 1 of each type per address. No mint fee.
 */
contract ArcNFT {
    string public name = "ArcVault Collection";
    string public symbol = "ARCNFT";

    uint256 public totalSupply;

    // NFT type metadata
    struct NFTType {
        string name;
        string description;
        string image; // SVG data URI
        uint256 mintCount;
        uint256 maxSupply;
    }

    // 4 NFT types (0-3)
    mapping(uint256 => NFTType) public nftTypes;
    uint256 public constant NUM_TYPES = 4;

    // Token data
    mapping(uint256 => address) public ownerOf;
    mapping(uint256 => uint256) public tokenType; // tokenId => typeId
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;

    // Track mints per type per address
    mapping(address => mapping(uint256 => bool)) public hasMinted;

    // Token URI storage
    mapping(uint256 => string) private _tokenURIs;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event Minted(address indexed minter, uint256 indexed tokenId, uint256 indexed typeId, uint256 timestamp);

    constructor() {
        nftTypes[0] = NFTType("ARC Genesis Pass", "Founding member access to ARC DeFi ecosystem.", "", 0, 10000);
        nftTypes[1] = NFTType("Stablecoin Pioneer", "Early USDC/EURC liquidity provider badge.", "", 0, 5000);
        nftTypes[2] = NFTType("AI Agent License", "ERC-8183 certified autonomous agent NFT.", "", 0, 2500);
        nftTypes[3] = NFTType("Vault Guardian", "Top-tier governance & yield multiplier token.", "", 0, 1000);
    }

    /// @notice Mint an NFT of the given type (free, max 1 per type per address)
    function mint(uint256 typeId) external {
        require(typeId < NUM_TYPES, "Invalid type");
        require(!hasMinted[msg.sender][typeId], "Already minted this type");
        require(nftTypes[typeId].mintCount < nftTypes[typeId].maxSupply, "Max supply reached");

        uint256 tokenId = totalSupply;
        totalSupply++;
        nftTypes[typeId].mintCount++;

        ownerOf[tokenId] = msg.sender;
        tokenType[tokenId] = typeId;
        balanceOf[msg.sender]++;
        hasMinted[msg.sender][typeId] = true;

        // Generate on-chain SVG metadata
        _tokenURIs[tokenId] = _buildTokenURI(typeId, tokenId);

        emit Transfer(address(0), msg.sender, tokenId);
        emit Minted(msg.sender, tokenId, typeId, block.timestamp);
    }

    /// @notice Check if an address can mint a specific type
    function canMint(address user, uint256 typeId) external view returns (bool) {
        if (typeId >= NUM_TYPES) return false;
        if (hasMinted[user][typeId]) return false;
        if (nftTypes[typeId].mintCount >= nftTypes[typeId].maxSupply) return false;
        return true;
    }

    /// @notice Get mint count and max supply for a type
    function getTypeInfo(uint256 typeId) external view returns (
        string memory typeName,
        string memory description,
        uint256 mintCount,
        uint256 maxSupply
    ) {
        require(typeId < NUM_TYPES, "Invalid type");
        NFTType memory t = nftTypes[typeId];
        return (t.name, t.description, t.mintCount, t.maxSupply);
    }

    /// @notice Get all tokens owned by an address
    function tokensOfOwner(address user) external view returns (uint256[] memory) {
        uint256 count = balanceOf[user];
        uint256[] memory tokens = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < totalSupply && idx < count; i++) {
            if (ownerOf[i] == user) {
                tokens[idx] = i;
                idx++;
            }
        }
        return tokens;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }

    // --- ERC-721 Standard Functions ---

    function transferFrom(address from, address to, uint256 tokenId) external {
        require(ownerOf[tokenId] == from, "Not owner");
        require(to != address(0), "Zero address");
        require(
            msg.sender == from || 
            msg.sender == getApproved[tokenId] || 
            isApprovedForAll[from][msg.sender],
            "Not authorized"
        );

        delete getApproved[tokenId];
        balanceOf[from]--;
        balanceOf[to]++;
        ownerOf[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function approve(address to, uint256 tokenId) external {
        address tokenOwner = ownerOf[tokenId];
        require(msg.sender == tokenOwner || isApprovedForAll[tokenOwner][msg.sender], "Not authorized");
        getApproved[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    // --- Internal ---

    function _buildTokenURI(uint256 typeId, uint256 tokenId) internal view returns (string memory) {
        NFTType memory t = nftTypes[typeId];
        // Return simple JSON metadata (on-chain)
        return string(abi.encodePacked(
            '{"name":"', t.name, ' #', _toString(tokenId),
            '","description":"', t.description,
            '","attributes":[{"trait_type":"Type","value":"', t.name,
            '"},{"trait_type":"Type ID","value":"', _toString(typeId),
            '"},{"trait_type":"Edition","value":"', _toString(t.mintCount),
            '"}]}'
        ));
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
