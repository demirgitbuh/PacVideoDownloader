export declare const en: {
    readonly app: {
        readonly name: "PacVideoDownloader";
        readonly command: "pacv";
        readonly logo: "PACV";
        readonly author: "DemirArch";
        readonly github: "github.com/demirgitbuh/PacVideoDownloader";
        readonly license: "MIT";
        readonly madeBy: "Made by DemirArch";
        readonly version: (version: string) => string;
        readonly downloadPath: (path: string) => string;
    };
    readonly symbols: {
        readonly pointer: "▸";
        readonly open: "▾";
        readonly filled: "●";
        readonly empty: "○";
        readonly success: "✓";
        readonly fail: "✗";
        readonly warning: "⚠";
        readonly refresh: "↻";
        readonly download: "⬇";
    };
    readonly screen: {
        readonly home: "Home";
        readonly download: "Download";
        readonly format: "Format";
        readonly quality: "Quality";
        readonly subtitle: "Subtitles";
        readonly confirm: "Confirm";
        readonly progress: "Progress";
        readonly playlist: "Playlist";
        readonly history: "History";
        readonly settings: "Settings";
        readonly update: "Update";
        readonly about: "About";
    };
    readonly common: {
        readonly back: "Back";
        readonly backHome: "Back to home";
        readonly quit: "Quit";
        readonly loading: "Loading";
        readonly saving: "Saving";
        readonly enabled: "enabled";
        readonly disabled: "disabled";
        readonly none: "None";
        readonly unknown: "Unknown";
        readonly unavailable: "Unavailable";
        readonly error: "Error";
        readonly retry: "Retry";
        readonly openFolder: "Open folder";
        readonly downloadAnother: "Download another";
        readonly keyHint: "Up/Down move  Enter select  q quit";
        readonly inputHint: "Enter submit  q quit";
        readonly pasteHint: "Paste a URL, then press Enter.";
        readonly emptyList: "Nothing to show.";
        readonly yes: "Yes";
        readonly no: "No";
        readonly copied: "Copied";
        readonly deleted: "Deleted";
    };
    readonly validation: {
        readonly urlRequired: "Enter a URL before continuing.";
        readonly invalidUrl: "That does not look like a valid URL.";
        readonly pathRequired: "Download directory cannot be empty.";
        readonly languageRequired: "Subtitle language cannot be empty.";
        readonly concurrentRange: "Concurrent downloads must be between 1 and 5.";
    };
    readonly home: {
        readonly menu: {
            readonly download: "Download";
            readonly history: "History";
            readonly settings: "Settings";
            readonly update: "Update";
            readonly about: "About";
            readonly quit: "Quit";
        };
    };
    readonly download: {
        readonly title: "Enter video URL";
        readonly loadingMetadata: "Loading metadata with yt-dlp";
        readonly playlistDetected: "Playlist detected";
        readonly metadataReady: "Metadata loaded";
        readonly loadFailed: "Could not load video metadata.";
    };
    readonly video: {
        readonly title: "Title";
        readonly channel: "Channel";
        readonly duration: "Duration";
        readonly views: "Views";
        readonly thumbnail: "Thumbnail";
        readonly uploadDate: "Upload date";
        readonly formats: "Formats";
        readonly playlistCount: (count: number) => string;
        readonly totalDuration: (duration: string) => string;
    };
    readonly format: {
        readonly prompt: "Choose output format";
        readonly labels: {
            mp4: string;
            mp3: string;
            webm: string;
            mkv: string;
            m4a: string;
        };
    };
    readonly quality: {
        readonly prompt: "Choose quality";
        readonly labels: {
            "2160p": string;
            "1440p": string;
            "1080p": string;
            "720p": string;
            "480p": string;
            "360p": string;
            best: string;
            worst: string;
        };
    };
    readonly subtitle: {
        readonly prompt: "Choose subtitle mode";
        readonly labels: {
            none: string;
            auto: string;
            manual: string;
            all: string;
        };
    };
    readonly confirm: {
        readonly prompt: "Ready to download";
        readonly filenamePreview: "Output preview";
        readonly start: "Start download";
        readonly recalculating: "Calculating filename preview";
        readonly optionFormat: "Format";
        readonly optionQuality: "Quality";
        readonly optionSubtitles: "Subtitles";
        readonly optionDirectory: "Directory";
    };
    readonly progress: {
        readonly waiting: "Waiting to start";
        readonly completed: "Download completed";
        readonly failed: "Download failed";
        readonly filePath: "File path";
        readonly eta: "ETA";
        readonly steps: {
            idle: string;
            downloadingVideo: string;
            downloadingAudio: string;
            merging: string;
            embeddingSubtitles: string;
            completed: string;
        };
    };
    readonly playlist: {
        readonly prompt: "Choose playlist mode";
        readonly all: "Download all";
        readonly range: "Select range";
        readonly individual: "Pick individual items";
        readonly rangeInput: "Range, for example 1-10";
        readonly selectedCount: (count: number) => string;
        readonly toggleHint: "Space toggles selection  Enter continues  Esc returns";
    };
    readonly history: {
        readonly filter: "Search history";
        readonly newest: "Newest first";
        readonly oldest: "Oldest first";
        readonly reDownload: "Re-download";
        readonly openLocation: "Open file location";
        readonly copyUrl: "Copy URL";
        readonly delete: "Delete entry";
        readonly status: "Status";
        readonly noMatches: "No history entries match that filter.";
    };
    readonly settings: {
        readonly edit: "Edit";
        readonly reset: "Reset to defaults";
        readonly saved: "Settings saved";
        readonly labels: {
            readonly downloadDir: "Download directory";
            readonly defaultFormat: "Default format";
            readonly defaultQuality: "Default quality";
            readonly filenameTemplate: "Filename template";
            readonly concurrentDownloads: "Concurrent downloads";
            readonly subtitleLanguage: "Subtitle language";
            readonly checkUpdatesOnStartup: "Check for updates on startup";
        };
    };
    readonly update: {
        readonly checking: "Checking for updates";
        readonly checkNow: "Check now";
        readonly upToDate: "Everything is up to date";
        readonly available: (version: string) => string;
        readonly badge: (version: string) => string;
        readonly failed: "Update check failed";
        readonly manualHint: "Run pacv update for the non-interactive updater.";
    };
    readonly about: {
        readonly ytdlpVersion: "yt-dlp";
        readonly ffmpegVersion: "ffmpeg";
        readonly loadingTools: "Detecting tool versions";
    };
    readonly cli: {
        readonly description: "A TypeScript TUI wrapper around yt-dlp.";
        readonly usage: "Usage: pacv [url] [update]";
        readonly updateBanner: "PacVideoDownloader update";
        readonly checkingComponent: (name: string) => string;
        readonly currentLatest: (name: string, current: string, latest: string) => string;
        readonly updating: (name: string) => string;
        readonly success: (name: string) => string;
        readonly failed: (name: string) => string;
        readonly everythingUpToDate: "Everything is up to date";
        readonly verify: "Verifying pacv";
        readonly changelog: "Changelog";
        readonly remediation: "Please rerun the installer or update the component manually.";
        readonly done: "Update flow completed";
        readonly archiveMissing: (name: string) => string;
    };
};
