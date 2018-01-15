import { mkdirSync } from 'fs'
import path, { relative } from 'path'
import { execSync } from 'child_process'
import chalk from 'chalk'
import List from './List'
import { BACKUP_EXT } from './defaults'
import { BackupNotFoundError } from './errors'
import { separator } from './utils'


export default class BackupRestorer {

	constructor({ config, options }) {
		this.config = config;
		this.options = options;
	}

	//=================================================================================================================

	restore(date) {
		const isIncr = !!this.options.incr;
		const isDryRun = !!this.options.dryRun;
		const filename = `${date}.${BACKUP_EXT}`;

		// find the parent backup to restore
		const list = new List(this.config);
		const backups = list.findRestorationChain(date);
		if (!backups.length) { throw new BackupNotFoundError(`Backup ${date} not found`); }

		// display messages and run restoration chain
		console.log('');
		backups.forEach(backup => {
			const message = `Restoring ${backup.filepath}`;
			console.log(chalk.blue(message));
			console.log(chalk.blue(separator(message.length)));
			this._exec(backup);
			console.log('');
		});
	}


	//=============================================================================
	//=========================== Private Methods =================================
	//=============================================================================


	_exec({ filepath }) {
		const config = this.config;
		const target = path.resolve(config.target);
		
		// build command line: tar -xvpzf "$dir/$f" --numeric-owner >> $logFile 2>> $errFile
		const cmd = ['tar'];
		cmd.push('--extract');
		cmd.push('--file', `"${filepath}"`);
		cmd.push('--listed-incremental=/dev/null'); // useful ??
		cmd.push('--preserve-permissions');
		cmd.push('--numeric-owner'); // preserve extracted files' UID
		if (config.verbose)  { cmd.push('--verbose'); }
		if (config.compress) { cmd.push('--gzip'); }

		// build final command line
		const cmdLine = cmd.join(' ');
		
		// execute command
		if (this.options.dryRun) {
			console.log(chalk.bold.red('[DRY-RUN]'), chalk.red("cd'ing to:"), target);
			console.log(chalk.bold.red('[DRY-RUN]'), chalk.red('execute command:'), cmdLine);
		}
		else {
			const stdout = config.verbose ? process.stdout : 'ignore';
			const stdio = ['ignore', stdout, process.stderr];
			const result = execSync(cmdLine, { stdio, cwd : target });
		}
	}
}