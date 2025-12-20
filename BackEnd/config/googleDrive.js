import { google } from "googleapis";
import fs from "fs";

const auth = new google.auth.GoogleAuth({
  keyFile: "config/googleDrive.service.json", // service account json
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({
  version: "v3",
  auth,
});

export const uploadToGoogleDrive = async (file, rowId) => {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: `comparison_${rowId}.pdf`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: file.mimetype,
        body: Buffer.from(file.buffer),
      },
      fields: "id, webViewLink",
    });

    const fileId = response.data.id;

    // Make file public (view-only)
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    return response.data.webViewLink;
  } catch (error) {
    console.error("❌ Google Drive Upload Error:", error);
    throw error;
  }
};