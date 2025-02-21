// upload.js

// Pinata API Keys
const PINATA_API_KEY = "90eab8c615dad49c1381";
const PINATA_SECRET_KEY = "96f9ce3cecf5835ce1824ef5bd0315662c467b5c3ea4dff7d4e6495d91d6e783";

/**
 * Sets up drag-and-drop event listeners for the dropzone.
 */
function initDropZone() {
  const dropZone = document.querySelector(".dropzone");
  const fileInput = document.getElementById("fileInput");

  if (!dropZone || !fileInput) {
    console.error("Dropzone or file input elements not found");
    return;
  }

  // Preview function
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

  // Direct click on dropzone
  dropZone.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    fileInput.click();
  };

  // File input change handler
  fileInput.onchange = function(e) {
    if (this.files && this.files[0]) {
      displayPreview(this.files[0]);
      console.log("File selected:", this.files[0]);
    }
  };

  // Drag and drop handlers
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
 */
async function uploadFileToStorage(file) {
  try {
    console.log("Attempting to upload file:", file.name, "Size:", file.size);

    // Create a proper named File object if we got a Blob
    if (file instanceof Blob && !(file instanceof File)) {
      file = new File([file], `pplay_${Date.now()}.${file.type.split('/')[1] || 'png'}`, {
        type: file.type
      });
    }

    const formData = new FormData();
    formData.append('file', file);

    // Add metadata to help with file organization
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        app: "ParlayPlayground",
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    // Add options to customize pinning
    const options = JSON.stringify({
      cidVersion: 1
    });
    formData.append('pinataOptions', options);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      },
      body: formData
    });

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

    // Use Pinata gateway for better reliability
    const ipfsURL = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    console.log("File uploaded to IPFS:", ipfsURL);
    return ipfsURL;
  } catch (error) {
    console.error("Detailed error uploading file:", error);
    alert(`Error uploading file: ${error.message}`);
    return null;
  }
}

// Make upload function available globally
window.uploadFileToStorage = uploadFileToStorage;

// Initialize dropzone when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initDropZone();
  console.log("Dropzone initialized with improved handlers");
});