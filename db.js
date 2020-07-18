const path   = require('path');
const fs     = require('fs-extra');
const colors = require('colors');

var Engines = {

    mysql: function(){

        var mysql  = require('mysql');

        var client = mysql.createConnection({
            host     : global.env.MYSQL_HOST,
            user     : global.env.MYSQL_USER,
            password : global.env.MYSQL_PASS,
            database : global.env.MYSQL_DB
        });

        client.connect( err => {
            if(err) throw err;
            else console.log("\n\nConexão de '" + global.env.MYSQL_USER.green + "'@'" + global.env.MYSQL_HOST.green + "' no MySql(" + global.env.MYSQL_DB + ") bem sucedida!\n\n");
        });

        // Mantém a conexão ativa, fazendo uma querry a cada 10 segundos
        setInterval( () => {
            client.query("SELECT 1");
        }, 10000);

        // Retorna apenas a primeira ROW
        client.readQuery = (sql, prepared) => {

            return new Promise(function(resolve, reject){

                // Mostra um aviso, caso a query não tenha limit 1 no final
                if(sql.substr(-7).toLowerCase()!='limit 1'){
                    console.warn("Database.js: read Query sem limit 1");
                }

                // Executa a query
                client.query(sql, prepared, (err, answer) => {

                    if(err) reject(err);
                    else(resolve(answer[0]));

                });

            });

        };

        // Retorna apenas a primeira ROW
        client.updateQuery = (sql, prepared) => {

            prepared = prepared || [];

            return new Promise(function(resolve, reject){

                // Executa a query
                client.query(sql, prepared, (err) => {

                    if(err) return reject(err);
                    
                    resolve();

                });

            });

        };

        // Retorna a lista de rows
        client.fetch = function(sql, prepared, callback){

            return new Promise((resolve, reject) => {

                client.query(sql, prepared, (err, answer) => {

                    if(err) reject(err);
                    else resolve(answer);

                });

            });

        };

        client.uuid = function(){
            return new Promise((resolve, reject) => {

                client.readQuery(`SELECT UUID() as uuid LIMIT 1`).then(uuid => {
                    resolve(uuid.uuid);
                }).catch(reject);

            });
        }

        function doBackup(){

            console.log("\nRealizando backup completo\n");

            require('child_process').exec("mysqldump -u " + global.env.MYSQL_USER + " --password=\"" + global.env.MYSQL_PASS + "\" " + global.env.MYSQL_DB + " > .sql/db_backup.sql");

            var sqlFinalName = path.join(global.dir.sql, global.env.MYSQL_DB + "_structure.sql");

            // Guarda uma versão .sql responsável pela estrutura
            require('child_process').exec("mysqldump -u " + global.env.MYSQL_USER + " --password=\"" + global.env.MYSQL_PASS + "\" -d " + global.env.MYSQL_DB + " > " + sqlFinalName);

            // Dá o tempo para a exportação da estrutura, mas fazer isso de forma mais inteligente no futuro
            // @todo
            setTimeout(function(){

                global.helpers.clearExport.mysql(sqlFinalName, sqlFinalName, false);

            }, 4000);

        }

        // Backup do mysql a cada dia
        setInterval(doBackup, 1000 * 60 * 60 * 1);

        doBackup()

        return client;

    }

}

module.exports = Engines.mysql();