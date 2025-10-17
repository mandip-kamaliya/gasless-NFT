// app/ClaimComponent.tsx

"use client"; // This is the most important line!

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useWalletClient } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { http, createPublicClient } from 'viem';
import { createSmartAccountClient } from 'permissionless';
import { signerToSimpleSmartAccount } from 'permissionless/accounts';

// --- CONSTANTS ---
const PAYMASTER_URL = process.env.NEXT_PUBLIC_BASE_PAYMASTER_URL!;
const NFT_CONTRACT_ADDRESS = '0x9347d87Cf7E6b41A03b7dE1276CAE4d27dB6a3DA';
const contractAbi = [{"type":"constructor","inputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"approve","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"balanceOf","inputs":[{"name":"owner","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"claimNFT","inputs":[],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"getApproved","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"isApprovedForAll","inputs":[{"name":"owner","type":"address","internalType":"address"},{"name":"operator","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"name","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"ownerOf","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"renounceOwnership","inputs":[],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"safeTransferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"safeTransferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"data","type":"bytes","internalType":"bytes"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"setApprovalForAll","inputs":[{"name":"operator","type":"address","internalType":"address"},{"name":"approved","type":"bool","internalType":"bool"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"supportsInterface","inputs":[{"name":"interfaceId","type":"bytes4","internalType":"bytes4"}],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},{"type":"function","name":"symbol","inputs":[],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"type":"function","name":"tokenURI","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},{"type":"function","name":"transferFrom","inputs":[{"name":"from","type":"address","internalType":"address"},{"name":"to","type":"address","internalType":"address"},{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},{"type":"function","name":"transferOwnership","inputs":[{"name":"newOwner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"}];


export function ClaimComponent() {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect({ connector: new InjectedConnector() });
    const { disconnect } = useDisconnect();
    const { data: walletClient } = useWalletClient();

    const [txHash, setTxHash] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleClaim = async () => {
        if (!walletClient || !address || !PAYMASTER_URL) {
            alert("Please connect your wallet or check Paymaster URL in .env.local");
            return;
        }
        setLoading(true);
        setTxHash(null);

        try {
            const smartAccount = await signerToSimpleSmartAccount(createPublicClient({ transport: http() }), {
                signer: walletClient,
                entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
                factoryAddress: '0x9406Cc6185a346906296840746125a0E44976454',
            });

            const smartAccountClient = createSmartAccountClient({
                account: smartAccount,
                chain: baseSepolia,
                transport: http(PAYMASTER_URL),
            });

            const { request } = await smartAccountClient.prepareTransactionRequest({
                to: NFT_CONTRACT_ADDRESS,
                abi: contractAbi,
                functionName: 'claimNFT',
                value: 0n,
            });

            const userOpHash = await smartAccountClient.writeContract(request);

            setTxHash(userOpHash);
        } catch (error) {
            console.error("Error claiming NFT:", error);
            alert("An error occurred. Check the console for details.");
        } finally {
            setLoading(false);
        }
    };

    if (isConnected && address) {
        return (
            <div>
                <p>Connected: {address}</p>
                <button onClick={() => disconnect()}>Disconnect</button>
                <hr style={{ margin: '1rem 0' }} />
                <button onClick={handleClaim} disabled={loading} style={{ fontSize: '1.2rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                    {loading ? 'Claiming...' : 'Claim Your Free NFT'}
                </button>
                {txHash && (
                    <div style={{ marginTop: '1rem' }}>
                        <p>✅ Success! Your transaction is being processed.</p>
                        <a 
                            href={`https://sepolia.basescan.org/tx/${txHash}`} 
                            target="_blank" rel="noopener noreferrer">
                            View on BaseScan
                        </a>
                    </div>
                )}
            </div>
        );
    }

    return <button onClick={() => connect()} style={{ fontSize: '1.2rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Connect Wallet</button>;
}