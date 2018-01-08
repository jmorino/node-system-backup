import path from 'path'
import fs from 'fs'
import find from 'find'
import chalk from 'chalk';
import { Full, Incr } from './types'


export default class List {

	constructor(config, options) {
		this.config = config;
		this.options = options;
	}


	display() {
		const backups = this.backups();
		console.log('Available backups:');
		backups.forEach(bkp => {
			if (bkp.type === Full) {
				console.log('  ' + chalk.red(bkp.name));
			}
			else {
				console.log('  ' + chalk.cyan(bkp.name));
			}
		});
	}

	backups() {
		// const files = fs.readdirSync(path.resolve(this.config.backupDir));
		const files = find.fileSync(/\.tar$/, path.resolve(this.config.backupDir));
		return files.map(filepath => {
			const file = path.parse(filepath);
			const parent = path.basename(file.dir);
			return {
				filepath,
				name : file.name,
				type : parent === file.name ? Full : Incr,
			};
		});
	}
}