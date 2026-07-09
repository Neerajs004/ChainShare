# ChainShare 🌐📂

ChainShare is a **Decentralized File Sharing Application** that combines the security of the Ethereum blockchain with the efficiency of IPFS (InterPlanetary File System). It allows users to securely upload files, manage fine-grained access control, and share files with other wallet addresses permanently on-chain.

---

## ✨ Key Features

- **Decentralized Storage**: Files are uploaded to **IPFS** via Pinata, ensuring they are tamper-proof and highly available at anytime.
- **On-Chain Access Control**: Permissions (Grant/Revoke) are handled by a **Solidity Smart Contract** on the Ethereum network.
- **P2P Sharing**: Share files with any wallet address by granting them access on the blockchain.
- **Privacy First**: Only authorized users can retrieve the IPFS hash and view the files easily.
- **Vibrant UI**: Built with a modern **Glassmorphic Design** for a premium user experience.

---

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), [Lucide React](https://lucide.dev/).
- **Blockchain**: [Solidity](https://soliditylang.org/), [Hardhat](https://hardhat.org/), [Ethers.js v6](https://docs.ethers.org/v6/).
- **Storage**: [IPFS](https://ipfs.tech/) (via [Pinata](https://www.pinata.cloud/)).
- **Styling**: Vanilla CSS (Modern CSS Variables & Glassmorphism).

---

## 🚀 Getting Started

### Prerequisites

1.  **Node.js**: Install the latest LTS version.
2.  **MetaMask**: A browser extension to interact with the Sepolia Testnet.
3.  **Pinata Account**: Get your JWT from the [Pinata Dashboard](https://app.pinata.cloud/developers/api-keys).
4.  **Alchemy/Infura**: An RPC URL for the Sepolia Testnet.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Neerajs004/ChainShare.git
    cd ChainShare
    ```

2.  **Setup Blockchain environment**:
    ```bash
    cd blockchain-file-sharing
    npm install
    # Create a .env file and add your SEPOLIA_RPC_URL and PRIVATE_KEY
    ```

3.  **Setup Frontend environment**:
    ```bash
    cd ../frontend
    npm install
    # Create a .env file and add your VITE_PINATA_JWT and VITE_CONTRACT_ADDRESS
    ```

---

## ⚙️ Deployment & Usage

### Smart Contract Deployment

1.  Navigate to the blockchain directory:
    ```bash
    cd blockchain-file-sharing
    ```
2.  Compile the contracts:
    ```bash
    npx hardhat compile
    ```
3.  Deploy to Sepolia:
    ```bash
    npx hardhat ignition deploy ignition/modules/FileShare.ts --network sepolia
    ```

### Running the Application

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open `http://localhost:5173` in your browser.

---

## 📂 Project Structure

```text
ChainShare/
├── blockchain-file-sharing/   # Hardhat project (Smart Contracts)
│   ├── contracts/            # Solidity source files
│   ├── ignition/modules/     # Deployment scripts
│   └── hardhat.config.ts     # Blockchain configuration
├── frontend/                  # React application (Vite + TS)
│   ├── src/                  # App components & logic
│   └── App.tsx               # Main application entry
└── README.md                  # Project documentation
```

---

## 🔒 Security & Best Practices

- **Never share your `.env` files**: These contain your private keys and API secrets. They are already added to `.gitignore`.
- **Gas Costs**: Interacting with the blockchain (uploads/shares) requires Sepolia ETH for gas fees.
- **Metadata**: Only the file hash and name are stored on-chain to minimize gas consumption.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
