import { env } from "../config/env"

enum AnsiColors {
    RESET = "\x1b[0m",
    BLACK = "\x1b[30m",
    RED = "\x1b[31m",
    GREEN = "\x1b[32m",
    YELLOW = "\x1b[33m",
    BLUE = "\x1b[34m",
    MAGENTA = "\x1b[35m",
    CYAN = "\x1b[36m",
    WHITE = "\x1b[37m",
    BRIGHT_BLACK = "\x1b[90m",
    BRIGHT_RED = "\x1b[91m",
    BRIGHT_GREEN = "\x1b[92m",
    BRIGHT_YELLOW = "\x1b[93m",
    BRIGHT_BLUE = "\x1b[94m",
    BRIGHT_MAGENTA = "\x1b[95m",
    BRIGHT_CYAN = "\x1b[96m",
    BRIGHT_WHITE = "\x1b[97m"
}

export type ColorizedLoggerOpts = {
    debug: boolean
    colors: {
        warn: AnsiColors
        info: AnsiColors
        debug: AnsiColors
        error: AnsiColors
        critical: AnsiColors
    }
    format: {
        timestamp: boolean
    }
}

export class ColorizedLogger {
    constructor(
        private opts: ColorizedLoggerOpts
    ) {}

    private prefix(mode: string, color: AnsiColors): string {
        let start = `[${mode}`

        if (this.opts.format && this.opts.format.timestamp) {
            start += ` - ${new Date().toDateString()}`
        }

        return `${start}] `
    }

    debug(...args: any[]) {
        console.debug(this.prefix("debug", this.opts.colors.debug), ...args)
    }

    info(...args: any[]) {
        console.info(this.prefix("info", this.opts.colors.info), ...args)
    }

    error(...args: any[]) {
        console.error(this.prefix("error", this.opts.colors.error), ...args)
    }

    critical(...args: any[]) {
        console.error(this.prefix("critical", this.opts.colors.critical), ...args)
    }

    warn(...args: any[]) {
        console.warn(this.prefix("warn", this.opts.colors.warn), ...args)
    }
}

export const logger = new ColorizedLogger({
    debug: env.NODE_ENV === "development",
    colors: {
        error: AnsiColors.BRIGHT_RED,
        critical: AnsiColors.RED,
        debug: AnsiColors.YELLOW,
        info: AnsiColors.BLUE,
        warn: AnsiColors.BRIGHT_GREEN
    },
    format: {
        timestamp: true
    }
})