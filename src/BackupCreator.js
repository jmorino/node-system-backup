

export default class BackupCreator {

	constructor({ config, options }) {
		this.config = config;
		this.options = options;
	}

	//=================================================================================================================

	backup() {
		console.log('backing up...');
		console.log(this.options.dryRun);
		console.log(this.options.incr);
	}
}