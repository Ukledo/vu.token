pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";


/**
 * @title VU Token
 * @dev VU Token token smart contract
 *
 * Based on references from OpenZeppelin: https://github.com/OpenZeppelin/zeppelin-solidity
 */
contract VUToken is DetailedERC20, BurnableToken, PausableToken {
    using SafeMath for uint256;

    uint public constant INITIAL_SUPPLY = 1000000000 * (10**18);

    /**
    * @dev Constructor
    */
    function VUToken() public
    DetailedERC20("VU TOKEN", "VU", 18)
    {
        totalSupply_ = INITIAL_SUPPLY;

        balances[msg.sender] = INITIAL_SUPPLY;
        Transfer(0x0, msg.sender, INITIAL_SUPPLY);
    }

    /**
    * @dev Function to transfer tokens
    * @param _recipients The addresses that will receive the tokens.
    * @param _amounts The list of the amounts of tokens to transfer.
    * @return A boolean that indicates if the operation was successful.
    */
    function massTransfer(address[] _recipients, uint[] _amounts) external returns (bool) {
        require(_recipients.length == _amounts.length);

        for (uint i = 0; i < _recipients.length; i++) {
            require(transfer(_recipients[i], _amounts[i]));
        }

        return true;
    }
}
