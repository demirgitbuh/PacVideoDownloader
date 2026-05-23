#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const https = require("node:https");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const rootDirectory = path.resolve(__dirname, "..");
const binDirectory = path.join(rootDirectory, "vendor", "bin");
const tempRoot = path.join(os.tmpdir(), "pacv-postinstall");

const isWindows = process.platform === "win32";
const isMac = process.platform === "darwin";
const isLinux = process.platform === "linux";

const ytdlpName = isWindows ? "yt-dlp.exe" : "yt-dlp";
const ffmpegName = isWindows ? "ffmpeg.exe" : "ffmpeg";

const log = (message) => {
  process.stdout.write(`pacv postinstall: ${message}\n`);
};

const exists = async (target) => {
  try {
    await fsp.access(target);
    return true;
  } catch {
    return false;
  }
};

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "ignore", windowsHide: true });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with ${code}`));
      }
    });
  });

const download = (url, destination) =>
  new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": "PacVideoDownloader"
        }
      },
      (response) => {
        if (response.statusCode !== undefined && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location !== undefined) {
          response.resume();
          download(response.headers.location, destination).then(resolve, reject);
          return;
        }

        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`${url} returned ${response.statusCode ?? "unknown"}`));
          return;
        }

        const file = fs.createWriteStream(destination);
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
        file.on("error", reject);
      }
    );
    request.on("error", reject);
  });

const ytdlpUrl = () => {
  if (isWindows) {
    return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";
  }

  if (isMac) {
    return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos";
  }

  return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";
};

const ffmpegUrl = () => {
  if (isWindows) {
    return "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip";
  }

  if (isMac) {
    return "https://evermeet.cx/ffmpeg/getrelease/zip";
  }

  return "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz";
};

const findBinary = async (directory, name) => {
  const entries = await fsp.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isFile() && entry.name.toLowerCase() === name.toLowerCase()) {
      return entryPath;
    }

    if (entry.isDirectory()) {
      const found = await findBinary(entryPath, name);
      if (found !== null) {
        return found;
      }
    }
  }

  return null;
};

const installYtDlp = async () => {
  const destination = path.join(binDirectory, ytdlpName);
  if (await exists(destination)) {
    log("yt-dlp already installed");
    return;
  }

  log("installing yt-dlp");
  await download(ytdlpUrl(), destination);
  if (!isWindows) {
    await fsp.chmod(destination, 0o755);
  }
};

const installFfmpeg = async () => {
  const destination = path.join(binDirectory, ffmpegName);
  if (await exists(destination)) {
    log("ffmpeg already installed");
    return;
  }

  log("installing ffmpeg");
  const tempDirectory = await fsp.mkdtemp(path.join(tempRoot, "ffmpeg-"));
  const archive = path.join(tempDirectory, isLinux ? "ffmpeg.tar.xz" : "ffmpeg.zip");

  try {
    await download(ffmpegUrl(), archive);
    if (isLinux) {
      await run("tar", ["-xJf", archive, "-C", tempDirectory]);
    } else if (isMac) {
      await run("unzip", ["-q", archive, "-d", tempDirectory]);
    } else {
      await run("tar", ["-xf", archive, "-C", tempDirectory]);
    }

    const found = await findBinary(tempDirectory, ffmpegName);
    if (found === null) {
      throw new Error("ffmpeg binary missing from archive");
    }

    await fsp.copyFile(found, destination);
    if (!isWindows) {
      await fsp.chmod(destination, 0o755);
    }
  } finally {
    await fsp.rm(tempDirectory, { recursive: true, force: true });
  }
};

const main = async () => {
  await fsp.mkdir(binDirectory, { recursive: true });
  await fsp.mkdir(tempRoot, { recursive: true });
  await installYtDlp();
  await installFfmpeg();
  log("binary dependencies ready");
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`pacv postinstall failed: ${message}\n`);
  process.exit(1);
});
