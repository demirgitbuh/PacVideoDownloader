import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box as InkBox, Text } from "ink";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import { formatDuration, formatViewCount } from "../lib/ytdlp.js";
import Box from "./Box.js";
export default function VideoInfoCard({ metadata }) {
    const rows = [
        [en.video.title, metadata.title],
        [en.video.channel, metadata.channel ?? en.common.unknown],
        [en.video.duration, formatDuration(metadata.durationSeconds)],
        [en.video.views, formatViewCount(metadata.viewCount)],
        [en.video.thumbnail, metadata.thumbnail ?? en.common.unknown],
        [en.video.uploadDate, metadata.uploadDate ?? en.common.unknown],
        [en.video.formats, metadata.formats.length.toString()]
    ];
    return (_jsx(Box, { title: en.app.name, children: rows.map(([label, value]) => (_jsxs(InkBox, { children: [_jsxs(Text, { color: theme.colors.textSecondary, children: [label, ": "] }), _jsx(Text, { color: theme.colors.textPrimary, children: value })] }, label))) }));
}
//# sourceMappingURL=VideoInfoCard.js.map