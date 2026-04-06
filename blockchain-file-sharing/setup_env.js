import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wallet = ethers.Wallet.createRandom();

const envContent = `# Hardhat deployment network configurations
# Replace these with your actual Alchemy/Infura URL and Wallet Private Key

SEPOLIA_RPC_URL="https://rpc.sepolia.org"
PRIVATE_KEY="${wallet.privateKey}"
`;

fs.writeFileSync(path.join(__dirname, '.env'), envContent);

console.log("SUCCESS!");
console.log("ADDRESS:", wallet.address);
