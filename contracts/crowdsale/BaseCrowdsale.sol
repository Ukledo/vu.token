pragma solidity ^ 0.4.18;

import "zeppelin-solidity/contracts/crowdsale/emission/AllowanceCrowdsale.sol";
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
contract BaseCrowdsale is AllowanceCrowdsale, Ownable {
    // whitelist data provider
    Whitelist public whitelist;
    // amount of tokens sold
    uint public tokensSold = 0;
    mapping(address => uint256) public balances;
    uint256 public deliveryTime;

    enum State {Opened, Closed}

    State state = State.Closed;

    event Opened();
    event Closed();
    event Finalized();

    /**
    * @dev Reverts if beneficiary is not whitelisted.
    */
    modifier onlyWhitelisted(address _beneficiary) {
        require(whitelist.isWhitelisted(_beneficiary));
        _;
    }

    /**
    * @dev Reverts if crowdsale is not opened.
    */
    modifier onlyOpened() {
        require(opened());
        _;
    }

    /**
    * @dev Constructor
    * @param _token Address of the token being sold
    * @param _whitelist the list of whitelisted users
    * @param _tokenWallet Address holding the tokens, which has approved allowance to the crowdsale
    * @param _wallet Address where collected funds will be forwarded to
    * @param _rate How many token units a buyer gets per wei
    */
    function BaseCrowdsale(
        ERC20 _token,
        address _whitelist,
        address _tokenWallet,
        address _wallet,
        uint _rate,
        uint _deliveryTime)
    public
        Crowdsale(_rate, _wallet, _token)
        AllowanceCrowdsale(_tokenWallet)
    {
        require(_whitelist != 0x0);
        require(now < _deliveryTime);
        // we know that the end is planned for ~June 30th, just to be sure that
        // _deliveryTime will not be unexpectedly big (mistake during deployment, for example)
        require(_deliveryTime < now + 100 days);

        whitelist = Whitelist(_whitelist);

        deliveryTime = _deliveryTime;

        _init();
    }

    /**
    * @dev Opens the crawdsale and permits to buy tokens.
    */
    function open()
    public
    onlyOwner
    {
        require(now < deliveryTime);
        state = State.Opened;

        Opened();
    }

    /**
    * @dev Closes the crawdsale and denies to buy tokens. Could be reopened.
    */
    function close()
    public
    onlyOwner
    {
        state = State.Closed;

        Closed();
    }

    /**
    * @dev Finalizes the crowdsale. No way to reopen the crowdsale after that.
    * Burns unsold tokens.
    */
    /*function finalize()
    public
    onlyOwner
    {
        require(state == State.Closed);

        uint unsoldTokens = remainingTokens();

        if (unsoldTokens > 0) {
            require(token.transferFrom(tokenWallet, this, unsoldTokens));
            BurnableToken(token).burn(unsoldTokens);
        }

        state = State.Finalized;
        Finalized();
    }*/

    /**
    * @dev Tells whether the crowdsale opened or not.
    */
    function opened() public view returns (bool) {
        return state == State.Opened && now < deliveryTime;
    }

    /**
    * @dev Withdraw tokens only after delivery date
    */
    function withdrawTokens() public {
        require(now >= deliveryTime);

        uint256 amount = balances[msg.sender];
        require(amount > 0);
        balances[msg.sender] = 0;
        _deliverTokens(msg.sender, amount);
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
    onlyOpened()
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
        balances[_beneficiary] = balances[_beneficiary].add(_tokenAmount);
    }
}