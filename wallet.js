"use strict";

// wallet.js

// Global variable to store the connected wallet provider
window.solanaProvider = null;

/**
 * Connects to the user's Solana wallet (Phantom by default).
 * Returns the provider object if successful.
 */
async function connectWallet() {
  if ("solana" in window) {
    const provider = window.solana;
    if (provider.isPhantom) {
      try {
        const resp = await provider.connect();
        console.log("Wallet connected:", resp.publicKey.toString());
        
        // Update the global provider
        window.solanaProvider = provider;
        
        // Update UI
        const connectBtn = document.getElementById("connectWalletBtn");
        if (connectBtn) {
          connectBtn.textContent = "Wallet Connected";
          connectBtn.disabled = true;
        }

        alert(`Connected to wallet: ${resp.publicKey.toString()}`);
        return provider;
      } catch (err) {
        console.error("Wallet connection error:", err);
        alert("Failed to connect wallet. Please try again.");
        return null;
      }
    } else {
      alert("Phantom wallet not found. Please install it from https://phantom.app");
      return null;
    }
  } else {
    alert("Solana object not found. Install a Solana wallet (Phantom or similar).");
    return null;
  }
}

/**
 * Utility function to check if a wallet is connected.
 */
function isWalletConnected() {
  return !!window.solanaProvider;
}

// Make the wallet functions globally available
window.connectWallet = connectWallet;
window.isWalletConnected = isWalletConnected;
