"use strict";

// upload.js

// Note: For security, consider moving API keys to a secure backend instead of exposing them in client-side code.
const PINATA_API_KEY = "90eab8c615dad49c1381";
const PINATA_SECRET_KEY = "96f9ce3cecf5835ce1824ef5bd0315662c467b5c3ea4dff7d4e6495d91d6e783";

/**
 * Sets up drag-and-drop event listeners for the dropzone.
 */
function initDropZone() {
  const dropZone = document.querySelector(".dropzone");
  const fileInput = document.getElementById("fileInput");
  const uploadButton = document.querySelector(".upload-btn");

  if (!dropZone || !fileInput) {
    console.error("Dropzone or file input elements not found");
    return;
  }

  // Preview function to display the selected image
  function displayPreview(file) {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        dropZone.innerHTML = `
          <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; margin: 10px;">
          <p>Image ready for minting</p>
        `;
      };
      reader.readAsDataURL(file);
    }
  }

  // Add explicit click handler for upload button
  if (uploadButton) {
    uploadButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
      console.log("Upload button clicked");
    });
  }

  // File input change handler
  fileInput.addEventListener('change', function(e) {
    console.log("File input change event triggered");
    if (this.files && this.files[0]) {
      displayPreview(this.files[0]);
      console.log("File selected:", this.files[0]);
    }
  });

  // Drag and drop event handlers
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.background = "#fff";
    dropZone.style.borderColor = "#e50914";
  });

  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.background = "#f9f9f9";
    dropZone.style.borderColor = "#ccc";
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.background = "#f9f9f9";
    dropZone.style.borderColor = "#ccc";
    
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      fileInput.files = e.dataTransfer.files;
      displayPreview(file);
      console.log("File dropped:", file);
    }
  });
}

/**
 * Uploads a file to Pinata and returns the IPFS URL.
 * @param {File|Blob} file - The file or blob to upload.
 * @param {string} [traderAddress="Unknown"] - The trader's Solana wallet address.
 */
async function uploadFileToStorage(file, traderAddress = "Unknown") {
  try {
    console.log("Attempting to upload file:", file.name, "Size:", file.size);
    console.log("Trader address:", traderAddress);

    // If a Blob is provided, convert it to a proper File object
    if (file instanceof Blob && !(file instanceof File)) {
      file = new File([file], `pplay_${Date.now()}.${file.type.split('/')[1] || 'png'}`, {
        type: file.type
      });
    }

    const formData = new FormData();
    formData.append('file', file);

    // Add metadata for file organization
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        app: "ParlayPlayground",
        trader: traderAddress,
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    // Add options for pinning
    const options = JSON.stringify({
      cidVersion: 1
    });
    formData.append('pinataOptions', options);

    const response = await fetch(
        "https://api.pinata.cloud/data/pinList?status=pinned&metadata[keyvalues].app=ParlayPlayground",
        {
          method: "GET",
          headers: {
            "pinata_api_key": "...",
            "pinata_secret_api_key": "..."
          }
        }
      );      

    console.log("Pinata response status:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Pinata error response:", errorData);
      
      if (response.status === 401) {
        alert("Authentication failed. Please check your Pinata API keys.");
      } else {
        throw new Error(`Upload failed! Status: ${response.status}`);
      }
      return null;
    }

    const data = await response.json();
    console.log("Pinata response data:", data);

    // Construct the IPFS URL using Pinata's gateway
    const ipfsURL = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    console.log("File uploaded to IPFS:", ipfsURL);
    return ipfsURL;
  } catch (error) {
    console.error("Detailed error uploading file:", error);
    alert(`Error uploading file: ${error.message}`);
    return null;
  }
}

// Make the upload function globally available
window.uploadFileToStorage = uploadFileToStorage;

// Initialize the dropzone once the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initDropZone();
  console.log("Dropzone initialized with improved handlers");
});

// Function to reset dropzone
function resetDropzone() {
    const dropzone = document.querySelector('.dropzone');
    if (dropzone) {
        dropzone.innerHTML = '<p>Drag and drop your image here, or click to select</p>';
        dropzone.classList.remove('highlight');
    }
}

// Function to upload file to Pinata
async function uploadToPinata(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add metadata
        const metadata = JSON.stringify({
            name: file.name,
            keyvalues: {
                app: 'ParlayPlayground'
            }
        });
        formData.append('pinataMetadata', metadata);

        // Options for pinning
        const pinataOptions = JSON.stringify({
            cidVersion: 0
        });
        formData.append('pinataOptions', pinataOptions);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                // Remove any Content-Type header - let the browser set it with the FormData boundary
                'pinata_api_key': '90eab8c615dad49c1381',
                'pinata_secret_api_key': '96f9ce3cecf5835ce1824ef5bd0315662c467b5c3ea4dff7d4e6495d91d6e783'
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Pinata Error:', errorData);
            throw new Error(errorData.error?.details || 'Upload failed');
        }

        const result = await response.json();
        console.log('File uploaded to Pinata:', result);
        
        // Reset the dropzone after successful upload
        resetDropzone();
        
        return result.IpfsHash;
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw error;
    }
}

// Handle file drop
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    handleFiles(files);
}

// Handle file selection
function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            displayPreview(file);
            // Store the file for later upload
            window.fileToUpload = file;
        } else {
            alert('Please upload an image file.');
        }
    }
}

// Display image preview
function displayPreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const dropZone = document.querySelector('.dropzone');
        dropZone.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 200px;">`;
    };
    reader.readAsDataURL(file);
}

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.querySelector('.dropzone').addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop zone when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    document.querySelector('.dropzone').addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    document.querySelector('.dropzone').addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    document.querySelector('.dropzone').classList.add('highlight');
}

function unhighlight(e) {
    document.querySelector('.dropzone').classList.remove('highlight');
}

// Add click handler to dropzone
document.querySelector('.dropzone').addEventListener('click', function(e) {
    document.querySelector('#fileInput').click();
});

// Handle file input change
document.querySelector('#fileInput').addEventListener('change', function(e) {
    handleFiles(this.files);
});

// Add drop handler
document.querySelector('.dropzone').addEventListener('drop', handleDrop, false);
