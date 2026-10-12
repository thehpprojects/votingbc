import axios from "axios";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

const PINATA_UPLOAD_URL = "https://uploads.pinata.cloud/v3/files";

const IPFS_GATEWAY =
  import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

export const uploadFileToIPFS = async (file) => {
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT is missing.");
  }

  if (!file) {
    throw new Error("No file selected.");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(PINATA_UPLOAD_URL, formData, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    });

    return response.data.data.cid;
  } catch (error) {
    console.error(
      "Pinata file upload failed:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message || "Failed to upload image to IPFS.",
    );
  }
};

export const uploadJSONToIPFS = async (metadata) => {
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT is missing.");
  }

  try {
    const blob = new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    });

    const formData = new FormData();
    formData.append("file", blob, "candidate-metadata.json");

    const response = await axios.post(PINATA_UPLOAD_URL, formData, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    });

    return response.data.data.cid;
  } catch (error) {
    console.error(
      "Pinata metadata upload failed:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        "Failed to upload candidate metadata to IPFS.",
    );
  }
};

export const getIPFSUrl = (cid) => {
  if (!cid) return "";

  if (cid.startsWith("http")) {
    return cid;
  }

  const cleanCID = cid.replace("ipfs://", "");

  return `${IPFS_GATEWAY}${cleanCID}`;
};
