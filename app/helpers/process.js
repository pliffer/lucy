const cmd = require('node-cmd');

const Process = {

	cmd(command){

		return new Promise((resolve, reject) => {

			cmd.get(command, (err, data, stderr) => {

				if(err) return reject(err);
				resolve(data);

			});

		});
		
	},

	pwdx(pid){

		return Process.cmd(`readlink /proc/${pid}/cwd`);

	}

}

module.exports = Process;