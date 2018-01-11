import chalk from 'chalk'


export function handleErrors(callback) {
	return function(...args) {
		try { callback(...args); }
		catch(e) {
			console.log(chalk.red.bold('ERR:') + ' ' + e.message);
			process.exit(e.ERRNO || 999);
		}
	}
}
