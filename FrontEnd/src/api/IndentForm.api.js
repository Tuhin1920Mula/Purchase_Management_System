// ==============================
// 🌐 API Base URL Setup
// Same as your original format
// ==============================

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5173";

if (import.meta.env.MODE === "development") {
  console.log("🌐 API_BASE =", API_BASE);
}

/**
 * Generic API request helper (copied exactly from your pattern)
 */
export async function apiRequest(endpoint, method = "GET", data = null, queryParams = "") {
  try {
    let url = `${API_BASE}${endpoint}`;

    // Append query params if provided
    if (queryParams) {
      url += queryParams.startsWith("?") ? queryParams : `?${queryParams}`;
    }

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Log the request data before sending
    if (data) {
      console.log("📤 Sending Data to Backend:", data);
      options.body = JSON.stringify(data);
    }

    // Log the full request info
    console.log(`🔗 API Request → [${method}] ${url}`);

    const response = await fetch(url, options);

    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Request Failed [${method}] ${endpoint}:`, errorText);
      throw new Error(`HTTP ${response.status} - ${errorText}`);
    }

    // Handle empty responses (e.g., DELETE or 204 No Content)
    if (response.status === 204) {
      console.log("ℹ️ No content returned from API.");
      return null;
    }

    const result = await response.json();

    // Log the response received from backend
    console.log("✅ API Response:", result);

    return result;
  } catch (error) {
    console.error(`❌ API Error [${method}] ${endpoint}:`, error);
    throw error;
  }
}

// export async function getLatestUniqueId() {
//   return await apiRequest("/indent/latest/unique-id", "GET");
// }

export async function getLatestUniqueId() {
  const response = await apiRequest("/indent/latest/unique-id", "GET");

  console.log("Latest Unique ID from backend:", response);

  return response;
}

export async function getLatestLocalPurchaseUniqueId() {
  const response = await apiRequest("/indent/latest/localpurchase/unique-id", "GET");

  console.log("Latest Unique ID from backend:", response);

  return response;
}

// let globalChangedRows = {};  // stores last "changedRows" data

// export const setChangedRowsForLogging = (rows) => {
//   globalChangedRows = rows;  // update when purchase page sends data
// };

export const updatePurchaseRow = async (id, updatedData) => {
  try {
    // console.log("===============================================");
    // console.log("📤 ALL CHANGED ROWS BEING SENT:");
    // console.log(JSON.stringify(globalChangedRows, null, 2));
    // console.log("===============================================");

    // console.log("📤 CURRENT API CALL → Sending update to backend");
    // console.log("➡️ ID:", id);
    // console.log("➡️ Payload:", JSON.stringify(updatedData, null, 2));

    //const response = await axios.put(`/indent/purchase/update/${id}`, updatedData);
    const response = await apiRequest(`/indent/purchase/update/${id}`, "PUT", updatedData);

    console.log("✅ Backend Response:", response.data);
    console.log("===============================================");

    return response.data;
  } catch (error) {
    console.error("❌ Error updating purchase row:", error);
    throw error;
  }
};

export const updateLocalPurchaseRow = async (id, updatedData) => {
  try {
    // console.log("===============================================");
    // console.log("📤 ALL CHANGED ROWS BEING SENT:");
    // console.log(JSON.stringify(globalChangedRows, null, 2));
    // console.log("===============================================");

    // console.log("📤 CURRENT API CALL → Sending update to backend");
    // console.log("➡️ ID:", id);
    // console.log("➡️ Payload:", JSON.stringify(updatedData, null, 2));

    //const response = await axios.put(`/indent/purchase/update/${id}`, updatedData);
    const response = await apiRequest(`/indent/localpurchase/update/${id}`, "PUT", updatedData);

    console.log("✅ Backend Response:", response.data);
    console.log("===============================================");

    return response.data;
  } catch (error) {
    console.error("❌ Error updating purchase row:", error);
    throw error;
  }
};

/**
 * =====================================================
 * 📌 Indent Form API Functions (Same structure & logs)
 * =====================================================
 */

export async function createIndentForm(data) {
  console.log("📝 Creating Indent Form:", data);
  return await apiRequest("/indent", "POST", data);
}

export async function createLocalPurchaseForm(data) {
  console.log("📝 Creating Local Purchase Form:", data);
  return await apiRequest("/indent/localpurchase", "POST", data);
}

// export async function getAllIndentForms(queryParams = "") {
//   console.log("📥 Fetching All Indent Forms");
//   return await apiRequest("/indent", "GET", null, queryParams);
// }

export async function getAllIndentForms(role, username) {
  console.log("📥 Fetching All Indent Forms With Role & Username");
  return await apiRequest("/indent/all", "POST", role, username);
}

export async function getAllLocalPurchaseForms(role, username) {
  console.log("📥 Fetching All Local Purchase Forms With Role & Username");
  return await apiRequest("/indent/localpurchase/all", "POST", role, username);
}

export async function getIndentFormById(indentId) {
  console.log(`🔍 Fetching Indent Form → ID: ${indentId}`);
  return await apiRequest(`/indent/${indentId}`, "GET");
}

export async function updateIndentForm(indentId, data) {
  console.log(`✏️ Updating Indent Form → ID: ${indentId}`, data);
  return await apiRequest(`/indent/${indentId}`, "PUT", data);
}

export async function deleteIndentForm(indentId) {
  console.log(`🗑️ Deleting Indent Form → ID: ${indentId}`);
  return await apiRequest(`/indent/${indentId}`, "DELETE");
}

export async function approveIndentForm(indentId, approverData) {
  console.log(`✅ Approving Indent Form → ID: ${indentId}`, approverData);
  return await apiRequest(`/indent/${indentId}/approve`, "POST", approverData);
}

export async function rejectIndentForm(indentId, rejectionData) {
  console.log(`❌ Rejecting Indent Form → ID: ${indentId}`, rejectionData);
  return await apiRequest(`/indent/${indentId}/reject`, "POST", rejectionData);
}