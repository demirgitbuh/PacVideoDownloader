<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=30&duration=2400&pause=700&color=FF6B2B&center=true&vCenter=true&width=760&lines=PacVideoDownloader;Modern+yt-dlp+TUI;Download+video+from+1000%2B+sites;Command%3A+pacv" alt="PacVideoDownloader animated title" />

<br />

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&size=16&duration=1800&pause=600&color=A0A0A0&center=true&vCenter=true&width=760&lines=%3E+paste+a+URL;%3E+choose+format;%3E+pick+quality;%3E+download+with+progress" alt="PacVideoDownloader animated terminal flow" />

<br />

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-FF6B2B?style=for-the-badge&labelColor=111111)
![Ink](https://img.shields.io/badge/Ink-5.x-FF6B2B?style=for-the-badge&labelColor=111111)
![Node](https://img.shields.io/badge/Node-%3E%3D20-FF6B2B?style=for-the-badge&labelColor=111111)
![License](https://img.shields.io/badge/License-MIT-FF6B2B?style=for-the-badge&labelColor=111111)

</div>

## Install

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=20&duration=2200&pause=500&color=FF6B2B&center=true&vCenter=true&width=760&lines=For+macOS+%2F+Linux;curl+-fsSL+install.sh+%7C+bash;Run%3A+pacv" alt="Animated macOS and Linux install" />

</div>

```bash
curl -fsSL https://raw.githubusercontent.com/demirgitbuh/PacVideoDownloader/main/scripts/install.sh | bash
```

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=20&duration=2200&pause=500&color=FF6B2B&center=true&vCenter=true&width=760&lines=For+Windows;irm+install.ps1+%7C+iex;Run%3A+pacv" alt="Animated Windows install" />

</div>

```powershell
irm https://raw.githubusercontent.com/demirgitbuh/PacVideoDownloader/main/scripts/install.ps1 | iex
```

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=20&duration=2200&pause=500&color=A0A0A0&center=true&vCenter=true&width=760&lines=Optional+NPM+install;npm+install+-g+pacvideodownloader;Run%3A+pacv" alt="Animated npm install" />

</div>

```bash
npm install -g pacvideodownloader
```

PacVideoDownloader is a polished TypeScript terminal UI for `yt-dlp`, built for developers who want guided downloads without memorizing command flags. It installs as `pacv` and manages `yt-dlp`, `ffmpeg`, settings, history, and updates from a modern Ink interface.

## Demo

```text
+-------------------------------------+
|  PacVideoDownloader                 |
|  Minimal terminal video downloads   |
+-------------------------------------+

> * Download
  * History
  * Settings
  * Update
  * About
  * Quit
```

```text
pacv https://example.com/video

> Format:    MP4 video
> Quality:   1080p
> Subtitles: None
> Output:    ~/Videos/PacVideo/%(title)s.%(ext)s

Downloading video
#############--------------- 42.0%
```

## Features

- Dark monochrome Ink TUI with DemirArch AI orange accents.
- Guided video, audio, quality, subtitle, playlist, and confirmation flows.
- Direct URL mode with `pacv <url>`.
- Non-interactive update command with `pacv update`.
- Persistent settings at `~/.config/pacv/config.json` on Unix and `%APPDATA%\pacv\config.json` on Windows.
- Download history with search, sorting, re-download, open-location, copy-url, and delete actions.
- Progress parsing from structured `yt-dlp` progress templates.
- Automatic dependency installation for Node.js, `yt-dlp`, and `ffmpeg`.

## Screenshots

Screenshots and terminal GIFs will be added after the first tagged release.

## Development

```bash
npm ci
npm run typecheck
npm run build
npm run dev
```

Run the built CLI:

```bash
node dist/cli.js
node dist/cli.js --version
node dist/cli.js update
```

The project is ESM-only, TypeScript strict, and targets Node.js 20 or newer. Relative TypeScript imports use `.js` extensions so emitted files run directly under Node.

## NPM Publishing

This repository is configured for both installer distribution and npm global installs. The npm package exposes the `pacv` command from `dist/cli.js`.

Check the package name:

```bash
npm view pacvideodownloader version
```

The package is configured with:

```json
{
  "bin": {
    "pacv": "dist/cli.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "package.json"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/cli.tsx",
    "start": "node dist/cli.js",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run typecheck && npm run build"
  }
}
```

Publish:

```bash
npm login
npm whoami
npm ci
npm run typecheck
npm run build
npm pack --dry-run
npm publish --access public
```

If the version already exists on npm, bump `package.json` first:

```bash
npm version patch
npm publish --access public
```
