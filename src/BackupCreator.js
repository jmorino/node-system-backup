import path from 'path'
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
		// build command line
		const filepath = path.resolve(dir, filename);
		const cmd = ['tar', '-czvpf', filepath];

		// append options: incremental
		if (this.options.incr) {
			const manifest = path.resolve(dir, 'MANIFEST');
			cmd.push(`--listed-incremental=${manifest}`);
		}

		// append options: excluded directories
		this.config.excludes.forEach(excludedDir => {
			const excludedPath = path.resolve(excludedDir);
			cmd.push(`--exclude="${excludedPath}"`);
		});

		// append target
		const target = path.resolve(this.config.target);
		cmd.push(target);

		// build final command line
		const cmdLine = cmd.join(' ');
		
		// execute command
		if (this.options.dryRun) {
			console.log(chalk.green('[DRY-RUN]'), cmdLine);
		}
		else {
			const result = execSync(cmdLine, { cwd : target });
		}
	}
}