pragma solidity ^ 0.4.18;

import "zeppelin-solidity/contracts/crowdsale/emission/AllowanceCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/distribution/PostDeliveryCrowdsale.sol";
import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Whitelist.sol";


/**
 * @title BaseCrowdsale
 * @dev BaseCrowdsale is a base contract for managing a VU token crowdsale
 * Crowdsale that locks tokens from withdrawal until special time.
 *
 * Based on references from OpenZeppelin: https://github.com/OpenZeppelin/zeppelin-solidity
 */
contract BaseCrowdsale is AllowanceCrowdsale, PostDeliveryCrowdsale, Ownable {
    // whitelist data provider
    Whitelist public whitelist;
    // amount of tokens sold
    uint public tokensSold = 0;
    uint public deliveryTime;
    uint public limit;

    /**
    * @dev Reverts if beneficiary is not whitelisted.
    */
    modifier onlyWhitelisted(address _beneficiary) {
        require(whitelist.isWhitelisted(_beneficiary));
        _;
    }

    /**
    * @dev Constructor
    * @param _token Address of the token being sold
    * @param _whitelist the list of whitelisted users
    * @param _tokenWallet Address holding the tokens, which has approved allowance to the crowdsale
    * @param _wallet Address where collected funds will be forwarded to
    * @param _rate How many token units a buyer gets per wei
    * @param _openingTime Crowdsale opening time
    * @param _closingTime Crowdsale closing time
    */
    function BaseCrowdsale(
        ERC20 _token,
        address _whitelist,
        address _tokenWallet,
        address _wallet,
        uint _rate,
        uint _openingTime,
        uint _closingTime,
        uint _deliveryTime,
        uint _limit)
    public
        Crowdsale(_rate, _wallet, _token)
        AllowanceCrowdsale(_tokenWallet)
        TimedCrowdsale(_openingTime, _closingTime)
    {
        require(_whitelist != 0x0);
        require(now < _deliveryTime);
        require(_limit > 0);
        // we know that the end is planned for ~June 30th, just to be sure that
        // _deliveryTime will not be unexpectedly big (mistake during deployment, for example)
        require(_deliveryTime < now + 100 days);

        whitelist = Whitelist(_whitelist);

        deliveryTime = _deliveryTime;
        limit = _limit;

        _init();
    }

    /**
    * @dev Withdraw tokens only after delivery date
    */
    function withdrawTokens() public {
        require(now >= deliveryTime);
        super.withdrawTokens();
    }

    /**
    * @dev Override for extensions that require a custom crowdsale initialization flow
    */
    function _init()
    internal
    {
        // optional override
    }

    /**
    * @dev Extend parent behavior requiring beneficiary to be in whitelist.
    * @param _beneficiary Token beneficiary
    * @param _weiAmount Amount of wei contributed
    */
    function _preValidatePurchase(address _beneficiary, uint _weiAmount)
    internal
    onlyWhitelisted(_beneficiary)
    {
        super._preValidatePurchase(_beneficiary, _weiAmount);
    }

    /**
    * @dev Overrides parent
    * @param _beneficiary Token purchaser
    * @param _tokenAmount Amount of tokens purchased
    */
    function _processPurchase(address _beneficiary, uint _tokenAmount)
    internal
    {
        tokensSold = tokensSold.add(_tokenAmount);
        require(limit >= tokensSold);

        PostDeliveryCrowdsale._processPurchase(_beneficiary, _tokenAmount);
    }
}
