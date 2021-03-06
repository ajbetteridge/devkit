/* @license
 * This file is part of the Game Closure SDK.
 *
 * The Game Closure SDK is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * The Game Closure SDK is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with the Game Closure SDK.  If not, see <http://www.gnu.org/licenses/>.
 */

var fs = require('fs');
var ff = require('ff');
var path = require('path');

var common = require('../common');

exports.reinstall = function(next){
	var f = ff(this, function () {
		fs.readFile('./manifest.json', 'utf8', f());
	}, function (manifest) {
		var shortName = JSON.parse(manifest).shortName;

		//ugh, we need to figure out which was the more recent build
		var debugApk = {};
		var releaseApk = {};

		debugApk.path = path.join('./build/debug/native-android/', shortName + '.apk');
		debugApk.timestamp = (fs.existsSync(releaseApk.path))? +fs.statSync(debugApk.path).ctime : 0;
		
		releaseApk.path = path.join('./build/release/native-android/', shortName + '.apk'),
		releaseApk.timestamp = (fs.existsSync(releaseApk.path))? +fs.statSync(releaseApk.path).ctime : 0;

		//compare timestamps and install latest .apk
		common.child(
			'adb', ['install', '-r', (debugApk.timestamp > releaseApk.timestamp)? debugApk.path : releaseApk.path ],
			{ cwd: process.cwd() }, f.waitPlain());
	}).cb(next || process.exit);
};
