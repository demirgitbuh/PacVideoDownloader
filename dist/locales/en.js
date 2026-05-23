export const en = {
    app: {
        name: "PacVideoDownloader",
        command: "pacv",
        logo: "PACV",
        author: "DemirArch",
        github: "github.com/demirgitbuh/PacVideoDownloader",
        license: "MIT",
        madeBy: "Made by DemirArch",
        version: (version) => `v${version}`,
        downloadPath: (path) => `Download path: ${path}`
    },
    symbols: {
        pointer: "▸",
        open: "▾",
        filled: "●",
        empty: "○",
        success: "✓",
        fail: "✗",
        warning: "⚠",
        refresh: "↻",
        download: "⬇"
    },
    screen: {
        home: "Home",
        download: "Download",
        format: "Format",
        quality: "Quality",
        subtitle: "Subtitles",
        confirm: "Confirm",
        progress: "Progress",
        playlist: "Playlist",
        history: "History",
        settings: "Settings",
        update: "Update",
        about: "About"
    },
    common: {
        back: "Back",
        backHome: "Back to home",
        quit: "Quit",
        loading: "Loading",
        saving: "Saving",
        enabled: "enabled",
        disabled: "disabled",
        none: "None",
        unknown: "Unknown",
        unavailable: "Unavailable",
        error: "Error",
        retry: "Retry",
        openFolder: "Open folder",
        downloadAnother: "Download another",
        keyHint: "Up/Down move  Enter select  q quit",
        inputHint: "Enter submit  q quit",
        pasteHint: "Paste a URL, then press Enter.",
        emptyList: "Nothing to show.",
        yes: "Yes",
        no: "No",
        copied: "Copied",
        deleted: "Deleted"
    },
    validation: {
        urlRequired: "Enter a URL before continuing.",
        invalidUrl: "That does not look like a valid URL.",
        pathRequired: "Download directory cannot be empty.",
        languageRequired: "Subtitle language cannot be empty.",
        concurrentRange: "Concurrent downloads must be between 1 and 5."
    },
    home: {
        menu: {
            download: "Download",
            history: "History",
            settings: "Settings",
            update: "Update",
            about: "About",
            quit: "Quit"
        }
    },
    download: {
        title: "Enter video URL",
        loadingMetadata: "Loading metadata with yt-dlp",
        playlistDetected: "Playlist detected",
        metadataReady: "Metadata loaded",
        loadFailed: "Could not load video metadata."
    },
    video: {
        title: "Title",
        channel: "Channel",
        duration: "Duration",
        views: "Views",
        thumbnail: "Thumbnail",
        uploadDate: "Upload date",
        formats: "Formats",
        playlistCount: (count) => `${count} items`,
        totalDuration: (duration) => `Total duration: ${duration}`
    },
    format: {
        prompt: "Choose output format",
        labels: {
            mp4: "MP4 video",
            mp3: "MP3 audio",
            webm: "WebM video",
            mkv: "MKV video",
            m4a: "M4A audio"
        }
    },
    quality: {
        prompt: "Choose quality",
        labels: {
            "2160p": "4K (2160p)",
            "1440p": "1440p",
            "1080p": "1080p",
            "720p": "720p",
            "480p": "480p",
            "360p": "360p",
            best: "Best",
            worst: "Worst"
        }
    },
    subtitle: {
        prompt: "Choose subtitle mode",
        labels: {
            none: "None",
            auto: "Auto-generated",
            manual: "Uploaded",
            all: "All"
        }
    },
    confirm: {
        prompt: "Ready to download",
        filenamePreview: "Output preview",
        start: "Start download",
        recalculating: "Calculating filename preview",
        optionFormat: "Format",
        optionQuality: "Quality",
        optionSubtitles: "Subtitles",
        optionDirectory: "Directory"
    },
    progress: {
        waiting: "Waiting to start",
        completed: "Download completed",
        failed: "Download failed",
        filePath: "File path",
        eta: "ETA",
        steps: {
            idle: "Preparing",
            downloadingVideo: "Downloading video",
            downloadingAudio: "Downloading audio",
            merging: "Merging",
            embeddingSubtitles: "Embedding subtitles",
            completed: "Completed"
        }
    },
    playlist: {
        prompt: "Choose playlist mode",
        all: "Download all",
        range: "Select range",
        individual: "Pick individual items",
        rangeInput: "Range, for example 1-10",
        selectedCount: (count) => `${count} selected`,
        toggleHint: "Space toggles selection  Enter continues  Esc returns"
    },
    history: {
        filter: "Search history",
        newest: "Newest first",
        oldest: "Oldest first",
        reDownload: "Re-download",
        openLocation: "Open file location",
        copyUrl: "Copy URL",
        delete: "Delete entry",
        status: "Status",
        noMatches: "No history entries match that filter."
    },
    settings: {
        edit: "Edit",
        reset: "Reset to defaults",
        saved: "Settings saved",
        labels: {
            downloadDir: "Download directory",
            defaultFormat: "Default format",
            defaultQuality: "Default quality",
            filenameTemplate: "Filename template",
            concurrentDownloads: "Concurrent downloads",
            subtitleLanguage: "Subtitle language",
            checkUpdatesOnStartup: "Check for updates on startup"
        }
    },
    update: {
        checking: "Checking for updates",
        checkNow: "Check now",
        upToDate: "Everything is up to date",
        available: (version) => `v${version} available`,
        badge: (version) => `↻ v${version} available`,
        failed: "Update check failed",
        manualHint: "Run pacv update for the non-interactive updater."
    },
    about: {
        ytdlpVersion: "yt-dlp",
        ffmpegVersion: "ffmpeg",
        loadingTools: "Detecting tool versions"
    },
    cli: {
        description: "A TypeScript TUI wrapper around yt-dlp.",
        usage: "Usage: pacv [url] [update]",
        updateBanner: "PacVideoDownloader update",
        checkingComponent: (name) => `Checking ${name}`,
        currentLatest: (name, current, latest) => `${name}: ${current} -> ${latest}`,
        updating: (name) => `Updating ${name}`,
        success: (name) => `${name} updated`,
        failed: (name) => `${name} failed`,
        everythingUpToDate: "Everything is up to date",
        verify: "Verifying pacv",
        changelog: "Changelog",
        remediation: "Please rerun the installer or update the component manually.",
        done: "Update flow completed",
        archiveMissing: (name) => `${name} binary missing from archive`
    }
};
//# sourceMappingURL=en.js.map