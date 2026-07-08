module.exports = [
  "function registerImage(string imageHash,string storageUri,string metadataHash) returns (uint256)",
  "function grantAccess(uint256 imageId,address grantee)",
  "function revokeAccess(uint256 imageId,address grantee)",
  "function revokeImage(uint256 imageId)",
  "function canAccess(uint256 imageId,address requester) view returns (bool)",
  "function auditAccess(uint256 imageId,address requester) returns (bool)",
  "function getPatientImages(address patient) view returns (uint256[])",
  "function isAuthorized(uint256 imageId,address grantee) view returns (bool)",
  "event ImageRegistered(uint256 indexed imageId,address indexed patient,string imageHash,string storageUri,string metadataHash)"
];
