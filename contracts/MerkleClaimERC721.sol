// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract merkle is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    bytes32 public immutable merkleRoot;

    string baseTokenURI;
    uint256 public maxIds = 100;

    bool public whiteMinted;
    bool public minted;
    address[] freeDistribution;

    mapping(address => bool) whiteMints;
    mapping(address => bool) hasFreeClaimed;

    constructor(bytes32 _merkleRoot) ERC721("Example NFT", "EUWNFT") {
        merkleRoot = _merkleRoot;
        whiteMinted = true;
        minted = true;
        baseTokenURI = "ipfs://Qma7CPJT5WQerSRpnhPsqCb7oBZEU25myBVhkq52YvAdPd";
    }

    function freemintOpened() public onlyOwner {
        minted = true;
    }

    function freemintClosed() public onlyOwner {
        minted = false;
    }

    function whiteOpened() public onlyOwner {
        whiteMinted = true;
    }

    function whiteClosed() public onlyOwner {
        whiteMinted = false;
    }

    modifier onlyWhiteMinted() {
        require(whiteMinted, "Contract currently paused");
        _;
    }

    modifier onlyFreeMint() {
        require(minted, "mint currently paused");
        _;
    }

    event Claim(address indexed to, uint256 amount);
    event FreeClaim(address indexed to, uint256 amount);

    /// @notice Thrown if address/amount are not part of Merkle tree
    error NotInMerkle();

    function whiteMint(address to, bytes32[] calldata proof)
        public
        payable
        onlyWhiteMinted
    {
        // 检查是否已经 mint
        require(!whiteMints[to], "you are minted");
        bytes32 leaf = keccak256(abi.encodePacked(to));
        bool isValidLeaf = MerkleProof.verify(proof, merkleRoot, leaf);
        if (!isValidLeaf) revert NotInMerkle();

        uint256 currentTokenIds = _tokenIds.current();

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Example NFT", "description": "A silent hero. A watchful protector. by wen", "image":"',
                        baseTokenURI,
                        '"}'
                    )
                )
            )
        );
        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        _safeMint(to, currentTokenIds);
        _setTokenURI(currentTokenIds, finalTokenUri);
        _tokenIds.increment();
        whiteMints[to] = true;

        emit Claim(to, currentTokenIds);
    }

    function freeMintTable(address to) external onlyFreeMint {
        require(
            freeDistribution.length < maxIds,
            "Free Claim freeMintTable  Over, you have received"
        );
        require(hasFreeClaimed[to] != true, "freeMintTable, you have received");
        uint256 currentTokenIds = _tokenIds.current();
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Example NFT", "description": "A silent hero. A watchful protector. by wen", "image":"',
                        baseTokenURI,
                        '"}'
                    )
                )
            )
        );
        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        _safeMint(to, currentTokenIds);
        _setTokenURI(currentTokenIds, finalTokenUri);
        _tokenIds.increment();
        hasFreeClaimed[to] = true;
        freeDistribution.push(to);
        emit FreeClaim(to, currentTokenIds);
    }

    //非白名单验证
    function getFreeClaimed(address _address) public view returns (bool) {
        return hasFreeClaimed[_address];
    }

    //非白名单 已经领取的人数
    function getfirstComeFirstServedLength() public view returns (uint256) {
        return freeDistribution.length;
    }

    //白名单验证
    function getVerifyWhite(address whiteAddress) public view returns (bool) {
        return whiteMints[whiteAddress];
    }
}
