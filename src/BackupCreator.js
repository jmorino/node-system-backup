import { mkdirSync } from 'fs'
import path, { relative } from 'path'
import { execSync } from 'child_process'
import chalk from 'chalk'
import List from './List'
import { BACKUP_EXT } from './defaults'
import { NoFullBackupFoundError } from './errors'


export default class BackupCreator {

	constructor({ config, options }) {
		this.config = config;
		this.options = options;
	}

	//=================================================================================================================

	backup() {
		const isIncr = !!this.options.incr;
		const isDryRun = !!this.options.dryRun;
		const basename = (new Date()).toISOString().slice(0, 10);
		const filename = `${basename}.${BACKUP_EXT}`;

		if (isIncr) {
			// find the parent backup to create the new incremental backup against
			const list = new List(this.config);
			const parent = list.findParent(basename);
			if (!parent) { throw new NoFullBackupFoundError('No previous full backup found'); }

			// TODO check if parent === basename: backup already exists for today

			// run backup
			const dir = path.parse(parent.filepath).dir;
			this._exec({ dir, filename });
		}
		else {
			// create a new dir for the full backup
			const dir = path.resolve(path.join(this.config.backupDir, basename));
			if (this.options.dryRun) {
				console.log(chalk.bold.red('[DRY-RUN]'), chalk.red('create directory:'), dir);
			}
			else {
				mkdirSync(dir);
			}

			// run backup
			this._exec({ dir, filename });
		}
	}


	//=============================================================================
	//=========================== Private Methods =================================
	//=============================================================================


	_exec({ dir, filename }) {
		const config = this.config;
		const filepath = path.join(dir, filename);
		const target = path.resolve(config.target);
		const manifest = path.join(dir, 'MANIFEST');
		
		// build command line: tar -czvpf "$filepath"
		const cmd = ['tar'];
		cmd.push('--create');
		cmd.push('--file', `"${filepath}"`);
		cmd.push('--preserve-permissions');
		cmd.push(`--listed-incremental="${manifest}"`);
		if (config.verbose)  { cmd.push('--verbose'); }
		if (config.compress) { cmd.push('--gzip'); }

		// append options: excluded directories
		config.excludes.forEach(excludedDir => {
			const excludedPath = path.resolve(excludedDir);
			const relativePath = path.relative(target, excludedPath);
			
			// ignore all paths that are not included in target
			if (relativePath.slice(0,2) === '..') { return; }

			cmd.push(`--exclude="${relativePath}"`);
		});

		// append target
		cmd.push(target);

		// build final command line
		const cmdLine = cmd.join(' ');
		
		// execute command
		if (this.options.dryRun) {
			console.log(chalk.bold.red('[DRY-RUN]'), chalk.red("cd'ing to:"), target);
			console.log(chalk.bold.red('[DRY-RUN]'), chalk.red('execute command:'), cmdLine);
		}
		else {
			const result = execSync(cmdLine, { cwd : target });
		}
	}
}