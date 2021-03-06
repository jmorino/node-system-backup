import path from 'path'
import fs from 'fs'
import find from 'find'
import chalk from 'chalk';
import { Full, Incr } from './types'
import { BACKUP_EXT } from './defaults'


export default class List {

	constructor(config, storage, options) {
		this.config = config;
		this.options = options;
		this.storage = storage;
	}

	//=================================================================================================================

	display() {
		const backups = this.backups();

		if (!backups.length) {
			console.log('');
			console.log('No backup found.');
			return;
		}

		console.log('');
		console.log('Available backups:');
		console.log('------------------');
		backups.forEach(bkp => {
			if (bkp.parent === bkp.name) {
				console.log('  ' + chalk.red(bkp.name + ' - full backup'));
			}
			else {
				console.log('  ' + chalk.cyan(bkp.name + ' - incremental backup'));
			}
		});
		console.log('');
	}

	//=================================================================================================================
	
	backups() {
		const ext = '.' + BACKUP_EXT;
		const regex = new RegExp(ext + '$');
		const files = this.storage.list(regex)
			.map(filepath => {
				const file   = path.parse(filepath);
				const dir    = file.dir;
				const parent = path.basename(dir);
				const name   = path.basename(file.base, ext);
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

	//=================================================================================================================

	findRestorationChain(basename) {
		const backups = this.backups();

		const target = backups.find(file => file.name === basename);
		if (!target) { return []; }

		const parent = backups.find(file => file.name === target.parent);

		return backups.slice(backups.indexOf(parent), backups.indexOf(target) + 1);
	}
}