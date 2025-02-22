"use strict";

// wallet.js

// Global variable to store the connected wallet provider
window.solanaProvider = null;

// Add detailed logging
let isInitialized = false;

/**
 * Connects to the user's Solana wallet (Phantom by default).
 * Returns the provider object if successful.
 */
async function connectWallet() {
    console.log('Connect wallet function called');

    // Check if Phantom is installed
    const isPhantomInstalled = window.solana && window.solana.isPhantom;
    console.log('Phantom installed:', isPhantomInstalled);

    if (!isPhantomInstalled) {
        alert("Please install Phantom wallet from https://phantom.app/");
        window.open("https://phantom.app/", "_blank");
        return null;
    }

    try {
        const provider = window.solana;
        console.log('Attempting to connect to wallet...');

        // Request connection
        const response = await provider.connect();
        console.log('Connection response:', response);

        const publicKey = response.publicKey.toString();
        console.log('Connected to wallet:', publicKey);

        // Update button state
        const connectBtn = document.querySelector('.connect-wallet-btn');
        if (connectBtn) {
            connectBtn.textContent = `Connected: ${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
            connectBtn.classList.add('connected');
        }

        // Store provider globally
        window.solanaProvider = provider;
        return provider;

    } catch (err) {
        console.error('Wallet connection error:', err);
        alert(`Failed to connect wallet: ${err.message}`);
        return null;
    }
}

/**
 * Utility function to check if a wallet is connected.
 */
function isWalletConnected() {
  return !!window.solanaProvider;
}

// Initialize wallet connection handler
function initializeWallet() {
    if (isInitialized) return;
    
    console.log('Initializing wallet connection...');
    
    const connectWalletBtn = document.querySelector('.connect-wallet-btn');
    if (connectWalletBtn) {
        console.log('Found wallet button, adding click listener');
        
        connectWalletBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Wallet button clicked');
            await connectWallet();
        });
        
        isInitialized = true;
    } else {
        console.error('Connect wallet button not found!');
    }
}

// Make sure DOM is loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWallet);
} else {
    initializeWallet();
}

// Export functions for global use
window.connectWallet = connectWallet;
window.isWalletConnected = isWalletConnected;
window.initializeWallet = initializeWallet;
