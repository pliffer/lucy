const notifier  = require('node-notifier');
const pty       = require('node-pty');
const fs        = require('fs-extra');
const path      = require('path');

// let plcl  = require(global.dir.root + '/modules/plcl');

const commands = {

    resize(shell, cols){

        shell.resize(cols)

    },

    clear(){

        console.log('Limpando os terminais')

        Object.keys(global.terminals).forEach(pid => {

            global.terminals[pid].shell._close();

        });

        process.exit();

    }

}

process.on('SIGINT', commands.clear);
process.on('SIGUSR1', commands.clear);

global.terminals = {};

module.exports = {

    setup(io){

        io.of('/terminal', (socket) => {

            let shell = null;

            socket.on('login', (cols, rows, cwd = process.cwd()) => {

                // Serve para casos em que há espaços na cwd
                cwd = decodeURI(cwd);

                if(!shell){

                    socket.emit('chdir', cwd);
                    socket.emit('additional info', {
                        cwd: cwd,
                        username: process.env.username,
                        indexr_host: process.env.INDEXR_HOST
                    });

                    notifier.notify({
                        title: 'Novo terminal aberto',
                        message: cwd
                    });

                    shell = pty.spawn('/bin/bash', [], {
                        name: 'xterm-color',
                        env: process.env,
                        cwd: cwd,
                        cols: cols,
                        rows: rows
                    });

                } else{

                    global.terminals[shell.pid].connected = true;

                    setTimeout(function(){

                        shell.write(String.fromCharCode(13));

                    }, 1000)

                    global.helpers.process.pwdx(shell.pid).then(recoveredCwd => {

                        socket.emit('recovered', recoveredCwd);

                    });

                }

                global.terminals[shell.pid] = {
                    shell: shell,
                    connected: true
                };

                socket.on('disconnect', () => {

                    shell._close();
                    delete global.terminals[shell.pid];

                });

                shell.on('data', async data => {

                    socket.emit('data', data)

                    if(data.charCodeAt(data.length-1) !== 32) return;

                    const newCwd = await global.helpers.process.pwdx(shell.pid);

                    if(cwd != newCwd){

                        cwd = newCwd;

                        socket.emit('chdir', cwd);

                    }

                })

                socket.on('resize', (cols, rows) => {

                    shell.resize(cols, rows)

                })

                // socket.on('plcl', (command, callback) => {

                //     plcl.run(command.toString()).then(callback);

                // });

                socket.on('file upload', data => {

                    var name = data.name.trim();
                    var dest = data.cwd.trim();
                    var base = data.data;

                    var finalPath = path.join(dest, name);

                    fs.writeFile(finalPath, base.split(';base64,').pop(), 'base64', function(err){

                        if(err){

                            socket.emit('message', err.toString());

                            throw err;

                        } else{

                            socket.emit('file upload success');

                        }

                    });

                });

                socket.on('data', msg => {

                    let msgSplit = msg.split('$-lucy-command-$ ');

                    if(msgSplit.length > 1){

                        let command = JSON.parse(msgSplit[1]);

                        commands[Object.keys(command)[0]](shell, command[Object.keys(command)[0]]);

                        return;

                    }

                    shell.write(msg);

                });

            });

        });

    }

}