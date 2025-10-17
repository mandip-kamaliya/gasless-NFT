// src/RewardNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract RewardNFT is ERC721, Ownable {
    
    uint256 private _nextTokenId;

    constructor() ERC721("Gasless Reward", "GFT") Ownable(msg.sender) {}

    function claimNFT() public {
       
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
    }
}