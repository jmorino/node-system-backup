import StorageFS from "./StorageFS";
import StorageNFS from "./StorageNFS";
import { InvalidConfigurationError } from "../errors";


export function getStorage(storage) {
	switch(storage.type) {
		case 'fs':  return new StorageFS(storage);
		case 'nfs': return new StorageNFS(storage);

		default: throw new InvalidConfigurationError(`Unsupported storage type ${storage.type}`);
	}
}
