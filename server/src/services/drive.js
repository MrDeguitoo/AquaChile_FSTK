import { google } from 'googleapis';

// const SCOPES = ['https://www.googleapis.com/auth/drive.file']; // Defined inline where used

let authClient = null;

/**
 * Get authenticated Google OAuth2 client for Drive
 * @returns {Promise<OAuth2Client>} Authenticated client
 */
export async function getAuthClient() {
  if (authClient) {
    return authClient;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in .env');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    await oauth2Client.getAccessToken();
    authClient = oauth2Client;
    return authClient;
  } catch (error) {
    console.error('Failed to authenticate with Google Drive:', error);
    throw new Error(`Google Drive authentication failed: ${error.message}`);
  }
}

/**
 * Upload a file to Google Drive
 * @param {Object} options - Upload options
 * @param {string} options.name - File name
 * @param {string} options.mimeType - MIME type
 * @param {Buffer|Readable} options.content - File content
 * @param {string} [options.folderId] - Parent folder ID (defaults to GOOGLE_DRIVE_FOLDER_ID)
 * @returns {Promise<Object>} Upload result with file info
 */
export async function uploadFile({ name, mimeType, content, folderId }) {
  const auth = await getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const parentFolder = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!parentFolder) {
    throw new Error('No folder ID provided. Set GOOGLE_DRIVE_FOLDER_ID in .env or pass folderId parameter.');
  }

  try {
    const response = await drive.files.create({
      requestBody: {
        name,
        parents: [parentFolder],
      },
      media: {
        mimeType,
        body: content,
      },
      fields: 'id,name,size,mimeType,webViewLink,webContentLink,createdTime',
    });

    return { success: true, file: response.data };
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload a file from a local path
 * @param {string} filePath - Local file path
 * @param {string} [folderId] - Parent folder ID
 * @returns {Promise<Object>} Upload result
 */
export async function uploadFileFromPath(filePath, folderId) {
  const fs = await import('fs');
  const content = fs.createReadStream(filePath);
  const name = filePath.split('/').pop().split('\\').pop(); // Handle both Unix and Windows paths
  const mimeType = getMimeType(name);
  return uploadFile({ name, mimeType, content, folderId });
}

/**
 * Get MIME type from file extension
 * @param {string} filename - File name
 * @returns {string} MIME type
 */
function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Download a file from Google Drive
 * @param {string} fileId - File ID
 * @returns {Promise<Object>} File content and metadata
 */
export async function downloadFile(fileId) {
  const auth = await getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  try {
    // Get file metadata
    const metadataResponse = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime',
    });

    // Get file content
    const contentResponse = await drive.files.get({
      fileId,
      alt: 'media',
    }, { responseType: 'stream' });

    return {
      success: true,
      metadata: metadataResponse.data,
      content: contentResponse.data,
    };
  } catch (error) {
    console.error('Error downloading file from Google Drive:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a file from Google Drive
 * @param {string} fileId - File ID
 * @returns {Promise<Object>} Delete result
 */
export async function deleteFile(fileId) {
  const auth = await getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  try {
    await drive.files.delete({ fileId });
    return { success: true };
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a shareable link for a file
 * @param {string} fileId - File ID
 * @param {boolean} [anyoneWithLink=true] - Make accessible to anyone with link
 * @returns {Promise<Object>} Link info
 */
export async function getFileLink(fileId, anyoneWithLink = true) {
  const auth = await getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  try {
    if (anyoneWithLink) {
      // Create permission for anyone with link
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    }

    // Get the file with link fields
    const response = await drive.files.get({
      fileId,
      fields: 'id,name,webViewLink,webContentLink',
    });

    return {
      success: true,
      link: response.data.webViewLink,
      downloadLink: response.data.webContentLink,
    };
  } catch (error) {
    console.error('Error getting file link:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a folder in Google Drive
 * @param {string} name - Folder name
 * @param {string} [parentId] - Parent folder ID
 * @returns {Promise<Object>} Created folder info
 */
export async function createFolder(name, parentId) {
  const auth = await getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const folderParentId = parentId || process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderParentId) {
    throw new Error('No parent folder ID provided. Set GOOGLE_DRIVE_FOLDER_ID in .env or pass parentId parameter.');
  }

  try {
    const response = await drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderParentId],
      },
      fields: 'id,name,webViewLink',
    });

    return { success: true, folder: response.data };
  } catch (error) {
    console.error('Error creating folder in Google Drive:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a folder for a candidate (named with RUT + name)
 * @param {Object} candidato - Candidate data
 * @returns {Promise<Object>} Created folder info
 */
export async function createCandidateFolder(candidato) {
  const folderName = `${candidato.rut || candidato.id} - ${candidato.nombre}`;
  return createFolder(folderName);
}

/**
 * List files in a folder
 * @param {string} folderId - Folder ID
 * @param {number} [maxResults=100] - Maximum results
 * @returns {Promise<Object>} List of files
 */
export async function listFiles(folderId, maxResults = 100) {
  const auth = await getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      maxResults,
      fields: 'files(id,name,mimeType,size,webViewLink,createdTime)',
      orderBy: 'createdTime desc',
    });
    return { success: true, files: response.data.files || [] };
  } catch (error) {
    console.error('Error listing files in Google Drive:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload CV file for a candidate
 * @param {Object} file - Multer file object
 * @param {Object} candidato - Candidate data
 * @returns {Promise<Object>} Upload result with file info
 */
export async function uploadCandidateCV(file, candidato) {
  // Create or get candidate folder
  let folderResult = await createCandidateFolder(candidato);

  if (!folderResult.success) {
    // Folder might already exist, try to find it
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const listResult = await listFiles(rootFolderId);
    if (listResult.success) {
      const existingFolder = listResult.files.find(f =>
        f.name.includes(candidato.rut || candidato.id) && f.name.includes(candidato.nombre)
      );
      if (existingFolder) {
        folderResult = { success: true, folder: existingFolder };
      }
    }
  }

  if (!folderResult.success) {
    return { success: false, error: 'Could not create or find candidate folder' };
  }

  // Upload the CV
  const fileName = `CV_${candidato.nombre.replace(/\s+/g, '_')}_${Date.now()}${getFileExtension(file.originalname)}`;
  return uploadFile({
    name: fileName,
    mimeType: file.mimetype,
    content: file.buffer,
    folderId: folderResult.folder.id,
  });
}

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} Extension with dot
 */
function getFileExtension(filename) {
  const ext = filename.split('.').pop();
  return ext ? `.${ext}` : '';
}

export default {
  getAuthClient,
  uploadFile,
  uploadFileFromPath,
  downloadFile,
  deleteFile,
  getFileLink,
  createFolder,
  createCandidateFolder,
  listFiles,
  uploadCandidateCV,
};