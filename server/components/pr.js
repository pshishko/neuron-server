/**
 * Created by tur on 2/18/14.
 */

module.exports = function (data, stop) {

	var isStopScript = stop || false;
	var traceLine = (new Error).stack.split("\n")[2];
	var nameLine = traceLine.slice(traceLine.lastIndexOf("/") + 1, traceLine.length);

	if (typeof data == 'object') {
		console.log('\n>>> ******************************************************************************'.yellow);
		console.log("[", nameLine, "][", typeof data, "] ==> ", data);
		console.log('>>> ******************************************************************************'.yellow);
	} else {
		console.log("\n>>> [%s][%s] ==> %s", nameLine, typeof data, data);
	}

	if (isStopScript) {
		console.warn('Server stopped successfully'.red);
		process.exit(1);
	}

	return true;
};