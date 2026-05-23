#!/usr/bin/env bash
set -euo pipefail

ORANGE="\033[38;2;255;107;43m"
BRIGHT="\033[38;2;255;133;81m"
GREEN="\033[32m"
RED="\033[31m"
BOLD="\033[1m"
RESET="\033[0m"

REPO_URL="https://github.com/demirgitbuh/PacVideoDownloader"
BIN_DIR="$HOME/.local/bin"
APP_DIR="$HOME/.local/share/pacv"
YTDLP_PATH="$BIN_DIR/yt-dlp"
FFMPEG_PATH="$BIN_DIR/ffmpeg"
LAUNCHER_PATH="$BIN_DIR/pacv"

print_banner() {
  printf "%b\n" "${ORANGE}"
  printf " ____            __     ___     _            ____                      _                 _           \n"
  printf "|  _ \\ __ _  ___ \\ \\   / (_) __| | ___  ___ |  _ \\  _____      ___ __ | | ___   __ _  __| | ___ _ __ \n"
  printf "| |_) / _\` |/ __| \\ \\ / /| |/ _\` |/ _ \\/ _ \\| | | |/ _ \\ \\ /\\ / / '_ \\| |/ _ \\ / _\` |/ _\` |/ _ \\ '__|\n"
  printf "|  __/ (_| | (__   \\ V / | | (_| |  __/ (_) | |_| | (_) \\ V  V /| | | | | (_) | (_| | (_| |  __/ |   \n"
  printf "|_|   \\__,_|\\___|   \\_/  |_|\\__,_|\\___|\\___/|____/ \\___/ \\_/\\_/ |_| |_|_|\\___/ \\__,_|\\__,_|\\___|_|   \n"
  printf "%b\n" "${RESET}"
}

step() {
  printf "%b→%b %s...\n" "$ORANGE" "$RESET" "$1"
}

success() {
  printf "%b✓%b %s\n" "$GREEN" "$RESET" "$1"
}

failure() {
  printf "%b✗%b %s\n" "$RED" "$RESET" "$1"
}

die() {
  failure "$1"
  exit 1
}

detect_platform() {
  OS_NAME="$(uname -s)"
  ARCH_NAME="$(uname -m)"

  case "$OS_NAME" in
    Linux) PLATFORM="linux" ;;
    Darwin) PLATFORM="macos" ;;
    *) die "Unsupported OS: $OS_NAME" ;;
  esac

  case "$ARCH_NAME" in
    x86_64|amd64) ARCH="amd64" ;;
    arm64|aarch64) ARCH="arm64" ;;
    *) ARCH="$ARCH_NAME" ;;
  esac

  printf "Detected: %s %s\n" "$PLATFORM" "$ARCH"
}

node_major() {
  node --version 2>/dev/null | sed 's/^v//' | cut -d. -f1
}

ensure_node() {
  step "Check Node.js >= 20"
  if command -v node >/dev/null 2>&1; then
    MAJOR="$(node_major)"
    if [ "${MAJOR:-0}" -ge 20 ]; then
      success "Node.js already installed"
      return
    fi
  fi

  export NVM_DIR="$HOME/.nvm"
  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash >/dev/null
  fi
  . "$NVM_DIR/nvm.sh"
  nvm install --lts >/dev/null
  nvm use --lts >/dev/null
  MAJOR="$(node_major)"
  [ "${MAJOR:-0}" -ge 20 ] || die "Node.js 20 or newer could not be installed"
  success "Node.js installed"
}

ensure_npm() {
  step "Check npm"
  command -v npm >/dev/null 2>&1 || die "npm was not found after Node.js installation"
  success "npm already installed"
}

ensure_dirs() {
  mkdir -p "$BIN_DIR" "$APP_DIR"
}

ensure_ytdlp() {
  step "Check yt-dlp"
  if [ -x "$YTDLP_PATH" ]; then
    success "yt-dlp already installed"
    return
  fi

  case "$PLATFORM" in
    linux) URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp" ;;
    macos) URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos" ;;
    *) die "Unsupported yt-dlp platform" ;;
  esac

  curl -fsSL "$URL" -o "$YTDLP_PATH"
  chmod +x "$YTDLP_PATH"
  success "yt-dlp installed"
}

