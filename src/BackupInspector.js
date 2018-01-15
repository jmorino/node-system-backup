import { mkdirSync } from 'fs'
import path, { relative } from 'path'
import { execSync } from 'child_process'
import chalk from 'chalk'
import List from './List'
import { BACKUP_EXT } from './defaults'
import { BackupNotFoundError } from './errors'
import { separator } from './utils'


export default class BackupInspector {

	constructor({ config, options }) {
		this.config = config;
		this.options = options;
	}

	//=================================================================================================================

	inspect(date) {
		const isIncr = !!this.options.incr;
		const isDryRun = !!this.options.dryRun;
		const filename = `${date}.${BACKUP_EXT}`;

		// find the parent backup to restore
		const list = new List(this.config);
		const backups = list.backups();
		const backup = backups.find(file => file.name === date);
		if (!backup) { throw new BackupNotFoundError(`Backup ${date} not found`); }

		// display archive content
		console.log('');
		console.log(chalk.blue(backup.filepath));
		console.log(chalk.blue(separator(backup.filepath.length)));
		this._exec(backup);
		console.log('');
	}


	//=============================================================================
	//=========================== Private Methods =================================
	//=============================================================================


	_exec({ filepath }) {
		const config = this.config;
		
		// build command line: tar -tf "$dir/$f"
		const cmd = ['tar'];
		cmd.push('-t');
		cmd.push('--file', `"${filepath}"`);

		// build final command line
		const cmdLine = cmd.join(' ');
		
		// execute command
		const result = execSync(cmdLine, { stdio: ['ignore', process.stdout, process.stderr] });
	}
}