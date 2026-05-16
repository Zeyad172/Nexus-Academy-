import { driveConfig, PARENT_FOLDER_ID } from "../config/drive.config.js";
import fs from "fs";
import { deleteFile } from "../utils/file.js";
import axios from "axios";

const metadataCache = new Map();

export const uploadUrlToDrive = async (url, fileName, retries = 3) => {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            const responseStream = await axios({
                method: "get",
                url: url,
                responseType: "stream",
            });

            const mimeType = responseStream.headers["content-type"];

            const response = await driveConfig.files.create({
                requestBody: {
                    name: fileName,
                    parents: [PARENT_FOLDER_ID],
                },
                media: {
                    mimeType: mimeType,
                    body: responseStream.data,
                },
                fields: "id, size, mimeType",
            });

            const { id: fileId, size, mimeType: driveMimeType } = response.data;
            metadataCache.set(fileId, { size: parseInt(size, 10), mimeType: driveMimeType });

            return { fileId };
        } catch (error) {
            lastError = error;
            console.warn(`Drive URL upload failed, retrying (${i + 1}/${retries})...`);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    throw lastError;
};

export const uploadToDrive = async (file, retries = 3) => {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await driveConfig.files.create({
                requestBody: {
                    name: file.originalname,
                    parents: [PARENT_FOLDER_ID],
                },
                media: {
                    mimeType: file.mimetype,
                    body: fs.createReadStream(file.path),
                },
                fields: "id, size, mimeType",
            });

            const { id: fileId, size, mimeType: driveMimeType } = response.data;
            metadataCache.set(fileId, { size: parseInt(size, 10), mimeType: driveMimeType });

            await deleteFile(file.path);

            return { fileId };
        } catch (error) {
            lastError = error;
            console.warn(`Drive upload failed, retrying (${i + 1}/${retries})...`);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    
    await deleteFile(file.path);
    throw lastError;
};

export const getDriveStream = async (fileId, rangeHeader = null) => {
    let metadata = metadataCache.get(fileId);

    if (!metadata) {
        const { data } = await driveConfig.files.get({
            fileId,
            fields: "size, mimeType",
        });
        metadata = { size: parseInt(data.size, 10), mimeType: data.mimeType };
        metadataCache.set(fileId, metadata);
    }

    const fileSize = metadata.size;
    const options = { fileId, alt: "media" };
    const requestConfig = { responseType: "stream" };

    if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const CHUNK_SIZE = 5 * 1024 * 1024; 
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : Math.min(start + CHUNK_SIZE - 1, fileSize - 1);

        requestConfig.headers = { Range: `bytes=${start}-${end}` };
        return {
            streamConfig: { start, end, fileSize, mimeType: metadata.mimeType },
            options,
            requestConfig,
        };
    }

    return {
        streamConfig: { fileSize, mimeType: metadata.mimeType },
        options,
        requestConfig,
    };
};

export const deleteFromDrive = async (fileId, retries = 3) => {
    metadataCache.delete(fileId);
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            await driveConfig.files.delete({
                fileId: fileId,
            });
            return { message: "File deleted successfully" };
        } catch (error) {
            lastError = error;
            if (error.code === 404) {
                return { message: "File already deleted or not found" };
            }
            console.warn(`Drive delete failed for ${fileId}, retrying (${i + 1}/${retries})...`);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    throw lastError;
};
