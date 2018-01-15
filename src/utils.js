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

//=================================================================================================================

export function toArray(obj) {
	return Array.isArray(obj) ? obj : [obj];
}


//=================================================================================================================

export function separator(length, char = '-') {
	return (new Array(length)).fill(char).join('');
}
