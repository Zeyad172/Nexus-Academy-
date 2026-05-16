import fs from "fs/promises";

/**
 * Safely deletes a file if it exists.
 * @param {string} filePath - Path to the file to delete.
 */
export const deleteFile = async (filePath) => {
    if (!filePath) return;
    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.error(`Error deleting file at ${filePath}:`, err);
        }
    }
};
