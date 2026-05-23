$ErrorActionPreference = "Stop"

$Esc = [char]27
$Orange = "$Esc[38;2;255;107;43m"
$Bright = "$Esc[38;2;255;133;81m"
$Green = "$Esc[32m"
$Red = "$Esc[31m"
$Bold = "$Esc[1m"
$Reset = "$Esc[0m"

if ($PSVersionTable.PSVersion.Major -ge 7 -and $null -ne $PSStyle) {
  $Orange = $PSStyle.Foreground.FromRgb(0xFF6B2B)
  $Bright = $PSStyle.Foreground.FromRgb(0xFF8551)
  $Green = $PSStyle.Foreground.Green
  $Red = $PSStyle.Foreground.Red
  $Bold = $PSStyle.Bold
  $Reset = $PSStyle.Reset
}

$RepoUrl = "https://github.com/demirgitbuh/PacVideoDownloader"
$RootDir = Join-Path $env:LOCALAPPDATA "pacv"
$BinDir = Join-Path $RootDir "bin"
$AppDir = Join-Path $RootDir "app"
$YtDlpPath = Join-Path $RootDir "yt-dlp.exe"
$FfmpegPath = Join-Path $RootDir "ffmpeg.exe"
$LauncherPath = Join-Path $BinDir "pacv.cmd"

function Write-Banner {
  Write-Host $Orange
  Write-Host " ____            __     ___     _            ____                      _                 _           "
  Write-Host "|  _ \ __ _  ___ \ \   / (_) __| | ___  ___ |  _ \  _____      ___ __ | | ___   __ _  __| | ___ _ __ "
  Write-Host "| |_) / _`` |/ __| \ \ / /| |/ _`` |/ _ \/ _ \| | | |/ _ \ \ /\ / / '_ \| |/ _ \ / _`` |/ _`` |/ _ \ '__|"
  Write-Host "|  __/ (_| | (__   \ V / | | (_| |  __/ (_) | |_| | (_) \ V  V /| | | | | (_) | (_| | (_| |  __/ |   "
  Write-Host "|_|   \__,_|\___|   \_/  |_|\__,_|\___|\___/|____/ \___/ \_/\_/ |_| |_|_|\___/ \__,_|\__,_|\___|_|   "
  Write-Host $Reset
}

function Step([string]$Message) {
  Write-Host "$Orange→$Reset $Message..."
}

function Success([string]$Message) {
  Write-Host "$Green✓$Reset $Message"
}

function Failure([string]$Message) {
  Write-Host "$Red✗$Reset $Message"
}

function Fail-Fast([string]$Message) {
  Failure $Message
  exit 1
}

function Get-NodeMajor {
  try {
    $Version = (& node --version) -replace "^v", ""
    return [int]($Version.Split(".")[0])
  } catch {
    return 0
  }
}

function Ensure-Directories {
  New-Item -ItemType Directory -Force -Path $RootDir, $BinDir | Out-Null
}

function Ensure-Node {
  Step "Check Node.js >= 20"
  $Major = Get-NodeMajor
  if ($Major -ge 20) {
    Success "Node.js already installed"
    return
  }

  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Fail-Fast "winget is required to install Node.js automatically"
  }

  winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements | Out-Null
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
  $Major = Get-NodeMajor
  if ($Major -lt 20) {
    Fail-Fast "Node.js 20 or newer could not be installed"
  }
  Success "Node.js installed"
}

function Ensure-Npm {
  Step "Check npm"
  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Fail-Fast "npm was not found after Node.js installation"
  }
  Success "npm already installed"
}

function Ensure-YtDlp {
  Step "Check yt-dlp"
  if (Test-Path $YtDlpPath) {
    Success "yt-dlp already installed"
    return
  }

  Invoke-WebRequest -Uri "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe" -OutFile $YtDlpPath
  Success "yt-dlp installed"
}

