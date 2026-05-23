#!/usr/bin/env node
import { jsx as _jsx } from "react/jsx-runtime";
import { render } from "ink";
import meow from "meow";
import chalk from "chalk";
import App from "./App.js";
import { en } from "./locales/en.js";
import { resolveProjectRoot } from "./lib/paths.js";
import { readPackageVersion, runManualUpdate } from "./lib/updater.js";
const projectRoot = resolveProjectRoot(import.meta.url);
const version = await readPackageVersion(projectRoot);
if (process.argv.includes("--version") || process.argv.includes("-v")) {
    console.log(version);
    process.exit(0);
}
const cli = meow(`
${en.cli.description}

${en.cli.usage}
`, {
    importMeta: import.meta,
    flags: {
        help: {
            type: "boolean",
            shortFlag: "h"
        }
    }
});
const command = cli.input[0];
if (command === "update") {
    const exitCode = await runManualUpdate(version, projectRoot);
    process.exit(exitCode);
}
const appProps = command !== undefined ? { version, initialUrl: command } : { version };
try {
    render(_jsx(App, { ...appProps }));
}
catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`${en.common.error}: ${message}`));
    process.exit(1);
}
//# sourceMappingURL=cli.js.map