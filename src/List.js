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

	//=================================================================================================================

	display() {
		const backups = this.backups();

		console.log('Available backups:');
		backups.forEach(bkp => {
			if (bkp.parent === bkp.name) {
				console.log('  ' + chalk.red(bkp.name + ' - full backup'));
			}
			else {
				console.log('  ' + chalk.cyan(bkp.name + ' - incremental backup'));
			}
		});
	}

	//=================================================================================================================
	
	backups() {
		const files = find.fileSync(/\.tar$/, path.resolve(this.config.backupDir))
			.map(filepath => {
				const file   = path.parse(filepath);
				const dir    = file.dir;
				const parent = path.basename(dir);
				const name   = file.name;
				return { filepath, parent, name, dir };
			})
			.sort((a, b) => {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return +1; }
				return 0;
			});
		
		return files;
	}

	//=================================================================================================================

	findParent(basename) {
		const backups = this.backups();
		
		// if name already exists, return its parent
		const backup = backups.find(file => file.name === basename);
		if (backup) {
			return backups.find(file => file.name === backup.parent);
		}

		// otherwise, return the latest full backup that is anterior to name
		return backups.filter(file => file.name === file.parent && file.name <= basename).pop();
	}
}