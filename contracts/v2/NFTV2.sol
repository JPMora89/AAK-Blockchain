
// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./interfaces/IERC721Permit.sol";
import "./interfaces/IERC1271.sol";

 contract NFTV2 is IERC721Permit, ERC721URIStorage  {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
     mapping(uint256 => Counters.Counter) private _nonces;
    address contractAddress;

    modifier onlyMarketplace() {
        require(msg.sender == contractAddress, "Not called by marketplace");
        _;
    }

    constructor(address marketplaceAddress) ERC721("AAK Metamarket", "AAM") {
        contractAddress = marketplaceAddress;
    }

 /// @dev Gets the current nonce for a token ID and then increments it, returning the original value
    // function _getAndIncrementNonce(uint256 tokenId) internal virtual returns (uint256);

    /// @dev The hash of the name used in the permit signature verification
    bytes32 private immutable nameHash=keccak256(bytes("AAK Metamarket"));

    /// @dev The hash of the version string used in the permit signature verification
    bytes32 private immutable versionHash=keccak256(bytes("1"));

   

  
    function DOMAIN_SEPARATOR_TOKEN(address verifyingContract) public view  returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    // keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')
                    0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f,
                    nameHash,
                    versionHash,
                   block.chainid,
                   verifyingContract
                )
            );
    }

    /// @inheritdoc IERC721Permit
    /// @dev Value is equal to keccak256("Permit(address spender,uint256 tokenId,uint256 nonce,uint256 deadline)");
    bytes32 public constant override PERMIT_TYPEHASH =
        0x49ecf333e5b8c95c40fdafc95c1ad136e8914a8fb55e9dc8bb01eaa83a2df9ad;

    function createToken(string memory tokenURI, address nftOwner) public  onlyMarketplace returns (uint256)  {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(nftOwner, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
    function getTokenId() public view onlyMarketplace returns(uint256){
     return _tokenIds.current();
    }
    function transfertoken(address nftOwner, address to, uint _tokenId)external {
     _transfer(nftOwner, to, _tokenId);
    }

    /// @inheritdoc IERC721Permit
    function permit(
        address spender,
        uint256 tokenId,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public  override {
        // require(block.timestamp <= deadline, "Permit expired");

        bytes32 digest =
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR_TOKEN(spender),
                    keccak256(abi.encode(PERMIT_TYPEHASH, spender, tokenId, _useNonce(tokenId), deadline))
                )
            );
        address owner = ownerOf(tokenId);
        require(spender != owner, "ERC721Permit: approval to current owner");

        if (Address.isContract(owner)) {
            require(IERC1271(owner).isValidSignature(digest, abi.encodePacked(r, s, v)) == 0x1626ba7e, "Unauthorized");
        } else {
            address recoveredAddress = ecrecover(digest, v, r, s);
            require(recoveredAddress != address(0), "Invalid signature");
            require(recoveredAddress == owner, "Unauthorized");
        }

        _approve(spender, tokenId);
    }
    function _useNonce(uint256 tokenId) public   returns (uint256 current) {
        Counters.Counter storage nonce = _nonces[tokenId];
        current = nonce.current();
        nonce.increment();
        
    }
     function nonces(uint256 tokenId) public view  returns (uint256) {
        return _nonces[tokenId].current();
    }
}
