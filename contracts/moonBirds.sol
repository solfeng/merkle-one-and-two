// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.10 <0.9.0;

import "@divergencetech/ethier/contracts/crypto/SignatureChecker.sol";
import "@divergencetech/ethier/contracts/crypto/SignerManager.sol";
import "@divergencetech/ethier/contracts/erc721/BaseTokenURI.sol";
import "@divergencetech/ethier/contracts/erc721/ERC721ACommon.sol";
import "@divergencetech/ethier/contracts/erc721/ERC721Redeemer.sol";
import "@divergencetech/ethier/contracts/sales/FixedPriceSeller.sol";
import "@divergencetech/ethier/contracts/utils/Monotonic.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

interface ITokenURIGenerator {
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

// @author divergence.xyz
contract Moonbirds is
    ERC2981,
    BaseTokenURI,
    ERC721ACommon,
    FixedPriceSeller,
    SignerManager,
    AccessControlEnumerable
  
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using ERC721Redeemer for ERC721Redeemer.Claims;
    using Monotonic for Monotonic.Increaser;
    using SignatureChecker for EnumerableSet.AddressSet;

    IERC721 public immutable proof;

    /**
    @notice Role of administrative users allowed to expel a Moonbird from the
    nest.//允许筑巢
    @dev See expelFromNest().
     */
    bytes32 public constant EXPULSION_ROLE = keccak256("EXPULSION_ROLE");

