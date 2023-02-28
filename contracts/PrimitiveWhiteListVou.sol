// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract PrimitiveWhiteListVou is ERC721Enumerable, Ownable {
    using ECDSA for bytes32;

    uint256 public constant MINT_PRICE = 0.1 ether;
    bytes32 private _whitelistMerkleRoot;
    mapping(string => bool) public WhiteListClaimedVou;

    constructor() ERC721("Merkle Tree Whitelist", "MTW") {}

    function whitelistSaleAll(
        string calldata to,
        bytes32[] memory proof,
        uint256 amount
    ) external payable {
        // merkle tree list related
        require(_whitelistMerkleRoot != "", "Free Claim merkle tree not set");
        require(
            WhiteListClaimedVou[to] != true,
            "Free Claim merkle tree , you have received"
        );
        require(
            MerkleProof.verify(
                proof,
                _whitelistMerkleRoot,
                keccak256(abi.encodePacked(to, amount))
            ),
            "Free Claim validation failed"
        );

        // start minting
        // uint256 currentSupply = totalSupply();
        //casting all
        // for (uint256 i = 1; i <= amount; i++) {
        //     _safeMint(to, currentSupply + i);
        // }
        WhiteListClaimedVou[to] = true;
    }

    function setWhitelistMerkleRoot(bytes32 newMerkleRoot_) external onlyOwner {
        _whitelistMerkleRoot = newMerkleRoot_;
    }

    function getMerkleRoot() external view returns (bytes32) {
        return _whitelistMerkleRoot;
    }
}
