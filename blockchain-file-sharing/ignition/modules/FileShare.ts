import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FileShareModule = buildModule("FileShareModule", (m) => {
  // Deploy the FileShare contract
  const fileShare = m.contract("FileShare");

  return { fileShare };
});

export default FileShareModule;
