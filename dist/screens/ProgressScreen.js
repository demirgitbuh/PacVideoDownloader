import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box as InkBox, Text } from "ink";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import ProgressBar from "../components/ProgressBar.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
export default function ProgressScreen({ version, update, status, progress, error, logLines, completedFilePath, onOpenFolder, onDownloadAnother, onHome }) {
    const completed = status === "completed";
    const failed = status === "failed";
    const actionItems = [
        { label: en.common.openFolder, value: "open", disabled: completedFilePath === null },
        { label: en.common.downloadAnother, value: "another" },
        { label: en.common.backHome, value: "home" }
    ];
    return (_jsxs(InkBox, { flexDirection: "column", children: [_jsx(Header, { title: en.screen.progress, version: version, update: update }), _jsx(Text, { color: completed ? theme.colors.success : failed ? theme.colors.error : theme.colors.textPrimary, children: completed ? en.progress.completed : failed ? en.progress.failed : en.progress.steps[progress.step] }), _jsx(ProgressBar, { percent: progress.percent }), _jsxs(Text, { color: theme.colors.textSecondary, children: [progress.speed || en.common.unknown, "  ", en.progress.eta, " ", progress.eta || en.common.unknown, "  ", progress.downloaded || en.common.unknown, " / ", progress.total || en.common.unknown] }), completedFilePath !== null && (_jsxs(Text, { color: theme.colors.textSecondary, children: [en.progress.filePath, ": ", completedFilePath] })), error !== null && _jsx(Text, { color: theme.colors.error, children: error }), logLines.map((line, index) => (_jsx(Text, { color: theme.colors.textMuted, children: line }, `${index}:${line}`))), (completed || failed) && (_jsx(InkBox, { marginTop: 1, children: _jsx(Menu, { items: actionItems, onSelect: (value) => {
                        if (value === "open") {
                            onOpenFolder();
                        }
                        else if (value === "another") {
                            onDownloadAnother();
                        }
                        else {
                            onHome();
                        }
                    } }) })), _jsx(StatusBar, {})] }));
}
//# sourceMappingURL=ProgressScreen.js.map