const fs = require('fs');

module.exports = {

	mysql(fileName, newFilename, permitDropTable = true){

		return new Promise((resolve, reject) => {

			fs.readFile(fileName, 'utf-8', (err, data) => {

				if(err) return reject(err);

				// Remove os comentários(--)
				data = data.replace(/^--(.+|\n)/gm, '');

				// Remove todos os metadados do mysql(/*! ... */)
				data = data.replace(/^\/\*\!.+?;$/gm, '');

				if(!permitDropTable){

					data = data.replace(/^DROP TABLE IF EXISTS.*?$/gm, '');

				}

				// Remove as linhas em branco
				data = data.replace(/^\n+$/gm, "");

				// Remove o auto_increment
				data = data.replace(/\sAUTO_INCREMENT=[0-9]+\s/g, " ");

				// Caso tenha acabado com um \n no início, remove
				if(data.charCodeAt(0) === 10) data = data.substr(1);

				fs.writeFile(newFilename, data, 'utf-8', (err) => {

					if(err) return reject(err);

					resolve();

				});

			});

		});

	}

}