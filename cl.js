require('colors');
const opn = require('opn');

let Cl = {

    init(p){

        p.stdin.setEncoding('utf8')
        p.stdin.on('data', Cl.execute)

    },

    execute(data){

        data = data.replace(/\n/g, '');

        // Linha em branco
        console.log("");

        if(typeof Cl.commands[data] === 'function'){

            Cl.commands[data](Cl.config);

        } else{

            console.log("Comando não encontrado, para criar, digite: " + "create command\n".red);

        }

    },

    config: {

        port: 8989,

    },

    commands: {

        'show terminals'(){

            console.log(global.terminals);

        },

        'create command'(config){

            opn(__filename);

        },

        open(config){

            opn('http://localhost:' + config.port);

        },

        astro(config){

            opn(config.astro);

        },

        folder(config){

            var folder = "";
            var findArg = '--folder=';

            global.args.forEach(arg => {

                if(arg.substr(0, findArg.length) == findArg){

                    folder = arg.substr(findArg.length);

                }

            })

            global.help.opn("https://lucy.pli" + folder);

        },

        rs(){}

    }

}

module.exports = Cl;