import path, { relative } from 'path'
import { execSync } from 'child_process'
import chalk from 'chalk'
import List from './List'


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
		const ext = 'tar.gz';

		if (isIncr) {
			const list = new List(this.config);
			const parent = list.findParent(basename);

			// TODO check if parent === basename: backup already exists for today

			const dir = path.parse(parent.filepath).dir;
			const filename = `${basename}.${ext}`;
			this._exec({ dir, filename });
		}
	}


	//=============================================================================
	//=========================== Private Methods =================================
	//=============================================================================


	_exec({ dir, filename }) {
		const filepath = path.join(dir, filename);
		const target = path.resolve(this.config.target);
		
		// build command line
		const cmd = ['tar', '-czvpf', `"${filepath}"`];

		// append options: incremental
		if (this.options.incr) {
			const manifest = path.join(dir, 'MANIFEST');
			cmd.push(`--listed-incremental="${manifest}"`);
		}

		// append options: excluded directories
		this.config.excludes.forEach(excludedDir => {
			const excludedPath = path.resolve(excludedDir);
			const relativePath = path.relative(target, excludedPath);
			
			// ignore all paths that are not included in target
			if (relativePath.charAt(0) === '.') { return; }

			cmd.push(`--exclude="${relativePath}"`);
		});

		// append target
		cmd.push(target);

		// build final command line
		const cmdLine = cmd.join(' ');
		
		// execute command
		if (this.options.dryRun) {
			console.log(chalk.red('[DRY-RUN]'), chalk.cyan(cmdLine));
		}
		else {
			const result = execSync(cmdLine, { cwd : target });
		}
	}
}