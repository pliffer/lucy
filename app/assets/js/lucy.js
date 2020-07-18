var Lucy = {

    additionalInfo: {},

	// Atalho responsável por abrir a mesma pasta no indexr
	openInIndexr: function(){

		// Abre uma nova guia com a pasta atual
		var win = window.open(Lucy.additionalInfo.indexr_host + location.pathname, '_blank');

		// Foca nessa janela
  		win.focus();

	},

    setTitleByUserHost: function(userHost){

        // Caso essa variável esteja definida
        if(Lucy.additionalInfo.username){

            // Se o usuário do userHost for igual ao usuário atual
            if(userHost.split('@')[0] === Lucy.additionalInfo.username){

                userHost = '@' + userHost.split('@')[1];

            }

        }

        Lucy.additionalInfo.userhost = userHost;

        Lucy.updateTitle();

    },

    updateTitle: function(){

        var folder = '';
        var prefix = '';
        var percentage = '';

        if(Lucy.additionalInfo.db){

        	prefix = '[db:' + Lucy.additionalInfo.db + '] ';

        }

        if(Lucy.additionalInfo.percentage){

        	percentage = ' (' + Lucy.additionalInfo.percentage + ') ';

        }
        
        var cwd = Lucy.additionalInfo.cwd

        // Caso tenha uma pasta, vamos adicionar ao título
        if(cwd){

        	cwd = cwd.replace('/home/' + Lucy.additionalInfo.username + '/', '~/');

            folder = ' - ' + cwd;
        }

        var title = Lucy.getTitle(false);

        if(title){

        	title = title + ' ';

        }

        // Vamos definir o titulo dessa maneira
        document.title = title + percentage + prefix + Lucy.additionalInfo.userhost + ' - Lucy' + folder;

    },

    duplicateTab: function(sufix){

    	if(typeof sufix === 'undefined') sufix = '';

        // Abre uma nova guia com a pasta atual
        var win = window.open(location.href + sufix, '_blank');

        // Foca nessa janela
        win.focus();

    },

	// Boleano true caso o sistema já tenha sido iniciado
	initialized: false,

	initialize: function(){

		setTimeout(function(){

			$('body').removeClass('loading');
			Lucy.initialized = true;

			setTimeout(function(){

				$('.loading-overlay').empty();

			}, 1000);

		}, 1000)

	},

	// Inicializa lucy
	init: function(){

		// Aplica plugin responsável por deixar o conteúdo responsivo
		Terminal.applyAddon(fit)

		// @todo Descrever melhor a ação desse plugin
		Terminal.applyAddon(winptyCompat)

		Lucy.term = new Terminal()

		Lucy.term.open($('#terminal').get(0))

		Lucy.fit()

		Lucy.term.focus()

		Lucy.term.attachCustomKeyEventHandler(Lucy.keyPress)

		Lucy.term.on('data', function(data){

			if(Lucy.socket) Lucy.socket.emit('data', data)
			else{
				console.log('aeeeeeee')
			}

		});

		Lucy.socket = io.connect('/terminal')

		Lucy.socket.on('connect', function(){

			Lucy.socket.emit('login', Lucy.term.cols, Lucy.term.rows, Lucy.getCwd())

			Lucy.fit()

		});

        Lucy.socket.on('file upload success', function(){

        	Alerts.notify('Arquivo copiado com sucesso.');

            Filedialog.close();

        });

        Lucy.socket.on('message', function(msg){

            Alerts.notify(msg);

        });

		Lucy.socket.on('disconnect', function(){

			Lucy.term.write('\n\rLucy desconectado...\n\r')

		});

		Lucy.socket.on('data', function(data){

            if(data[0] === "\u001b" && data[1] === "]" && data[2] === "0" && data[3] === ";"){

                var userHostReg = /\u001b\]0;([a-z_][a-z0-9_-]+@[a-zA-Z-.0-9]+):/g;

                var userHost = userHostReg.exec(data)[1];

                Lucy.additionalInfo.db = '';

                Lucy.setTitleByUserHost(userHost);

            } else if(data.match(/MariaDB\s\[.+?\]/g)){

            	var database = data.trim().split(' [')[1].replace(')]>', '').replace(']>', '').replace('(', '');

            	Lucy.additionalInfo.db = database;

            	Lucy.updateTitle();

            }

            // Caso a linha retornada pelo lucy possua alguma porcentagem, vamos colocar isso
            // no título, ou em outro lugar que o usuário possa ter controle
            if(data.match(/[0-9\.,]+\%/g)){

            	Lucy.additionalInfo.percentage = data.match(/[0-9\.,]+\%/g)[0];

            	Lucy.updateTitle();

            } else{

				if(Lucy.additionalInfo.percentage){

					// Caso não exista porcentagem, vamos resetar
					Lucy.additionalInfo.percentage = '';
					Lucy.updateTitle();

				}

            }

			if(!Lucy.initialized){
				Lucy.initialize()
			}

			if(!document.hasFocus()){

				Lucy.favicon.updating();

			}

			Lucy.term.write(data)

		})

		Lucy.socket.on('chdir', function(dir){

			Lucy.setDir(dir);

            Lucy.additionalInfo.cwd = dir;

            Lucy.updateTitle();

		});

        Lucy.socket.on('additional info', function(info){

            Lucy.additionalInfo = info;

        });

		Lucy.socket.on('recovered', function(dir){

			Lucy.setDir(dir);

			Lucy.term.write("\n");

		})

	},

	getCwd: function(){

		var params = Util.urlParams();

		if(params.command){

			Menu.runCommand(params.command);

		}

		var cwd = location.pathname.replace('/' + Lucy.getTitle(true) + '/-', '');

		if(cwd.substr(0, 3) === '/-/') cwd = cwd.substr(2);

		return cwd;

	},

	setDir: function(dir){

		if(Lucy.getTitle()){
			
			Lucy.updateUrl(Lucy.getTitle(true), '/-', dir);

		} else{

			Lucy.updateUrl(dir);

		}


	},

	titleKeydown: function(event){

		if(event.keyCode === 27) return Menu.close();

		Lucy.setTitle($('.lucy-title').val());

	},

	setTitle: function(title){

		title = title.trim().replace(/\s/g, '-');

		if(title){

			Lucy.updateUrl(title, '/-', Lucy.getCwd());

		} else{

			Lucy.updateUrl(Lucy.getCwd());

		}

	},

	getTitle: function(showDashes){

		if(typeof showDashes === 'undefined') showDashes = false;

		var title = '';

		var splitted = location.pathname.split('/-/');

		if(splitted.length == 2 && splitted[1].substr(0, 5) === 'home/'){

			title = splitted[0].substr(1);

			if(showDashes){

				title = title.replace(/\s/g, '-');

			} else{

				title = title.replace(/\-/g, ' ');

			}

		}

		return title;

	},

	updateUrl: function(){

		var finalUrl = "";

		// Dado os argumentos que estão dentro dessa função
		for(var i = 0; i < arguments.length; i++){

			finalUrl += arguments[i];

		}

		// @todo Verificar se finalUrl é uma url válida para não dar
		// erro na função abaixo

		// Garante que se inicia com /, caso contrário, fica adicionando
		// várias urls em cima das outras
		if(finalUrl[0] !== '/') finalUrl = '/' + finalUrl;

		history.pushState(null, null, finalUrl);

		Lucy.updateTitle();

		return finalUrl;

	},

	// Guarda tarefas relacionadas ao ícone do lucy
	favicon: {

		// Guarda o timeout responsável pelo updating
		updatingTimeout: null,

		// Guarda o tempo em milissegundos que o ícone de updating permanece, após uma atualização
		// no console
		updatingDelay: 2000,

		// Muda para o ícone padrão do lucy
		normal: function(){

			// Limpa o timeout, resetando assim que mudarmos para o ícone normal
			clearTimeout(Lucy.favicon.updatingTimeout);

			Default.changeFavicon('/img/favicon.png');

		},

		// Mostra que foi feita uma ação no console
		update: function(){

			Default.changeFavicon('/img/favicon-update.png');

		},

		// Mostra que ainda está sendo feita uma ação no console
		updating: function(){

			// Limpa o timeout
			clearTimeout(Lucy.favicon.updatingTimeout);

			// Depois de certo tempo (updatingDelay), o ícone torna-se de uma cor de update
			Lucy.favicon.updatingTimeout = setTimeout(Lucy.favicon.update, Lucy.favicon.updatingDelay);

			// Deixa o ícone avermelhado
			Default.changeFavicon('/img/favicon-updating.png');

		}

	},

	command: function(key, data){

		if(!Lucy.socket) return;

		let obj = {}

		obj[key] = data

		Lucy.socket.send('$-lucy-command-$ ' + JSON.stringify(obj))

	},

	fit: function(){

		Lucy.term.fit()

		if(Lucy.socket && Lucy.socket.connected){
			Lucy.socket.emit('resize', Lucy.term.cols, Lucy.term.rows);
		}

	},

	// Guarda a última tecla pressionada, para usar no doublectrl
    lastKey: {},

    isDoubleCtrl: function(event){

    	return (

        	// Se a tecla atual for do tipo CTRL
        	event.key === 'Control'

        	// E a última tecla também foi CTRL
        	&& Lucy.lastKey.key === 'Control'

        	// E nessa ultima tecla, não teve alt
        	&& !Lucy.lastKey.altKey

        	// Nem shift
        	&& !Lucy.lastKey.shiftKey

        	// E foi antes do período de 700 milésimos
        	&& (new Date().getTime() - Lucy.lastKey.time) < 400

        	// E a tecla atual não tem alt
        	&& !event.altKey
        	
        	// Nem shift
        	&& !event.shiftKey

    	);

    },

	keyPress: function(key){

        if(Lucy.isDoubleCtrl(key)){

            Lucy.lastKey = {};

            Menu.open();

        } else{

            Lucy.lastKey = {
                key: key.key,
                altKey: key.altKey,
                shiftKey: key.shiftKey,
                time: new Date().getTime()
            }
            
        }

		if(key.key === 'F5'){

			window.location.reload()

		}

        if(key.code === 'KeyD' && key.ctrlKey && key.shiftKey){

            Lucy.duplicateTab();
            key.preventDefault();

        }

	},

	_last_selection: null,

	checkUsefulSelection: function(){

		var selection = Lucy.term.getSelection();

		// Se a seleção possui um número válido
		if(!isNaN(selection)){

			// E for maior que esse número(Sat Mar 03 1973)
			if(Number(selection) > 100000000000){

				var date = new Date(Number(selection));

				// Se for uma data válida
				if(date.toString() !== "Invalid Date"){

					var new_selection = date.toString();

					if(Lucy._last_selection != new_selection){

						Lucy._last_selection = new_selection;

						Alerts.pointerNotify(Util.getDateString(date.getTime()));

						setTimeout(function(){

							// Se a mensagem continuar sendo a mesma
							if(Lucy._last_selection == new_selection){

								Lucy._last_selection = null;

							}

						}, 4000);

					}

				}

			}

		}

	}

}