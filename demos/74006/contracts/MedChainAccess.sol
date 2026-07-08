// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MedChainAccess {
    enum ImageStatus {
        Active,
        Revoked
    }

    struct MedicalImage {
        uint256 id;
        address patient;
        string imageHash;
        string storageUri;
        string metadataHash;
        uint256 createdAt;
        ImageStatus status;
    }

    uint256 private _nextImageId = 1;

    mapping(uint256 => MedicalImage) private _images;
    mapping(address => uint256[]) private _patientImages;
    mapping(uint256 => mapping(address => bool)) private _authorizations;

    event ImageRegistered(
        uint256 indexed imageId,
        address indexed patient,
        string imageHash,
        string storageUri,
        string metadataHash
    );

    event AccessGranted(uint256 indexed imageId, address indexed patient, address indexed grantee);
    event AccessRevoked(uint256 indexed imageId, address indexed patient, address indexed grantee);
    event ImageRevoked(uint256 indexed imageId, address indexed patient);
    event AccessChecked(uint256 indexed imageId, address indexed requester, bool allowed);

    modifier onlyPatient(uint256 imageId) {
        require(_images[imageId].patient == msg.sender, "MedChain: caller is not patient");
        _;
    }

    modifier imageExists(uint256 imageId) {
        require(_images[imageId].id != 0, "MedChain: image does not exist");
        _;
    }

    function registerImage(
        string calldata imageHash,
        string calldata storageUri,
        string calldata metadataHash
    ) external returns (uint256 imageId) {
        require(bytes(imageHash).length > 0, "MedChain: image hash required");
        require(bytes(storageUri).length > 0, "MedChain: storage URI required");

        imageId = _nextImageId++;
        _images[imageId] = MedicalImage({
            id: imageId,
            patient: msg.sender,
            imageHash: imageHash,
            storageUri: storageUri,
            metadataHash: metadataHash,
            createdAt: block.timestamp,
            status: ImageStatus.Active
        });
        _patientImages[msg.sender].push(imageId);

        emit ImageRegistered(imageId, msg.sender, imageHash, storageUri, metadataHash);
    }

    function grantAccess(uint256 imageId, address grantee)
        external
        imageExists(imageId)
        onlyPatient(imageId)
    {
        require(grantee != address(0), "MedChain: invalid grantee");
        require(grantee != msg.sender, "MedChain: patient already owns access");
        require(_images[imageId].status == ImageStatus.Active, "MedChain: image revoked");

        _authorizations[imageId][grantee] = true;
        emit AccessGranted(imageId, msg.sender, grantee);
    }

    function revokeAccess(uint256 imageId, address grantee)
        external
        imageExists(imageId)
        onlyPatient(imageId)
    {
        require(grantee != address(0), "MedChain: invalid grantee");

        _authorizations[imageId][grantee] = false;
        emit AccessRevoked(imageId, msg.sender, grantee);
    }

    function revokeImage(uint256 imageId)
        external
        imageExists(imageId)
        onlyPatient(imageId)
    {
        _images[imageId].status = ImageStatus.Revoked;
        emit ImageRevoked(imageId, msg.sender);
    }

    function canAccess(uint256 imageId, address requester)
        public
        view
        imageExists(imageId)
        returns (bool)
    {
        MedicalImage memory image = _images[imageId];
        if (image.status != ImageStatus.Active) {
            return false;
        }

        return image.patient == requester || _authorizations[imageId][requester];
    }

    function auditAccess(uint256 imageId, address requester)
        external
        imageExists(imageId)
        returns (bool allowed)
    {
        allowed = canAccess(imageId, requester);
        emit AccessChecked(imageId, requester, allowed);
    }

    function getImage(uint256 imageId)
        external
        view
        imageExists(imageId)
        returns (MedicalImage memory)
    {
        require(canAccess(imageId, msg.sender), "MedChain: access denied");
        return _images[imageId];
    }

    function getPatientImages(address patient) external view returns (uint256[] memory) {
        return _patientImages[patient];
    }

    function isAuthorized(uint256 imageId, address grantee)
        external
        view
        imageExists(imageId)
        returns (bool)
    {
        return _authorizations[imageId][grantee];
    }
}
