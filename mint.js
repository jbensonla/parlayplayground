"use strict";

// mint.js

// Remove the imports since we'll load these via CDN
const Connection = window.solanaWeb3.Connection;
const clusterApiUrl = window.solanaWeb3.clusterApiUrl;

/**
 * Generates the metadata JSON dynamically using the provided image URL.
 */
function generateMetadata(imageUrl) {
  return {
    name: "Parlay Playground NFT",
    description: "Immortalize your trading wins/losses on the Solana blockchain.",
    image: imageUrl,
    attributes: [
      { trait_type: "Platform", value: "Parlay Playground" }
    ],
    seller_fee_basis_points: 500
  };
}

/**
 * Main function to handle the Mint button click.
 */
async function handleMintButtonClick(event) {
  try {
    const mintButton = document.getElementById('mint-button');
    if (!mintButton) {
      throw new Error('Mint button not found');
    }

    mintButton.textContent = 'Minting...';
    mintButton.disabled = true;

    // Upload file to Pinata first
    const fileHash = await uploadFileToStorage();
    if (!fileHash) {
      throw new Error('Failed to upload file');
    }

    console.log('File uploaded with hash:', fileHash);

    // Clear the dropzone
    const dropzone = document.querySelector('.dropzone');
    if (dropzone) {
      dropzone.innerHTML = '<p>Drag and drop your image here, or click to select</p>';
    }

    // Reset the file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.value = '';
    }

    // Clear the global file reference
    window.fileToUpload = null;

    // Show success message
    showSuccessMessage('NFT minted successfully! 🎉');

    // Refresh the carousel to show the new NFT
    fetchRecentNFTs();

    // Optional: Trigger confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

  } catch (error) {
    console.error('Minting error:', error);
    alert('Failed to mint NFT: ' + error.message);
  } finally {
    const mintButton = document.getElementById('mint-button');
    if (mintButton) {
      mintButton.textContent = 'Mint NFT';
      mintButton.disabled = false;
    }
  }
}

/**
 * Mints an NFT on Solana.
 */
async function mintNFT(metadataUrl) {
  if (!window.solanaProvider) {
    throw new Error("No wallet connected");
  }

  const connection = new Connection(clusterApiUrl("devnet"));
  
  try {
    // For now, simply log success; implement actual minting logic here
    console.log("Would mint NFT with metadata:", metadataUrl);
    return true;
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw new Error("Failed to mint NFT");
  }
}

// Function to upload file to Pinata/IPFS
async function uploadFileToStorage() {
  try {
    if (!window.fileToUpload) {
      throw new Error('No file selected');
    }

    const formData = new FormData();
    formData.append('file', window.fileToUpload);

    // Add metadata
    const metadata = JSON.stringify({
      name: window.fileToUpload.name,
      keyvalues: {
        app: 'ParlayPlayground'
      }
    });
    formData.append('pinataMetadata', metadata);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': '90eab8c615dad49c1381',
        'pinata_secret_api_key': '96f9ce3cecf5835ce1824ef5bd0315662c467b5c3ea4dff7d4e6495d91d6e783'
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.details || 'Upload failed');
    }

    const result = await response.json();
    console.log('File uploaded successfully:', result);
    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading to storage:', error);
    throw error;
  }
}

// Function to show success message
function showSuccessMessage(message) {
  // Create success message element
  const successMessage = document.createElement('div');
  successMessage.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #4CAF50;
    color: white;
    padding: 15px 25px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.5s ease-out;
  `;
  successMessage.textContent = message;

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

  // Add to document
  document.body.appendChild(successMessage);

    // Remove after 3 seconds
    setTimeout(() => {
        successMessage.style.animation = 'slideOut 0.5s ease-in';
        setTimeout(() => {
            if (successMessage.parentNode) {
                document.body.removeChild(successMessage);
            }
        }, 500); // Wait for slideOut animation to complete
    }, 3000);
}

// Modified event listener setup
document.addEventListener('DOMContentLoaded', () => {
  const mintButton = document.getElementById('mint-button'); // Changed to match HTML ID
  if (mintButton) {
    console.log('Mint button found, adding click listener');
    mintButton.addEventListener('click', handleMintButtonClick);
  } else {
    console.error('Mint button not found - check the button ID in your HTML');
  }
});

// Update the carousel item creation in your fetchRecentNFTs function
const item = document.createElement("div");
item.className = "carousel-item";
item.innerHTML = `
    <img src="${imageUrl}" alt="${pin.metadata?.name || "NFT"}" onerror="this.src='images/placeholder.png'">
    <div class="nft-info">
        <p class="nft-title">${formatFileName(pin.metadata?.name || "Untitled NFT")}</p>
        <div class="nft-details">
            <span class="trader">👤 Anonymous</span>
            <span class="value">💎 Priceless</span>
        </div>
    </div>
`;

// Add this helper function to format the file name
function formatFileName(fileName) {
    // Remove timestamp and file extension
    return fileName
        .replace(/Screenshot \d{4}-\d{2}-\d{2} at \d{2}\.\d{2}\.\d{2}.*\.png/i, 'Trade Screenshot')
        .replace(/\.png$/, '')
        .trim();
}
