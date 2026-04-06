import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import { Upload, File, Shield, Link as LinkIcon, HardDrive, Share2, Search, X } from 'lucide-react';
import { PinataSDK } from 'pinata-web3';
import FileShareABI from './artifacts/FileShare.json';

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
});

// Note: Replace with your deployed contract address or set as env variable
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [contractAddress, setContractAddress] = useState(CONTRACT_ADDRESS);

  // App state
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Sharing & Lookup State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedFileIdToShare, setSelectedFileIdToShare] = useState<string | null>(null);
  const [targetShareAddress, setTargetShareAddress] = useState('');
  const [lookupFileId, setLookupFileId] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          setAccount(accounts[0]);
          
          if (contractAddress) {
            setupContract(provider, contractAddress);
          }
        }
      } catch (error) {
        console.error("Error checking wallet connection", error);
      }
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        setAccount(accounts[0]);
        
        if (contractAddress) {
          setupContract(provider, contractAddress);
        }
      } else {
        alert("Please install MetaMask to use this dApp!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };



  const switchToSepoliaNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia',
                rpcUrls: ['https://rpc.sepolia.org'],
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add the Sepolia network", addError);
        }
      } else {
        console.error("Failed to switch network", switchError);
      }
    }
  };

  const setupContract = async (provider: BrowserProvider, address: string) => {
    try {
      const signer = await provider.getSigner();
      const fileShareContract = new Contract(address, FileShareABI.abi, signer);
      setContract(fileShareContract);
      
      const userFilesIds = await fileShareContract.getUserFiles(await signer.getAddress());
      const loadedFiles = [];
      for (const id of userFilesIds) {
        const fileData = await fileShareContract.getFile(id);
        loadedFiles.push({
          id: id.toString(),
          ipfsHash: fileData.ipfsHash,
          fileName: fileData.fileName,
          owner: fileData.owner,
          uploadTime: fileData.uploadTime.toString()
        });
      }
      setFiles(loadedFiles);
    } catch (error) {
      console.error("Error setting up contract:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !contract) return;
    
    setIsUploading(true);
    setUploadStatus("Uploading to IPFS...");
    try {
      // 1. Upload to Pinata IPFS
      const upload = await pinata.upload.file(selectedFile);
      const ipfsHash = upload.IpfsHash;
      
      setUploadStatus("Confirming on Blockchain...");
      
      // 2. Call Smart Contract
      const tx = await contract.uploadFile(ipfsHash, selectedFile.name);
      await tx.wait(); // Wait for confirmation
      
      setUploadStatus("Success!");
      setSelectedFile(null);
      
      // Reload files safely
      if(provider) {
         setupContract(provider, contractAddress);
      }
    } catch (error) {
      console.error("Upload failed", error);
      setUploadStatus("Upload Failed");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  const handleShare = async () => {
    if (!contract || !selectedFileIdToShare || !targetShareAddress) return;
    setIsSharing(true);
    try {
      const tx = await contract.grantAccess(selectedFileIdToShare, targetShareAddress);
      await tx.wait();
      alert("Access granted successfully on the blockchain!");
      setShareModalOpen(false);
      setTargetShareAddress('');
    } catch (error) {
      console.error("Error sharing file:", error);
      alert("Failed to grant access. Make sure you are the owner and have confirmed the transaction.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !lookupFileId) return;
    setIsLookingUp(true);
    try {
      // The smart contract reverts if the user is not authorized
      const fileData = await contract.getFile(lookupFileId);
      window.open(`https://gateway.pinata.cloud/ipfs/${fileData.ipfsHash}`, '_blank');
    } catch (error) {
      console.error("Error looking up file:", error);
      alert("Access Denied or File Not Found. Ensure the ID is correct and you have been granted access.");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleContractAddressUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (provider && contractAddress) {
      setupContract(provider, contractAddress);
    }
  };

  // UI Component rendering
  return (
    <div className="main-layout">
      <header>
        <div className="container header-inner">
          <div className="logo">
            <Shield className="logo-icon" size={28} />
            <span>ChainShare</span>
          </div>
          
          <div>
            {!account ? (
              <button 
                className="btn btn-primary" 
                onClick={connectWallet}
                disabled={isConnecting}
              >
                <HardDrive size={18} />
                <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button className="btn btn-outline" onClick={switchToSepoliaNetwork} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                  🦊 Switch to Sepolia
                </button>
                <div className="status-indicator status-connected">
                  <div className="status-dot"></div>
                  <span title={account}>{account.slice(0, 6)}...{account.slice(-4)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '3rem 1.5rem', flex: 1 }}>
        {!account ? (
          <div style={{ textAlign: 'center', marginTop: '10vh' }} className="animate-slide-up">
            <h1 className="heading-xl">Secure Web3 File Sharing</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
              Upload files to IPFS and manage access control seamlessly on the Ethereum blockchain.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={connectWallet} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                <HardDrive size={22} />
                <span>Connect MetaMask to Start</span>
              </button>
              <button className="btn btn-outline" onClick={switchToSepoliaNetwork} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                🦊 Switch to Sepolia Network
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-slide-up">
            
            {/* Setup Section (Only shown if contract isn't ready) */}
            {!contract && (
              <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LinkIcon size={24} color="var(--primary)" />
                  Link Smart Contract
                </h2>
                <form onSubmit={handleContractAddressUpdate} className="input-group">
                  <label className="input-label">Sepolia Contract Address</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="0x..." 
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      style={{ flex: 1 }}
                      required
                    />
                    <button type="submit" className="btn btn-primary">Connect</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
              
              {/* Upload Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="glass-card" style={{ height: '100%' }}>
                  <h2 style={{ marginBottom: '1.5rem' }}>Upload New File</h2>
                  
                  <div className="upload-area">
                    <Upload className="upload-icon" />
                    <h3>{selectedFile ? selectedFile.name : "Drag & Drop your file"}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "or click to browse"}
                    </p>
                    <input type="file" onChange={handleFileChange} style={{ display: 'none' }} id="file-upload" />
                    <label htmlFor="file-upload" className="btn btn-outline" style={{ marginTop: '1rem' }}>
                      {selectedFile ? "Change File" : "Browse Files"}
                    </label>
                  </div>
                  
                  <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                      disabled={!contract || isUploading || !selectedFile}
                      onClick={handleUpload}
                    >
                      <span>{isUploading ? uploadStatus : "Secure & Upload"}</span>
                    </button>
                    {!contract && <p style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '0.5rem' }}>Contract not connected</p>}
                  </div>
                </div>
              </div>

              {/* Files Dashboard */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2>My Dashboard</h2>
                  
                  {/* Lookup Bar */}
                  <form onSubmit={handleLookup} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '250px', justifyContent: 'flex-end' }}>
                    <input 
                      type="number" 
                      className="input-field" 
                      placeholder="Find shared File ID..." 
                      value={lookupFileId}
                      onChange={(e) => setLookupFileId(e.target.value)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', maxWidth: '200px' }}
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} disabled={isLookingUp}>
                      {isLookingUp ? "..." : <Search size={16} />}
                    </button>
                  </form>
                </div>

                {files.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                    <File size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                    <p>No files uploaded yet.</p>
                  </div>
                ) : (
                  <div className="dashboard-grid">
                    {files.map((file) => (
                      <div key={file.id} className="glass-card file-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                        <div className="file-header">
                          <div className="file-icon"><File size={24} /></div>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.4rem', borderRadius: '50%' }} 
                            title="Share File"
                            onClick={() => {
                              setSelectedFileIdToShare(file.id);
                              setShareModalOpen(true);
                            }}
                          >
                            <Share2 size={16} />
                          </button>
                        </div>
                        <div className="file-meta">
                          <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>
                            {file.fileName} 
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>(ID: {file.id})</span>
                          </h4>
                          <span>Uploaded: {new Date(Number(file.uploadTime) * 1000).toLocaleString()}</span>
                          <div className="cid-badge">{file.ipfsHash.slice(0, 15)}...</div>
                        </div>
                        <div className="file-actions">
                          <a href={`https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}>
                            <span>View File</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
            </div>
          </div>
        )}
      </main>

      {/* Share Modal Overlay */}
      <div className={`modal-overlay ${shareModalOpen ? 'open' : ''}`}>
        <div className="modal-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Share2 size={24} color="var(--primary)" />
              Share File (ID: {selectedFileIdToShare})
            </h2>
            <button onClick={() => setShareModalOpen(false)} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
              <X size={20} />
            </button>
          </div>
          
          <div className="input-group">
            <label className="input-label">Recipient's Ethereum Address</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="0x..." 
              value={targetShareAddress}
              onChange={(e) => setTargetShareAddress(e.target.value)}
            />
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            onClick={handleShare}
            disabled={isSharing || !targetShareAddress}
          >
            <span>{isSharing ? "Confirming on Blockchain..." : "Grant Access"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