function Ensure-Ffmpeg {
  Step "Check ffmpeg"
  if (Test-Path $FfmpegPath) {
    Success "ffmpeg already installed"
    return
  }

  $TempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("pacv-ffmpeg-" + [System.Guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Force -Path $TempDir | Out-Null
  try {
    $ZipPath = Join-Path $TempDir "ffmpeg.zip"
    Invoke-WebRequest -Uri "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip" -OutFile $ZipPath
    Expand-Archive -Path $ZipPath -DestinationPath $TempDir -Force
    $Binary = Get-ChildItem -Path $TempDir -Recurse -Filter "ffmpeg.exe" | Select-Object -First 1
    if ($null -eq $Binary) {
      Fail-Fast "ffmpeg binary not found in archive"
    }
    Copy-Item -Path $Binary.FullName -Destination $FfmpegPath -Force
  } finally {
    Remove-Item -LiteralPath $TempDir -Recurse -Force
  }
  Success "ffmpeg installed"
}

function Install-Source-WithGit {
  if (Test-Path (Join-Path $AppDir ".git")) {
    git -C $AppDir pull --ff-only origin main | Out-Null
  } else {
    if (Test-Path $AppDir) {
      Remove-Item -LiteralPath $AppDir -Recurse -Force
    }
    git clone --depth 1 $RepoUrl $AppDir | Out-Null
  }
}

function Install-Source-WithTarball {
  $TempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("pacv-source-" + [System.Guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Force -Path $TempDir | Out-Null
  try {
    $TarPath = Join-Path $TempDir "source.tar.gz"
    Invoke-WebRequest -Uri "$RepoUrl/archive/refs/heads/main.tar.gz" -OutFile $TarPath
    tar -xzf $TarPath -C $TempDir
    $SourceDir = Get-ChildItem -Path $TempDir -Directory | Where-Object { $_.Name -like "PacVideoDownloader-*" } | Select-Object -First 1
    if ($null -eq $SourceDir) {
      Fail-Fast "source archive did not contain PacVideoDownloader"
    }
    if (Test-Path $AppDir) {
      Remove-Item -LiteralPath $AppDir -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path $AppDir | Out-Null
    Copy-Item -Path (Join-Path $SourceDir.FullName "*") -Destination $AppDir -Recurse -Force
  } finally {
    Remove-Item -LiteralPath $TempDir -Recurse -Force
  }
}

function Ensure-Source {
  Step "Clone PacVideoDownloader source"
  if (Get-Command git -ErrorAction SilentlyContinue) {
    Install-Source-WithGit
  } else {
    Install-Source-WithTarball
  }
  Success "PacVideoDownloader source ready"
}

function Build-App {
  Step "Run npm ci"
  Push-Location $AppDir
  try {
    npm ci --silent
    Success "npm ci completed"
    Step "Run npm run build"
    npm run build --silent
    Success "build completed"
  } finally {
    Pop-Location
  }
}

function Create-Launcher {
  Step "Create pacv launcher"
  $Shim = "@echo off`r`nnode `"$AppDir\dist\cli.js`" %*`r`n"
  Set-Content -Path $LauncherPath -Value $Shim -Encoding ASCII
  Success "launcher ready"
}

function Ensure-Path {
  Step "Check PATH"
  $UserPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
  $Segments = $UserPath -split ";"
  if ($Segments -contains $BinDir) {
    Success "PATH already contains $BinDir"
    return
  }

  $NextPath = if ([string]::IsNullOrWhiteSpace($UserPath)) { $BinDir } else { "$UserPath;$BinDir" }
  [System.Environment]::SetEnvironmentVariable("Path", $NextPath, "User")
  $env:Path = "$env:Path;$BinDir"
  Success "PATH updated"
  Write-Host "$BrightRestart your shell before running pacv from a new terminal.$Reset"
}

function Verify-Install {
  Step "Verify pacv --version"
  & $LauncherPath --version | Out-Null
  Success "pacv verified"
}

function Write-SuccessBox {
  Write-Host $Orange
  Write-Host "   ╭─────────────────────────────────────╮"
  Write-Host "   │  ✓ PacVideoDownloader installed!    │"
  Write-Host "   │                                     │"
  Write-Host "   │  Run:  pacv                         │"
  Write-Host "   │  Docs: github.com/demirgitbuh/...   │"
  Write-Host "   ╰─────────────────────────────────────╯"
  Write-Host $Reset
}

Write-Banner
Write-Host "$BoldWelcome to PacVideoDownloader installer$Reset"
$Os = "windows"
$Arch = if ([Environment]::Is64BitOperatingSystem) { "amd64" } else { "x86" }
Write-Host "Detected: $Os $Arch"
Ensure-Directories
Ensure-Node
Ensure-Npm
Ensure-YtDlp
Ensure-Ffmpeg
Ensure-Source
Build-App
Create-Launcher
Ensure-Path
Verify-Install
Write-SuccessBox
