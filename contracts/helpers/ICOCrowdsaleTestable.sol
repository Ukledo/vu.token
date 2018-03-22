pragma solidity ^ 0.4.18;

import "../crowdsale/ICOCrowdsale.sol";


/**
* @title ICOCrowdsaleTestable
* @dev Designed just for testing purposes
*/
contract ICOCrowdsaleTestable is ICOCrowdsale {
    uint public constant RATE = 6000;

    function ICOCrowdsaleTestable(
        ERC20 _token,
        address _whitelist,
        address _tokenWallet,
        address _wallet,
        uint _deliveryTime)
    public
        ICOCrowdsale(
            _token,
            _whitelist,
            _tokenWallet,
            _wallet,
            now,
            now + 10 days,
            _deliveryTime)
    {
        rate = RATE;
    }
}
