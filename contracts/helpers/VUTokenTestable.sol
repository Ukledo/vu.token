pragma solidity ^0.4.17;

import "../token/VUToken.sol";


/**
* @title ICOCrowdsaleTestable
* @dev Designed just for testing purposes
*/
contract VUTokenTestable is VUToken {
    using SafeMath for uint256;

    function VUTokenTestable()
    public
    VUToken() {
        name = "VU Token Test";
        symbol = "VU";
    }
}
