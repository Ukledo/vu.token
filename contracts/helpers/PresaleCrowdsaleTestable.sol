pragma solidity ^ 0.4.18;

import "../crowdsale/PresaleCrowdsale.sol";


/**
* @title PresaleCrowdsaleTestable
* @dev Designed just for testing purposes
*/
contract PresaleCrowdsaleTestable is PresaleCrowdsale {
    uint public constant PHASE1_CAP = 300000 * (10**15);
    uint public constant PHASE2_CAP = 400200 * (10**15);
    uint public constant PHASE3_CAP = 800100 * (10**15);

    uint public constant PHASE1_LIMIT = PHASE1_CAP;
    uint public constant PHASE2_LIMIT = PHASE1_CAP + PHASE2_CAP;
    uint public constant PHASE3_LIMIT = PHASE1_CAP + PHASE2_CAP + PHASE3_CAP;

    function PresaleCrowdsaleTestable(
        ERC20 _token,
        address _whitelist,
        address _tokenWallet,
        address _wallet,
        uint _deliveryTime)
    public
        PresaleCrowdsale(_token, _whitelist, _tokenWallet, _wallet, now, now + 10 days, _deliveryTime)
    {
    }

    function _init() internal {
        phases.push(Phase(PHASE1_RATE, PHASE1_CAP, PHASE1_LIMIT));
        phases.push(Phase(PHASE2_RATE, PHASE2_CAP, PHASE2_LIMIT));
        phases.push(Phase(PHASE3_RATE, PHASE3_CAP, PHASE3_LIMIT));
    }
}
