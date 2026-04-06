// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserRegistry {
    struct UserProfile {
        string username;
        string bio;
        string avatarIpfsHash;
        uint256 joinedAt;
        bool exists;
    }

    mapping(address => UserProfile) public profiles;

    event ProfileCreated(address indexed user, string username);
    event ProfileUpdated(address indexed user, string username);

    // Create a new user profile
    function createProfile(string memory _username, string memory _bio, string memory _avatarIpfsHash) public {
        require(!profiles[msg.sender].exists, "Profile already exists");
        require(bytes(_username).length > 0, "Username cannot be empty");

        profiles[msg.sender] = UserProfile({
            username: _username,
            bio: _bio,
            avatarIpfsHash: _avatarIpfsHash,
            joinedAt: block.timestamp,
            exists: true
        });

        emit ProfileCreated(msg.sender, _username);
    }

    // Update an existing user profile
    function updateProfile(string memory _username, string memory _bio, string memory _avatarIpfsHash) public {
        require(profiles[msg.sender].exists, "Profile does not exist");
        require(bytes(_username).length > 0, "Username cannot be empty");

        UserProfile storage profile = profiles[msg.sender];
        profile.username = _username;
        profile.bio = _bio;
        profile.avatarIpfsHash = _avatarIpfsHash;

        emit ProfileUpdated(msg.sender, _username);
    }

    // Retrieve user profile details
    function getProfile(address _user) public view returns (string memory username, string memory bio, string memory avatarIpfsHash, uint256 joinedAt) {
        require(profiles[_user].exists, "Profile does not exist");
        UserProfile memory profile = profiles[_user];
        return (profile.username, profile.bio, profile.avatarIpfsHash, profile.joinedAt);
    }
}
