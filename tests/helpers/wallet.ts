import { ethers } from 'ethers';

// 1. Generate a random wallet for testing
const wallet = ethers.Wallet.createRandom();
console.log('🧪 Testing Wallet Generated:');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);

// 2. Function to sign a nonce
export const signNonce = async (nonce: string, privateKey: string) => {
    const signer = new ethers.Wallet(privateKey);
    // Ethers v6 signMessage automatically handles the prefix
    return await signer.signMessage(nonce);
};

// 3. Export wallet for use in test scripts
export const testWallet = wallet;
