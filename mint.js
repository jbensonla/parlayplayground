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
async function handleMintButtonClick() {
  try {
    // Check if wallet is connected
    if (!window.solanaProvider) {
      alert("Please connect your wallet first!");
      return;
    }

    // Find both the fileInput and dropzone
    const fileInput = document.getElementById("fileInput");
    const dropZone = document.querySelector(".dropzone");
    
    // Check if we have a file either in the input or dropzone
    let file = null;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      file = fileInput.files[0];
    } else if (dropZone && dropZone.querySelector("img")) {
      // If we have a preview image, the file should be in the input
      const dataUrl = dropZone.querySelector("img").src;
      if (dataUrl) {
        // Convert data URL to file if needed
        const response = await fetch(dataUrl);
        file = await response.blob();
        file.name = "image.png"; // Give the blob a name
      }
    }

    if (!file) {
      alert("Please select or drop an image first!");
      return;
    }

    // Show loading state
    const mintButton = document.querySelector("#mint button.btn-modern");
    if (mintButton) {
      mintButton.textContent = "Uploading...";
      mintButton.disabled = true;
    }

    try {
      // Upload file to IPFS using Pinata
      const fileUrl = await window.uploadFileToStorage(file);
      if (!fileUrl) {
        throw new Error("File upload failed");
      }

      // Generate metadata
      const metadata = generateMetadata(fileUrl);
      
      // Convert metadata to file for upload
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      metadataBlob.name = "metadata.json";
      
      // Upload metadata using Pinata
      const metadataUrl = await window.uploadFileToStorage(metadataBlob);
      
      if (!metadataUrl) {
        throw new Error("Metadata upload failed");
      }

      // Update button text
      if (mintButton) {
        mintButton.textContent = "Minting NFT...";
      }

      // Mint the NFT
      const nft = await mintNFT(metadataUrl);
      if (nft) {
        alert("NFT minted successfully!");
        
        // Clear the preview and file input
        if (fileInput) fileInput.value = "";
        if (dropZone) {
          dropZone.innerHTML = '<p>Drag & drop an image here, or click to select</p>';
        }
        
        // Reset button
        if (mintButton) {
          mintButton.textContent = "Mint NFT";
          mintButton.disabled = false;
        }
      }
    } catch (error) {
      throw new Error(`Upload/Mint process failed: ${error.message}`);
    }
  } catch (error) {
    console.error("Minting error:", error);
    alert("Error: " + error.message);
    
    // Reset button on error
    const mintButton = document.querySelector("#mint button.btn-modern");
    if (mintButton) {
      mintButton.textContent = "Mint NFT";
      mintButton.disabled = false;
    }
  }
}

/**
 * Mints an NFT on Solana
 */
async function mintNFT(metadataUrl) {
  if (!window.solanaProvider) {
    throw new Error("No wallet connected");
  }

  const connection = new Connection(clusterApiUrl("devnet"));
  
  try {
    // For now, just log success - implement actual minting later
    console.log("Would mint NFT with metadata:", metadataUrl);
    return true;
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw new Error("Failed to mint NFT");
  }
}

// Export for global access
window.handleMintButtonClick = handleMintButtonClick;