ensure_ffmpeg() {
  step "Check ffmpeg"
  if [ -x "$FFMPEG_PATH" ]; then
    success "ffmpeg already installed"
    return
  fi

  TMP_DIR="$(mktemp -d)"
  trap 'rm -rf "$TMP_DIR"' EXIT

  if [ "$PLATFORM" = "linux" ]; then
    curl -fsSL "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz" -o "$TMP_DIR/ffmpeg.tar.xz"
    tar -xJf "$TMP_DIR/ffmpeg.tar.xz" -C "$TMP_DIR"
    FOUND="$(find "$TMP_DIR" -type f -name ffmpeg | head -n 1)"
    [ -n "$FOUND" ] || die "ffmpeg binary not found in archive"
    cp "$FOUND" "$FFMPEG_PATH"
  else
    curl -fsSL "https://evermeet.cx/ffmpeg/getrelease/zip" -o "$TMP_DIR/ffmpeg.zip"
    unzip -q "$TMP_DIR/ffmpeg.zip" -d "$TMP_DIR"
    FOUND="$(find "$TMP_DIR" -type f -name ffmpeg | head -n 1)"
    [ -n "$FOUND" ] || die "ffmpeg binary not found in archive"
    cp "$FOUND" "$FFMPEG_PATH"
  fi

  chmod +x "$FFMPEG_PATH"
  success "ffmpeg installed"
}

install_source_with_git() {
  if [ -d "$APP_DIR/.git" ]; then
    git -C "$APP_DIR" pull --ff-only origin main >/dev/null
  else
    rm -rf "$APP_DIR"
    git clone --depth 1 "$REPO_URL" "$APP_DIR" >/dev/null
  fi
}

install_source_with_tarball() {
  TMP_DIR="$(mktemp -d)"
  trap 'rm -rf "$TMP_DIR"' EXIT
  curl -fsSL "$REPO_URL/archive/refs/heads/main.tar.gz" -o "$TMP_DIR/source.tar.gz"
  tar -xzf "$TMP_DIR/source.tar.gz" -C "$TMP_DIR"
  rm -rf "$APP_DIR"
  mkdir -p "$APP_DIR"
  SOURCE_DIR="$(find "$TMP_DIR" -maxdepth 1 -type d -iname 'PacVideoDownloader-*' | head -n 1)"
  [ -n "$SOURCE_DIR" ] || die "source archive did not contain PacVideoDownloader"
  cp -R "$SOURCE_DIR"/. "$APP_DIR"/
}

ensure_source() {
  step "Clone PacVideoDownloader source"
  if command -v git >/dev/null 2>&1; then
    install_source_with_git
  else
    install_source_with_tarball
  fi
  success "PacVideoDownloader source ready"
}

build_app() {
  step "Run npm ci"
  (cd "$APP_DIR" && npm ci --silent)
  success "npm ci completed"

  step "Run npm run build"
  (cd "$APP_DIR" && npm run build --silent)
  success "build completed"
}

create_launcher() {
  step "Create pacv launcher"
  cat > "$LAUNCHER_PATH" <<'LAUNCHER'
#!/usr/bin/env bash
exec node "$HOME/.local/share/pacv/dist/cli.js" "$@"
LAUNCHER
  chmod +x "$LAUNCHER_PATH"
  success "launcher ready"
}

ensure_path() {
  step "Check PATH"
  case ":$PATH:" in
    *":$BIN_DIR:"*)
      success "PATH already contains $BIN_DIR"
      ;;
    *)
      SHELL_RC="$HOME/.profile"
      if [ -n "${SHELL:-}" ] && [ "$(basename "$SHELL")" = "zsh" ]; then
        SHELL_RC="$HOME/.zshrc"
      fi
      if [ ! -f "$SHELL_RC" ] || ! grep -F 'export PATH="$HOME/.local/bin:$PATH"' "$SHELL_RC" >/dev/null 2>&1; then
        printf '\nexport PATH="$HOME/.local/bin:$PATH"\n' >> "$SHELL_RC"
      fi
      success "PATH updated"
      printf "%bRestart your shell before running pacv from a new terminal.%b\n" "$BRIGHT" "$RESET"
      ;;
  esac
}

verify_install() {
  step "Verify pacv --version"
  "$LAUNCHER_PATH" --version >/dev/null
  success "pacv verified"
}

print_success_box() {
  printf "%b\n" "$ORANGE"
  printf "   ╭─────────────────────────────────────╮\n"
  printf "   │  ✓ PacVideoDownloader installed!    │\n"
  printf "   │                                     │\n"
  printf "   │  Run:  pacv                         │\n"
  printf "   │  Docs: github.com/demirgitbuh/...   │\n"
  printf "   ╰─────────────────────────────────────╯\n"
  printf "%b" "$RESET"
}

main() {
  print_banner
  printf "%bWelcome to PacVideoDownloader installer%b\n" "$BOLD" "$RESET"
  detect_platform
  ensure_dirs
  ensure_node
  ensure_npm
  ensure_ytdlp
  ensure_ffmpeg
  ensure_source
  build_app
  create_launcher
  ensure_path
  verify_install
  print_success_box
}

main "$@"