    constructor(
        string memory name,
        string memory symbol,
        IERC721 _proof,
        address payable beneficiary,
        address payable royaltyReceiver
    )
      ERC721ACommon(name, symbol,royaltyReceiver,500)
      BaseTokenURI("")
        FixedPriceSeller(
            2.5 ether,
            // Not including a separate pool for PROOF holders, taking the total
            // to 10k. We don't enforce buyer limits here because it's already
            // done by only issuing a single signature per address, and double
            // enforcement would waste gas.
            // 不包括 PROOF 持有者的单独资金池，总数达到 10k。 我们这里不强制执行买家限制，因为它已经
             // 通过只为每个地址发出一个签名来完成，然后再进行两次
             // 执行会浪费 gas。
            Seller.SellerConfig({
                totalInventory: 8_000,
                lockTotalInventory: true,
                maxPerAddress: 0,
                maxPerTx: 0,
                freeQuota: 125,
                lockFreeQuota: false,
                reserveFreeQuota: true
            }),
            beneficiary
        )
    {
        proof = _proof;
        _setDefaultRoyalty(royaltyReceiver, 500);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
    @dev Mint tokens purchased via the Seller.//通过卖方购买的铸币代币。
     */
    function _handlePurchase(address to, uint256 n, bool) internal override {
        _safeMint(to, n);

        // We're using two separate pools (one from Seller, and one for PROOF
        // minting), so add an extra layer of checks for this invariant. This
        // should never fail as each pool has its own restriction, and is in
        // place purely for tests (hence assert).
        // 我们使用两个独立的池（一个来自卖家，一个用于 PROOF
        // 铸币），因此为此不变量添加额外的检查层。 这个
        // 应该永远不会失败，因为每个池都有自己的限制，并且纯粹是为了测试（因此断言）。
        assert(totalSupply() <= 10_000);
    }

    /**
    @dev Record of already-used signatures.
    //已使用签名记录
     */
    mapping(bytes32 => bool) public usedMessages;

    /**
    @notice Mint as a non-holder of PROOF tokens.
    //Mint 作为 PROOF 代币的非持有者。
     */
    function mintPublic(
        address to,
        bytes32 nonce,
        bytes calldata sig
    ) external payable {
        signers.requireValidSignature(
            signaturePayload(to, nonce),
            sig,
            usedMessages
        );
        _purchase(to, 1);
    }

    /**
    @notice Returns whether the address has minted with the particular nonce. If
    true, future calls to mint() with the same parameters will fail.
    @dev In production we will never issue more than a single nonce per address,
    but this allows for testing with a single address.

    @notice 返回地址是否使用了特定的随机数。 如果
     是的，以后使用相同参数调用 mint() 将失败。
     @dev 在生产中，我们绝不会为每个地址发出超过一个随机数，
     但这允许用一个地址进行测试。
     */
    function alreadyMinted(
        address to,
        bytes32 nonce
    ) external view returns (bool) {
        return
            usedMessages[
                SignatureChecker.generateMessage(signaturePayload(to, nonce))
            ];
    }

    /**
    @dev Constructs the buffer that is hashed for validation with a minting
    signature.
    @dev 构造缓冲区，该缓冲区经过哈希处理以进行验证
     签名。
     */
    function signaturePayload(
        address to,
        bytes32 nonce
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(to, nonce);
    }

    /**
    @notice Two guaranteed mints per PROOF holder.
    @dev This is specifically tracked because unclaimed tokens will be minted to
    the PROOF wallet, so the pool guarantees an upper bound.
    @notice 每个 PROOF 持有者保证两个铸币厂。
     @dev 这是专门跟踪的，因为无人认领的令牌将被铸造到
     PROOF 钱包，所以矿池保证了一个上限。
      
     */
    uint256 public proofPoolRemaining = 2000;

    ERC721Redeemer.Claims private redeemedPROOF;

    /**
    @dev Used by both PROOF-holder and PROOF-admin minting from the pool.
    由 PROOF 持有者和 PROOF 管理员从池中铸造。
     */
    modifier reducePROOFPool(uint256 n) {
        require(n <= proofPoolRemaining, "Moonbirds: PROOF pool exhausted");
        proofPoolRemaining -= n;
        _;
    }

    /**
    @notice Flag indicating whether holders of PROOF passes can mint.
    指示 PROOF 通行证持有人是否可以铸币的标志。
     */
    bool public proofMintingOpen = false;

    /**
    @notice Sets whether holders of PROOF passes can mint.
    设置 PROOF 通行证的持有者是否可以铸币。
     */
    function setPROOFMintingOpen(bool open) external onlyOwner {
        proofMintingOpen = open;
    }

    /**
    @notice Mint as a holder of a PROOF token.
    @dev Repeat a PROOF token ID twice to redeem both of its claims; recurring
    values SHOULD be adjacent for improved gas (eg [1,1,2,2] not [1,2,1,2]).
    
     @notice Mint 作为 PROOF 令牌的持有者。
     @dev 重复 PROOF 令牌 ID 两次以赎回其两个声明； 再次发生的
     对于改进的gas，值应该相邻（例如 [1,1,2,2] 而不是 [1,2,1,2]）。
      
     */
    function mintPROOF(
        uint256[] calldata proofTokenIds
    ) external reducePROOFPool(proofTokenIds.length) {
        require(proofMintingOpen, "Moonbirds: PROOF minting closed");
        uint256 n = redeemedPROOF.redeem(2, msg.sender, proof, proofTokenIds);
        _handlePurchase(msg.sender, n, true);
    }

    /**
    @notice Returns how many additional Moonbirds can be claimed with the PROOF
    token.
    返回可以使用 PROOF 声明多少额外的 Moonbirds
     令牌。
     */
    function proofClaimsRemaining(
        uint256 tokenId
    ) external view returns (uint256) {
        require(tokenId < 1000, "Token doesn't exist");
        return 2 - redeemedPROOF.claimed(tokenId);
    }

    /**
    @notice Mint unclaimed tokens from the PROOF-holder pool.
    从 PROOF 持有者池中铸造无人认领的代币。
     */
    function mintUnclaimed(
        address to,
        uint256 n
    ) external onlyOwner reducePROOFPool(n) {
        _handlePurchase(to, n, true);
    }

    /**
    @dev tokenId to nesting start time (0 = not nesting).
     */
    mapping(uint256 => uint256) private nestingStarted;

    /**
    @dev Cumulative per-token nesting, excluding the current period.//累积的每个令牌嵌套，不包括当前期间。
     */
    mapping(uint256 => uint256) private nestingTotal;

    /*
    @notice Returns the length of time, in seconds, that the Moonbird has
    nested.//返回 Moonbird 拥有的时间长度（秒）
     嵌套。
    @dev Nesting is tied to a specific Moonbird, not to the owner, so it doesn't
    reset upon sale.
    @return nesting Whether the Moonbird is currently nesting. MAY be true with
    zero current nesting if in the same block as nesting began.
    @return current Zero if not currently nesting, otherwise the length of time
    since the most recent nesting began.
    @return total Total period of time for which the Moonbird has nested across
    its life, including the current period.
    @dev Nesting 与特定的 Moonbird 相关联，而不是与所有者相关联，因此它不会
     售后重置。
     @return nesting Moonbird 当前是否正在嵌套。 可能是真的
     如果在嵌套开始的同一块中，则为零电流嵌套。
     @return current 如果当前没有嵌套则为零，否则为时间长度
     自最近的嵌套开始以来。
     @return total Moonbird 嵌套的总时间
     它的生命，包括当前时期。
     */
    function nestingPeriod(
        uint256 tokenId
    ) external view returns (bool nesting, uint256 current, uint256 total) {
        uint256 start = nestingStarted[tokenId];
        if (start != 0) {
            nesting = true;
            current = block.timestamp - start;
        }
        total = current + nestingTotal[tokenId];
    }

    /**
    @dev MUST only be modified by safeTransferWhileNesting(); if set to 2 then
    the _beforeTokenTransfer() block while nesting is disabled.
    @dev 只能由 safeTransferWhileNesting() 修改； 如果设置为 2 则
     禁用嵌套时的 _beforeTokenTransfer() 块。
     */
    uint256 private nestingTransfer = 1;

    /**
    @notice Transfer a token between addresses while the Moonbird is minting,
    thus not resetting the nesting period.
    在 Moonbird 铸造时在地址之间转移代币，
     因此不重置嵌套期
     */
    function safeTransferWhileNesting(
        address from,
        address to,
        uint256 tokenId
    ) external {
        require(ownerOf(tokenId) == _msgSender(), "Moonbirds: Only owner");
        nestingTransfer = 2;
        safeTransferFrom(from, to, tokenId);
        nestingTransfer = 1;
    }

    /**
    @dev Block transfers while nesting.
    嵌套时块传输
     */
    function _beforeTokenTransfers(
        address,
        address,
        uint256 startTokenId,
        uint256 quantity
    ) internal view override {
        uint256 tokenId = startTokenId;
        for (uint256 end = tokenId + quantity; tokenId < end; ++tokenId) {
            require(
                nestingStarted[tokenId] == 0 || nestingTransfer == 2,
                "Moonbirds: nesting"
            );
        }
    }

    /**
    @dev Emitted when a Moonbird begins nesting.
    Moonbird开始nesting时事件。
     */
    event Nested(uint256 indexed tokenId);

    /**
    @dev Emitted when a Moonbird stops nesting; either through standard means or
    by expulsion.
     Moonbird 停止nesting时事件； 通过标准方式或
     通过驱逐
     */
    event Unnested(uint256 indexed tokenId);

    /**
    @dev Emitted when a Moonbird is expelled from the nest.
    当Moonbird被没有nest
     */
    event Expelled(uint256 indexed tokenId);

    /**
    @notice Whether nesting is currently allowed.
    @dev If false then nesting is blocked, but unnesting is always allowed.
    @notice 当前是否允许嵌套。
     @dev 如果 false 则嵌套被阻止，但总是允许取消嵌套。
      
     */
    bool public nestingOpen = false;

    /**
    @notice Toggles the `nestingOpen` flag.
     */
    function setNestingOpen(bool open) external onlyOwner {
        nestingOpen = open;
    }

    /**
    @notice Changes the Moonbird's nesting status.
    更改 Moonbird 的筑巢状态。
    
    */
    function toggleNesting(
        uint256 tokenId
    ) internal onlyApprovedOrOwner(tokenId) {
        uint256 start = nestingStarted[tokenId];
        if (start == 0) {
            require(nestingOpen, "Moonbirds: nesting closed");
            nestingStarted[tokenId] = block.timestamp;
            emit Nested(tokenId);
        } else {
            nestingTotal[tokenId] += block.timestamp - start;
            nestingStarted[tokenId] = 0;
            emit Unnested(tokenId);
        }
    }

    /**
    @notice Changes the Moonbirds' nesting statuss (what's the plural of status?
    statii? statuses? status? The plural of sheep is sheep; maybe it's also the
    plural of status).
    @dev Changes the Moonbirds' nesting sheep (see @notice).
    //批量改变 Moonbird 的筑巢状态
     */
    function toggleNesting(uint256[] calldata tokenIds) external {
        uint256 n = tokenIds.length;
        for (uint256 i = 0; i < n; ++i) {
            toggleNesting(tokenIds[i]);
        }
    }

    /**
    @notice Admin-only ability to expel a Moonbird from the nest.
    @dev As most sales listings use off-chain signatures it's impossible to
    detect someone who has nested and then deliberately undercuts the floor
    price in the knowledge that the sale can't proceed. This function allows for
    monitoring of such practices and expulsion if abuse is detected, allowing
    the undercutting bird to be sold on the open market. Since OpenSea uses
    isApprovedForAll() in its pre-listing checks, we can't block by that means
    because nesting would then be all-or-nothing for all of a particular owner's
    Moonbirds.
    @notice 只有管理员才能将Moonbird stop nesting。
     @dev 由于大多数销售清单都使用链下签名，因此不可能
     检测nesting和找到在其知道销售无法进行的情况下定价,故意削弱地板价的人。 这个函数允许
     监测此类做法并在发现滥用行为时将其开除，允许
     在公开市场上出售的削弱鸟。 由于 OpenSea 使用
     isApprovedForAll() 在其上市前检查中，我们不能通过这种方式阻止
     因为对于特定所有者的所有nesting来说，嵌套将是全有或全无
     Moonbirds
     */
    function expelFromNest(uint256 tokenId) external onlyRole(EXPULSION_ROLE) {
        require(nestingStarted[tokenId] != 0, "Moonbirds: not nested");
        nestingTotal[tokenId] += block.timestamp - nestingStarted[tokenId];
        nestingStarted[tokenId] = 0;
        emit Unnested(tokenId);
        emit Expelled(tokenId);
    }

    /**
    @dev Required override to select the correct baseTokenURI.
    需要重写以选择正确的 baseTokenURI。
     */
    function _baseURI()
        internal
        view
        override(BaseTokenURI, ERC721A)
        returns (string memory)
    {
        return BaseTokenURI._baseURI();
    }

    /**
    @notice If set, contract to which tokenURI() calls are proxied.
    如果已设置，则将代理 tokenURI() 调用的合同。
     */
    ITokenURIGenerator public renderingContract;

    /**
    @notice Sets the optional tokenURI override contract.
    设置可选的 tokenURI 覆盖合约
     */
    function setRenderingContract(
        ITokenURIGenerator _contract
    ) external onlyOwner {
        renderingContract = _contract;
    }

    /**
    @notice If renderingContract is set then returns its tokenURI(tokenId)
    return value, otherwise returns the standard baseTokenURI + tokenId.
    如果设置了 renderingContract，则返回其 tokenURI(tokenId)
     返回值，否则返回标准baseTokenURI + tokenId。
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (address(renderingContract) != address(0)) {
            return renderingContract.tokenURI(tokenId);
        }
        return super.tokenURI(tokenId);
    }

    /**
    @notice Sets the contract-wide royalty info.
    设置合同范围内的版税信息。
     */
    function setRoyaltyInfo(
        address receiver,
        uint96 feeBasisPoints
    ) external onlyOwner {
        _setDefaultRoyalty(receiver, feeBasisPoints);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721ACommon, ERC2981, AccessControlEnumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
