pragma solidity ^ 0.4.18;

import "./BaseCrowdsale.sol";


/**
 * @title PresaleCrowdsale
 * @dev PresaleCrowdsale is a contract for managing a token presale
 *
 * Based on references from OpenZeppelin: https://github.com/OpenZeppelin/zeppelin-solidity
 */
contract PresaleCrowdsale is BaseCrowdsale {
    uint public constant PHASE1_RATE = 7500;
    uint public constant PHASE2_RATE = 6900;
    uint public constant PHASE3_RATE = 6300;

    uint public constant PHASE1_CAP = 30000000 * (10**18);
    uint public constant PHASE2_CAP = 40000000 * (10**18);
    uint public constant PHASE3_CAP = 80000000 * (10**18);

    uint public constant PHASE1_LIMIT = PHASE1_CAP;
    uint public constant PHASE2_LIMIT = PHASE1_CAP + PHASE2_CAP;
    uint public constant PHASE3_LIMIT = PHASE1_CAP + PHASE2_CAP + PHASE3_CAP;

    enum PhaseId {Phase1, Phase2, Phase3}

    struct Phase {
        uint rate;
        uint cap;
        uint limit;
    }

    Phase[] public phases;

    /**
    * @dev Constructor
    * @param _token Address of the token being sold
    * @param _whitelist the whitelisted users data provider
    * @param _tokenWallet Address holding the tokens, which has approved allowance to the crowdsale
    * @param _wallet Address where collected funds will be forwarded to
    */
    function PresaleCrowdsale(
        ERC20 _token,
        address _whitelist,
        address _tokenWallet,
        address _wallet,
        uint _deliveryTime)
    public
        BaseCrowdsale(
            _token,
            _whitelist,
            _tokenWallet,
            _wallet,
            PHASE1_RATE,
            _deliveryTime)
    {
    }

    /**
    * @dev Returns id of the current phase
    */
    function getPhase()
    public
    view
    returns (uint)
    {
        return uint(_getPhase());
    }

    /**
    * @dev Returns the rate of tokens per wei at the present time.
    * @return The number of tokens a buyer gets per wei at a given time
    */
    function getPhaseRate(PhaseId _phase)
    public
    view
    returns (uint)
    {
        uint rate = phases[uint(_phase)].rate;
        assert(rate > 0);
        return rate;
    }

    /**
    * @dev Returns cap of the given phase
    */
    function getPhaseCap(PhaseId _phase)
    public
    view
    returns (uint)
    {
        uint cap = phases[uint(_phase)].cap;
        assert(cap > 0);
        return cap;
    }

    /**
    * @dev Can be overridden to add initialization logic. The overriding function
    * should call super._init() to ensure the chain of initialization is
    * executed entirely.
    */
    function _init()
    internal
    {
        super._init();

        phases.push(Phase(PHASE1_RATE, PHASE1_CAP, PHASE1_LIMIT));
        phases.push(Phase(PHASE2_RATE, PHASE2_CAP, PHASE2_LIMIT));
        phases.push(Phase(PHASE3_RATE, PHASE3_CAP, PHASE3_LIMIT));
    }

    /**
    * @dev Returns phase at the present time.
    */
    function _getPhase()
    internal
    view
    returns (PhaseId)
    {
        if (tokensSold <= _getPhaseUpperLimit(PhaseId.Phase1)) {
            return PhaseId.Phase1;
        } else if (tokensSold <= _getPhaseUpperLimit(PhaseId.Phase2)) {
            return PhaseId.Phase2;
        } else if (tokensSold <= _getPhaseUpperLimit(PhaseId.Phase3)) {
            return PhaseId.Phase3;
        }
    }

    /**
    * @dev Returns amount of sold tokens when the given phase is ended.
    */
    function _getPhaseUpperLimit(PhaseId _phase)
    internal
    view
    returns (uint)
    {
        uint limit = phases[uint(_phase)].limit;
        assert(limit > 0);
        return limit;
    }

    /**
    * @dev Overrides parent method taking into account variable rate.
    * @param _weiAmount The value in wei to be converted into tokens
    * @return The number of tokens _weiAmount wei will buy at present time
    */
    function _getTokenAmount(uint _weiAmount)
    internal
    view
    returns (uint)
    {
        PhaseId currentPhase = _getPhase();
        return _calcTokenAmount(currentPhase, _weiAmount, tokensSold);
    }

    /**
    * @dev Calculates amount of tokens which can purchased
    * @param _phase the phase of presale
    * @param _weiAmount the value in wei to be converted into tokens
    * @param _tokensSold the amount of sold tokens
    * @return The number of tokens _weiAmount wei will buy at present time
    */
    function _calcTokenAmount(PhaseId _phase, uint _weiAmount, uint _tokensSold)
    private
    view
    returns (uint tokensBought)
    {
        uint rate = getPhaseRate(_phase);

        tokensBought = rate.mul(_weiAmount);

        if (_tokensSold.add(tokensBought) > _getPhaseUpperLimit(_phase)) {
            uint tokens = _getPhaseUpperLimit(_phase).sub(_tokensSold);

            PhaseId nextPhase = PhaseId(uint(_phase) + 1);
            tokensBought = _calcTokenAmount(nextPhase, _weiAmount.sub(tokens.div(rate)), _tokensSold.add(tokens));

            tokensBought = tokensBought.add(tokens);
        }

        return tokensBought;
    }
}
