import { execSync } from 'child_process';
import { rmSync } from 'fs';
import WriteNeuConfig from './write-neu-config';

WriteNeuConfig();

const maxAttempts = 3;

for(let attempt = 1; attempt <= maxAttempts; attempt++) {
	try {
		execSync('neu update', { stdio: 'inherit' });
		break;
	}
	catch(error) {
		rmSync('.tmp', { recursive: true, force: true });
		if(attempt === maxAttempts) {
			throw error;
		}

		const retryDelay = attempt * 5000;
		console.warn(`Neutralino update failed (attempt ${attempt}/${maxAttempts}); retrying in ${retryDelay / 1000}s...`);
		Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, retryDelay);
	}
}
