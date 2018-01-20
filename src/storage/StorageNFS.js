import path from 'path'
import { execSync } from 'child_process'
import chalk from 'chalk'
import StorageFS from './StorageFS'


export default class StorageNFS extends StorageFS {

	constructor(config) {
		super(config);
		delete this.path;
	}


	//=============================================================================
	//=========================== Public Methods ==================================
	//=============================================================================


	// @override
	prepare({ dryRun }) {
		const { server, path, mountPoint } = this.config;
		const absMountPoint = path.resolve(mountPoint);
		const cmdLine = `mount ${server}:${path} ${absMountPoint}`;
		
		if (dryRun) {
			console.log(chalk.bold.red('[DRY-RUN]'), chalk.red('prepare FS storage:'), cmdLine);
		}
		else {
			this._exec(cmdLine);
		}
		
		this.path = absMountPoint;
	}
	
	//=================================================================================================================
	
	// @override
	clean({ dryRun }) {
		if (!this.path) { return }

		const cmdLine = `umount ${absMountPoint}`;
		if (dryRun) {
			console.log(chalk.bold.red('[DRY-RUN]'), chalk.red('clean FS storage:'), cmdLine);
		}
		else {
			this._exec(cmdLine);
		}
		delete this.path;
	}


	//=============================================================================
	//=========================== Private Helpers =================================
	//=============================================================================


	_exec(cmdLine) {
		const stdio = ['ignore', process.stdout, process.stderr];
		const result = execSync(cmdLine, { stdio });
	}
}