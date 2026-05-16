import { spawn } from "child_process";

export const getVideoDuration = (filePath) => {
    return new Promise((resolve, reject) => {
        const ffprobe = spawn("ffprobe", [
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            filePath
        ]);

        let output = "";
        ffprobe.stdout.on("data", (data) => {
            output += data.toString();
        });

        ffprobe.on("close", (code) => {
            if (code !== 0) {
                console.error("ffprobe exited with code:", code);
                reject(new Error("Failed to extract video duration"));
                return;
            }

            try {
                const metadata = JSON.parse(output);
                const duration = parseFloat(metadata.format?.duration || 0);
                resolve(isNaN(duration) ? 0 : Math.floor(duration));
            } catch (err) {
                reject(new Error("Failed to parse video duration"));
            }
        });

        ffprobe.on("error", (err) => {
            console.error("ffprobe spawn error:", err);
            reject(new Error("ffprobe not available"));
        });
    });
};
