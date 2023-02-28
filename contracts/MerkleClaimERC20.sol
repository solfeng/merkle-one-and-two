// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

/// ============ Imports ============

import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; // Solmate: ERC20
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MerkleClaimERC20
/// @notice ERC20 claimable by members of a merkle tree
/// @author Anish Agnihotri <contact@anishagnihotri.com>
/// @dev Solmate ERC20 includes unused _burn logic that can be removed to optimize deployment cost
contract MerkleClaimERC20 is ERC20, Ownable {
    /// ============ Immutable storage ============

    /// @notice ERC20-claimee inclusion root
    bytes32 public immutable merkleRoot;
    uint256 public isNumber;

    bool public whiteMinted;
    bool public minted;
    /// ============ Mutable storage ============

    /// @notice Mapping of addresses who have claimed tokens
    mapping(address => bool) public hasClaimed;
    mapping(address => bool) public hasFreeClaimed;
    // mapping(address => bool) public hasMint;
    address[] firstComeFirstServed;
    /// ============ Errors ============

    /// @notice Thrown if address has already claimed
    error AlreadyClaimed();
    /// @notice Thrown if address/amount are not part of Merkle tree
    error NotInMerkle();

    /// ============ Constructor ============

    /// @notice Creates a new MerkleClaimERC20 contract
    /// @param _name of token
    /// @param _symbol of token
    //   / @param _decimals of token
    /// @param _merkleRoot of claimees
    constructor(
        string memory _name,
        string memory _symbol,
        bytes32 _merkleRoot
    ) ERC20(_name, _symbol) {
        whiteMinted = true;
        minted = true;
        merkleRoot = _merkleRoot; // Update root
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

    /// ============ Events ============

    /// @notice Emitted after a successful token claim
    /// @param to recipient of claim
    /// @param amount of tokens claimed
    event Claim(address indexed to, uint256 amount);
    event HasMint(address indexed to, uint256 amount);
    event FreeClaim(address indexed to, uint256 amount);

    /// ============ Functions ============

    /// @notice Allows claiming tokens if address is part of merkle tree
    /// @param to address of claimee
    /// @param amount of tokens owed to claimee
    /// @param proof merkle proof to prove address and amount are in tree
    function claim(
        address to,
        uint256 amount,
        bytes32[] calldata proof
    ) external onlyWhiteMinted {
        // Throw if address has already claimed tokens
        require(
            hasClaimed[to] != true,
            "Free Claim merkle tree , you have received"
        );

        // Verify merkle proof, or revert if not in tree
        // bytes32 leaf = keccak256(abi.encodePacked(to, amount));
        bytes32 leaf = keccak256(abi.encodePacked(to));
        bool isValidLeaf = MerkleProof.verify(proof, merkleRoot, leaf);
        if (!isValidLeaf) revert NotInMerkle();

        // Set address to claimed
        hasClaimed[to] = true;
        // Mint tokens to address
        _mint(to, amount);

        // Emit claim event
        emit Claim(to, amount);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        // require(hasMint[to] != true, " address is has mint ");
        _mint(to, amount);
        // hasMint[to] = true;
        emit HasMint(to, amount);
    }

    function freeMintTable(address to, uint256 amount) external onlyFreeMint {
        require(
            firstComeFirstServed.length < isNumber,
            "Free Claim freeMintTable  Over, you have received"
        );
        require(hasFreeClaimed[to] != true, "freeMintTable, you have received");
        _mint(to, amount);
        hasFreeClaimed[to] = true;
        firstComeFirstServed.push(to);
        emit FreeClaim(to, amount);
    }

    function ishasFreeClaimed(address _address) public view returns (bool) {
        return hasFreeClaimed[_address];
    }

    function getVerifyWhite(address whiteAddress) public view returns (bool) {
        return hasClaimed[whiteAddress];
    }

    function UpdateVerifyWhite(address whiteAddress) public {
        hasClaimed[whiteAddress] = false;
    }

    function setNumber(uint256 number) public {
        isNumber = number;
    }

    function getfirstComeFirstServedLength() public view returns (uint256) {
        return firstComeFirstServed.length;
    }
}
