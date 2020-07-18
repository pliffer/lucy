var Menu = {

    open: function(){

        $('body').addClass('open-menu');
        $('.input-pl').select();

        $('.menu .lucy-title').val(Lucy.getTitle());

        Menu.reloadBtns();

    },

    close: function(){

        $('body').removeClass('open-menu');
        Lucy.term.focus();

    },

    save: function(input, answer){

        // @todo save all commands instead of only first

        if(typeof localStorage.savedBtns === 'undefined'){

            localStorage.savedBtns = "{}";

        }

        var parsed = JSON.parse(localStorage.savedBtns);

        if(parsed[input]){

            parsed[input].count++;

        } else{

            parsed[input] = {
                input: input,
                value: answer,
                count: 1
            };

        }

        localStorage.savedBtns = JSON.stringify(parsed);

        Menu.reloadBtns();

    },

    reloadBtns: function(){

        if(typeof localStorage.savedBtns === 'undefined'){

            localStorage.savedBtns = "{}";

        }

        var parsed = JSON.parse(localStorage.savedBtns);

        $('.btn-list').empty();

        Object.keys(parsed).forEach(function(input, k){
            
            $('.btn-list').append(Menu.genButton(input));

        });

        Keeper.db.commands.toArray().then(function(commandsDb){

            commandsDb.forEach(function(commandDb){

                $('.btn-list').append(Menu.genButton(commandDb.trigger));

            });

        });

    },

    genButton: function(input, edit){

        var button = $('<button tabindex="0">' + input + '</button>');

        button.on('focus', function(){

            $('.input-pl').val(input);

        });

        button.on('click', function(event){

            if(event.altKey){

                Menu.editCommand(input);

                return;

            }

            if(event.ctrlKey){

                Menu.openInOtherTab(input, event.shiftKey);

                return;

            }

            Menu.runCommand(input);

        });

        return button;

    },

    runCommand: function(trigger){

        $('.input-pl').val(trigger);

        // Simula uma tecla enter
        Menu.input({key: 'Enter'});

        Menu.close();

    },

    openInOtherTab: function(trigger, closeMenu){

        console.log(closeMenu)

        if(typeof closeMenu === 'undefined') closeMenu = false;

        Lucy.duplicateTab('?command=' + trigger);

        console.log(closeMenu)

        if(closeMenu) Menu.close();

    },

    editCommand: function(trigger){

        Keeper.db.commands.where('trigger').equals(trigger).toArray().then(function(triggerDb){

            triggerDb = triggerDb[0];

            if(triggerDb){

                Alerts.open('.edit-command', {

                    data: {
                        command: $('.input-pl').val()
                    },

                    showAwait: true,

                    ready: function(modal){

                        modal.find('[data-value=command]').text(triggerDb.trigger);
                        modal.find('textarea').text(triggerDb.command);

                        modal.show();

                    },

                    command: {

                        editar: function(modal){

                            var trigger = modal.find('[data-value=command]').text();
                            var command = modal.find('textarea').val();

                            Keeper.db.commands.put({
                                trigger: trigger,
                                command: command
                            }).then(function(){

                                Alerts.notify('Comando editado com sucesso');
                                Alerts.close(modal);
                                Menu.reloadBtns();

                            });

                        }

                    }

                });

            } else{

                Alerts.notify('O comando não existe');

            }

        });

    },

    newCommand: function(){

        Alerts.open('.new-command', {

            data: {
                command: $('.input-pl').val()
            },

            command: {

                criar: function(modal){

                    var trigger = modal.find('[data-value=command]').text();
                    var command = modal.find('textarea').val();

                    Keeper.db.commands.put({
                        trigger: trigger,
                        command: command
                    }).then(function(){

                        Alerts.notify('Comando criado com sucesso');
                        Alerts.close(modal);
                        Menu.reloadBtns();

                    });

                }

            }

        });

    },

    plclCallback: function(answer, save){

        if(typeof save === 'undefined') save = false;

        switch(answer){

            case 'NON_EXISTENT_COMMAND':

                $('.input-pl').addClass('err');
                $('.input-pl').select();
                Alerts.notify('<p>Commando não encontrado<p><p><button onclick="Menu.newCommand()">Criar novo comando</button></p>');

                return;

            break;
            case 'NOTIFY':

                Alerts.notify(answer);

                return;                

            break;

        }

        $('.input-pl').removeClass('err');

        if(save) Menu.save($('.input-pl').val(), answer);

        Lucy.socket.emit('data', answer + "\n");

        Menu.close();

    },

    getCommand: function(command){

        return Keeper.db.commands.where('trigger').equals(command).toArray().then(function(command){

            return command[0];

        });

    },

    input: function(event){

        var input = $('.input-pl');

        if(event.key == 'Enter'){

            // Procura o comando no banco de dados
            Menu.getCommand(input.val()).then(function(commandDb){

                // Caso o comando tenha sido encontrado
                if(commandDb){

                    Menu.plclCallback(commandDb.command);

                } else{

                    Alerts.notify('Comando não encontrado');

                }

            });

        }

        if(event.key == 'Escape'){

            Menu.close();

        }

    }

}