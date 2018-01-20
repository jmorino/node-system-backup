import { mkdirSync } from 'fs'
import path, { relative } from 'path'
import { execSync } from 'child_process'
import chalk from 'chalk'
import List from './List'
import { BACKUP_EXT } from './defaults'
import { NoFullBackupFoundError } from './errors'
import { toArray } from './utils'


export default class BackupCreator {

	constructor({ config, storage, options }) {
		this.config = config;
		this.options = options;
		this.storage = storage;
	}

	//=================================================================================================================

	backup() {
		const isIncr = !!this.options.incr;
		const isDryRun = !!this.options.dryRun;
		const basename = (new Date()).toISOString().slice(0, 10);
		const filename = `${basename}.${BACKUP_EXT}`;

		if (isIncr) {
			// find the parent backup to create the new incremental backup against
			const list = new List(this.config, this.storage, this.options);
			const parent = list.findParent(basename);
			if (!parent) { throw new NoFullBackupFoundError('No previous full backup found'); }

			// TODO check if parent === basename: backup already exists for today

			// run backup
			const dir = path.parse(parent.filepath).dir;
			this._exec({ dir, filename });
		}
		else {
			// create a new dir for the full backup
			const dir = path.resolve(path.join(this.storage.path, basename));
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
		const cwd = '/';
		const filepath = path.join(dir, filename);
		const manifest = path.join(dir, 'MANIFEST');
		const includes = toArray(config.includes);
		
		// build command line
		const cmd = ['tar'];
		cmd.push('--create');
		cmd.push('--file', `"${filepath}"`);
		cmd.push('--preserve-permissions');
		cmd.push('--absolute-names');
		cmd.push(`--listed-incremental="${manifest}"`);
		if (config.verbose)  { cmd.push('--verbose'); }
		if (config.compress) { cmd.push('--gzip'); }

		// append options: excluded directories
		toArray(config.excludes).forEach(dir => cmd.push(`--exclude="${dir}"`));
		
		// append targets
		toArray(includes).forEach(dir => cmd.push(dir));

		// build final command line
		const cmdLine = cmd.join(' ');
		
		// execute command
		if (this.options.dryRun) {
			console.log(chalk.bold.red('[DRY-RUN]'), chalk.red('change cwd:'), cwd);
			console.log(chalk.bold.red('[DRY-RUN]'), chalk.red('execute command:'), cmdLine);
		}
		else {
			const stdout = config.verbose ? process.stdout : 'ignore';
			const stdio = ['ignore', stdout, process.stderr];
			const result = execSync(cmdLine, { cwd, stdio });
		}
	}

	//=================================================================================================================

	_resolveDirs(dirs, relativeTo = '/') {
		return toArray(dirs).map(dir => path.resolve(relativeTo, dir));
	}
}