import chalk from "chalk";

global.WARN = (message) => console.log(chalk.yellow(message))
global.ERROR = (message) => console.log(chalk.red(message))
global.SUCCESS = (message) => console.log("✅", chalk.greenBright(message))
global.LOG = (message) => console.log(chalk.blue(message))
global.CODE = (message, code) => console.log(chalk.blueBright(message), chalk.bgBlueBright(code))
