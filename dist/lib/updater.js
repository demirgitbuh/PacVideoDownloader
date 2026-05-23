import chalk from "chalk";
import { chmod, copyFile, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execa } from "execa";
import { en } from "../locales/en.js";
import { ensureDirectory, getManagedBinaryDir } from "./paths.js";
import { patchConfig } from "./config.js";
const sixHoursMs = 6 * 60 * 60 * 1000;
const pacvRepo = "demirgitbuh/pacvideodownloader";
const ytdlpRepo = "yt-dlp/yt-dlp";
const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const stringValue = (record, key) => {
    const value = record[key];
    return typeof value === "string" ? value : "";
};
const errorMessage = (error) => (error instanceof Error ? error.message : String(error));
export const compareSemver = (left, right) => {
    const normalize = (version) => version
        .replace(/^v/i, "")
        .split(".")
        .map((part) => Number.parseInt(part, 10))
        .map((part) => (Number.isFinite(part) ? part : 0));
    const leftParts = normalize(left);
    const rightParts = normalize(right);
    const length = Math.max(leftParts.length, rightParts.length, 3);
    for (let index = 0; index < length; index += 1) {
        const leftPart = leftParts[index] ?? 0;
        const rightPart = rightParts[index] ?? 0;
        if (leftPart > rightPart) {
            return 1;
        }
        if (leftPart < rightPart) {
            return -1;
        }
    }
    return 0;
};
export const fetchLatestRelease = async (repo) => {
    const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
        headers: { Accept: "application/vnd.github+json", "User-Agent": "PacVideoDownloader" }
    });
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
    const json = (await response.json());
    if (!isRecord(json)) {
        throw new Error(en.update.failed);
    }
    return {
        tagName: stringValue(json, "tag_name"),
        name: stringValue(json, "name"),
        body: stringValue(json, "body"),
        htmlUrl: stringValue(json, "html_url")
    };
};
export const checkPacvUpdate = async (config, currentVersion) => {
    if (!config.checkUpdatesOnStartup) {
        return { checked: false, available: false };
    }
    const now = Date.now();
    const lastCheck = config.lastUpdateCheck !== undefined ? Date.parse(config.lastUpdateCheck) : 0;
    if (Number.isFinite(lastCheck) && now - lastCheck < sixHoursMs && config.latestVersion !== undefined) {
        return {
            checked: true,
            available: compareSemver(currentVersion, config.latestVersion) < 0,
            latestVersion: config.latestVersion
        };
    }
    try {
        const release = await fetchLatestRelease(pacvRepo);
        const latestVersion = release.tagName.replace(/^v/i, "");
        await patchConfig({ lastUpdateCheck: new Date(now).toISOString(), latestVersion });
        return {
            checked: true,
            available: compareSemver(currentVersion, latestVersion) < 0,
            latestVersion
        };
    }
    catch (error) {
        await patchConfig({ lastUpdateCheck: new Date(now).toISOString() });
        return { checked: true, available: false, error: errorMessage(error) };
    }
};
export const readPackageVersion = async (projectRoot) => {
    const raw = await readFile(path.join(projectRoot, "package.json"), "utf8");
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) {
        return "0.0.0";
    }
    return stringValue(parsed, "version") || "0.0.0";
};
const printStep = (message) => {
    console.log(`${chalk.hex("#FF6B2B")("→")} ${message}...`);
};
const printSuccess = (message) => {
    console.log(`${chalk.green(en.symbols.success)} ${message}`);
};
const printFailure = (message) => {
    console.log(`${chalk.red(en.symbols.fail)} ${message}`);
};
const commandVersion = async (command, args) => {
    try {
        const result = await execa(command, [...args], { reject: true });
        return result.stdout.split("\n")[0]?.trim() ?? en.common.unavailable;
    }
    catch {
        return en.common.unavailable;
    }
};
const ytdlpDownloadUrl = () => {
    if (process.platform === "win32") {
        return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";
    }
    if (process.platform === "darwin") {
        return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos";
    }
    return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";
};
const downloadFile = async (url, destination) => {
    const response = await fetch(url, { headers: { "User-Agent": "PacVideoDownloader" } });
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    await ensureDirectory(path.dirname(destination));
    await writeFile(destination, bytes);
    if (process.platform !== "win32") {
        await chmod(destination, 0o755);
    }
};
const updateYtDlp = async () => {
    const binaryName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
    const destination = path.join(getManagedBinaryDir(), binaryName);
    await downloadFile(ytdlpDownloadUrl(), destination);
};
const ffmpegArchiveUrl = () => {
    if (process.platform === "win32") {
        return "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip";
    }
    if (process.platform === "darwin") {
        return "https://evermeet.cx/ffmpeg/getrelease/zip";
    }
    return "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz";
};
const findBinary = async (directory, binaryName) => {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isFile() && entry.name.toLowerCase() === binaryName.toLowerCase()) {
            return entryPath;
        }
        if (entry.isDirectory()) {
            const found = await findBinary(entryPath, binaryName);
            if (found !== null) {
                return found;
            }
        }
    }
    return null;
};
const extractArchive = async (archivePath, destination) => {
    if (process.platform === "linux") {
        await execa("tar", ["-xJf", archivePath, "-C", destination], { reject: true });
        return;
    }
    if (process.platform === "darwin") {
        await execa("unzip", ["-q", archivePath, "-d", destination], { reject: true });
        return;
    }
    await execa("tar", ["-xf", archivePath, "-C", destination], { reject: true });
};
const updateFfmpeg = async () => {
    const binaryName = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
    const destination = path.join(getManagedBinaryDir(), binaryName);
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "pacv-ffmpeg-"));
    const archivePath = path.join(tempDirectory, process.platform === "linux" ? "ffmpeg.tar.xz" : "ffmpeg.zip");
    try {
        await downloadFile(ffmpegArchiveUrl(), archivePath);
        await extractArchive(archivePath, tempDirectory);
        const found = await findBinary(tempDirectory, binaryName);
        if (found === null) {
            throw new Error(en.cli.archiveMissing("ffmpeg"));
        }
        await ensureDirectory(path.dirname(destination));
        await copyFile(found, destination);
        if (process.platform !== "win32") {
            await chmod(destination, 0o755);
        }
    }
    finally {
        await rm(tempDirectory, { recursive: true, force: true });
    }
};
const updatePacVideoDownloader = async (projectRoot, tagName) => {
    await execa("git", ["fetch", "--tags", "--force"], { cwd: projectRoot, reject: true });
    await execa("git", ["checkout", `tags/${tagName}`], { cwd: projectRoot, reject: true });
    await execa("npm", ["ci"], { cwd: projectRoot, reject: true });
    await execa("npm", ["run", "build"], { cwd: projectRoot, reject: true });
};
const renderChangelogSnippet = (body) => {
    const lines = body.split(/\r?\n/).map((line) => line.trim());
    const heading = lines.find((line) => line.startsWith("#"));
    const bullets = lines.filter((line) => line.startsWith("- ") || line.startsWith("* ")).slice(0, 6);
    return [heading ?? en.cli.changelog, ...bullets];
};
export const runManualUpdate = async (currentVersion, projectRoot) => {
    console.log(chalk.hex("#FF6B2B").bold(en.cli.updateBanner));
    let pacvRelease = null;
    let ytdlpRelease = null;
    const failures = [];
    try {
        printStep(en.cli.checkingComponent(en.app.name));
        pacvRelease = await fetchLatestRelease(pacvRepo);
        printSuccess(en.cli.checkingComponent(en.app.name));
    }
    catch (error) {
        failures.push(`${en.app.name}: ${errorMessage(error)}`);
        printFailure(`${en.cli.failed(en.app.name)}. ${en.cli.remediation}`);
    }
    try {
        printStep(en.cli.checkingComponent("yt-dlp"));
        ytdlpRelease = await fetchLatestRelease(ytdlpRepo);
        printSuccess(en.cli.checkingComponent("yt-dlp"));
    }
    catch (error) {
        failures.push(`yt-dlp: ${errorMessage(error)}`);
        printFailure(`${en.cli.failed("yt-dlp")}. ${en.cli.remediation}`);
    }
    const currentYtDlp = await commandVersion("yt-dlp", ["--version"]);
    const currentFfmpeg = await commandVersion("ffmpeg", ["-version"]);
    const latestPacv = pacvRelease?.tagName.replace(/^v/i, "") ?? currentVersion;
    const latestYtDlp = ytdlpRelease?.tagName.replace(/^v/i, "") ?? currentYtDlp;
    const latestFfmpeg = currentFfmpeg === en.common.unavailable ? "static latest" : currentFfmpeg;
    console.log(en.cli.currentLatest(en.app.name, currentVersion, latestPacv));
    console.log(en.cli.currentLatest("yt-dlp", currentYtDlp, latestYtDlp));
    console.log(en.cli.currentLatest("ffmpeg", currentFfmpeg, latestFfmpeg));
    const appOutdated = compareSemver(currentVersion, latestPacv) < 0 && pacvRelease !== null;
    const ytdlpOutdated = currentYtDlp === en.common.unavailable || (ytdlpRelease !== null && compareSemver(currentYtDlp, latestYtDlp) < 0);
    const ffmpegMissing = currentFfmpeg === en.common.unavailable;
    if (!appOutdated && !ytdlpOutdated && !ffmpegMissing) {
        printSuccess(en.cli.everythingUpToDate);
        return 0;
    }
    if (appOutdated && pacvRelease !== null) {
        try {
            printStep(en.cli.updating(en.app.name));
            await updatePacVideoDownloader(projectRoot, pacvRelease.tagName);
            printSuccess(en.cli.success(en.app.name));
        }
        catch (error) {
            failures.push(`${en.app.name}: ${errorMessage(error)}`);
            printFailure(`${en.cli.failed(en.app.name)}. ${en.cli.remediation}`);
        }
    }
    if (ytdlpOutdated) {
        try {
            printStep(en.cli.updating("yt-dlp"));
            await updateYtDlp();
            printSuccess(en.cli.success("yt-dlp"));
        }
        catch (error) {
            failures.push(`yt-dlp: ${errorMessage(error)}`);
            printFailure(`${en.cli.failed("yt-dlp")}. ${en.cli.remediation}`);
        }
    }
    if (ffmpegMissing) {
        try {
            printStep(en.cli.updating("ffmpeg"));
            await updateFfmpeg();
            printSuccess(en.cli.success("ffmpeg"));
        }
        catch (error) {
            failures.push(`ffmpeg: ${errorMessage(error)}`);
            printFailure(`${en.cli.failed("ffmpeg")}. ${en.cli.remediation}`);
        }
    }
    try {
        printStep(en.cli.verify);
        await execa(process.execPath, [path.join(projectRoot, "dist", "cli.js"), "--version"], { reject: true });
        printSuccess(en.cli.verify);
    }
    catch (error) {
        failures.push(`verify: ${errorMessage(error)}`);
        printFailure(`${en.cli.failed(en.cli.verify)}. ${en.cli.remediation}`);
    }
    if (pacvRelease !== null && pacvRelease.body.length > 0) {
        console.log(chalk.hex("#FF6B2B").bold(en.cli.changelog));
        for (const line of renderChangelogSnippet(pacvRelease.body)) {
            console.log(line);
        }
    }
    if (failures.length > 0) {
        for (const failure of failures) {
            console.log(chalk.yellow(`${en.symbols.warning} ${failure}`));
        }
    }
    printSuccess(en.cli.done);
    return 0;
};
//# sourceMappingURL=updater.js.map