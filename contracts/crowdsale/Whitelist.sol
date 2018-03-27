pragma solidity ^ 0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title Whitelist
 * @dev List of whitelisted users who can contribute.
 */
contract Whitelist is Ownable {
    mapping(address => bool) public whitelist;
    mapping(address => bool) public authorized;

    event UserAllowed(address user);
    event UserDisallowed(address user);

    modifier onlyAuthorized {
        require(msg.sender == owner || authorized[msg.sender]);
        _;
    }

    /**
    * @dev Adds single address to admins.
    * @param _admin Address to be added to the admins
    */
    function authorize(address _admin) external onlyOwner {
        authorized[_admin] = true;
    }

    /**
    * @dev Removes single address from admins.
    * @param _admin Address to be removed from the admins
    */
    function reject(address _admin) external onlyOwner {
        authorized[_admin] = false;
    }

    /**
    * @dev Adds single address to whitelist.
    * @param _beneficiary Address to be added to the whitelist
    */
    function addToWhitelist(address _beneficiary) external onlyAuthorized {
        whitelist[_beneficiary] = true;
        UserAllowed(_beneficiary);
    }

    /**
    * @dev Adds list of addresses to whitelist. Not overloaded due to limitations with truffle testing.
    * @param _beneficiaries Addresses to be added to the whitelist
    */
    function addManyToWhitelist(address[] _beneficiaries) external onlyAuthorized {
        for (uint i = 0; i < _beneficiaries.length; i++) {
            whitelist[_beneficiaries[i]] = true;
            UserAllowed(_beneficiaries[i]);
        }
    }

    /**
    * @dev Removes single address from whitelist.
    * @param _beneficiary Address to be removed to the whitelist
    */
    function removeFromWhitelist(address _beneficiary) external onlyAuthorized {
        whitelist[_beneficiary] = false;
        UserDisallowed(_beneficiary);
    }

    /**
    * @dev Tells whether the given address is whitelisted or not
    * @param _beneficiary Address to be checked
    */
    function isWhitelisted(address _beneficiary) public view returns (bool) {
        return whitelist[_beneficiary];
    }
}
