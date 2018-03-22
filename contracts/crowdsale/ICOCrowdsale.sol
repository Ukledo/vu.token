pragma solidity ^ 0.4.18;

import "zeppelin-solidity/contracts/crowdsale/emission/AllowanceCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";

import "./Whitelist.sol";

contract ICOCrowdsale is AllowanceCrowdsale, TimedCrowdsale {

    uint256 public constant RATE = 6000;

    Whitelist public whitelist;

    /**
    * @dev Reverts if beneficiary is not whitelisted. Can be used when extending this contract.
    */
    modifier isWhitelisted(address _beneficiary) {
        require(whitelist.isWhitelisted(_beneficiary));
        _;
    }

    /**
    * @dev Constructor
    * @param _wallet Address where collected funds will be forwarded to
    * @param _token Address of the token being sold
    * @param _tokenWallet Address holding the tokens, which has approved allowance to the crowdsale
    * @param _openingTime Crowdsale opening time
    * @param _closingTime Crowdsale closing time
    */
    function ICOCrowdsale(
      address _wallet,
      ERC20 _token,
      address _tokenWallet,
      address _whitelist,
      uint256 _openingTime,
      uint256 _closingTime)
    public
      Crowdsale(RATE, _wallet, _token)
      AllowanceCrowdsale(_tokenWallet)
      TimedCrowdsale(_openingTime, _closingTime)
    {
          require(_whitelist != 0x0);
          whitelist = Whitelist(_whitelist);
    }

    /**
    *  @dev Returns true if in crowdsale time range
    */
    function isOpened() view public returns (bool) {
        return now >= openingTime && now <= closingTime;
    }

    /**
    * @dev Extend parent behavior requiring beneficiary to be in whitelist.
    * @param _beneficiary Token beneficiary
    * @param _weiAmount Amount of wei contributed
    */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal isWhitelisted(_beneficiary) {
        super._preValidatePurchase(_beneficiary, _weiAmount);
    }
}
