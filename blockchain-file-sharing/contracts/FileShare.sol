// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileShare {
    // Struct to store details about a file
    struct File {
        uint256 id;
        string ipfsHash;
        string fileName;
        address owner;
        uint256 uploadTime;
    }

    // Array to store all uploaded files
    File[] public files;

    // Mapping from file ID to user address to a boolean indicating access permission
    mapping(uint256 => mapping(address => bool)) public accessList;

    // Mapping to maintain a list of file IDs owned by each user
    mapping(address => uint256[]) public userFiles;

    // Events to log activities
    event FileUploaded(uint256 indexed fileId, address indexed owner, string fileName, string ipfsHash);
    event AccessGranted(uint256 indexed fileId, address indexed owner, address indexed user);
    event AccessRevoked(uint256 indexed fileId, address indexed owner, address indexed user);

    // Modifier to restrict access to only the owner of the file
    modifier onlyOwner(uint256 _fileId) {
        require(_fileId < files.length, "File does not exist");
        require(files[_fileId].owner == msg.sender, "You are not the owner of this file");
        _;
    }

    // Modifier to restrict access to authorized users (owner + granted users)
    modifier onlyAuthorized(uint256 _fileId) {
        require(_fileId < files.length, "File does not exist");
        require(
            files[_fileId].owner == msg.sender || accessList[_fileId][msg.sender],
            "You do not have permission to view this file"
        );
        _;
    }

    /**
     * @dev Upload a file by saving its IPFS hash and metadata
     * @param _ipfsHash The IPFS hash of the file
     * @param _fileName The name of the file
     */
    function uploadFile(string memory _ipfsHash, string memory _fileName) public {
        uint256 fileId = files.length;
        
        files.push(File({
            id: fileId,
            ipfsHash: _ipfsHash,
            fileName: _fileName,
            owner: msg.sender,
            uploadTime: block.timestamp
        }));

        userFiles[msg.sender].push(fileId);

        emit FileUploaded(fileId, msg.sender, _fileName, _ipfsHash);
    }

    /**
     * @dev Grant access to another user for a specific file
     * @param _fileId The ID of the file
     * @param _user The address of the user to grant access to
     */
    function grantAccess(uint256 _fileId, address _user) public onlyOwner(_fileId) {
        require(_user != msg.sender, "Cannot grant access to yourself");
        accessList[_fileId][_user] = true;
        emit AccessGranted(_fileId, msg.sender, _user);
    }

    /**
     * @dev Revoke access from a user for a specific file
     * @param _fileId The ID of the file
     * @param _user The address of the user to revoke access from
     */
    function revokeAccess(uint256 _fileId, address _user) public onlyOwner(_fileId) {
        require(_user != msg.sender, "Cannot revoke access from yourself");
        accessList[_fileId][_user] = false;
        emit AccessRevoked(_fileId, msg.sender, _user);
    }

    /**
     * @dev Retrieve file details (only accessible by authorized users)
     * @param _fileId The ID of the file
     * @return ipfsHash of the file
     * @return fileName of the file
     * @return owner address of the file
     * @return uploadTime timestamp of the file
     */
    function getFile(uint256 _fileId) public view onlyAuthorized(_fileId) returns (
        string memory ipfsHash, 
        string memory fileName, 
        address owner, 
        uint256 uploadTime
    ) {
        File memory file = files[_fileId];
        return (file.ipfsHash, file.fileName, file.owner, file.uploadTime);
    }

    /**
     * @dev Retrieve all file IDs owned by a specific user
     * @param _user The address of the user
     * @return Array of file IDs owned by the user
     */
    function getUserFiles(address _user) public view returns (uint256[] memory) {
        return userFiles[_user];
    }
}
