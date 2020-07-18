// @version 8 de janeiro, 2020

function Alerts(){

}

Alerts.setup = function(){

    $('body').append($('<div class="alertsjs-modalarea"></div>'));

}

Alerts.pointerNotify = function(msg, delay){

    var elm = Alerts.notify(msg, delay);

    elm.addClass('pointer');

    elm.css('left', Environment.mouse.x + 20);
    elm.css('top', Environment.mouse.y  + 20);
    elm.css('background-color', '#009688');
    elm.css('color', 'white');
    elm.css('padding', '3px');

}

Alerts.centralize = function(modal){

    modal.css('left', ($('body').width() / 2) - (modal.outerWidth() / 2));
    modal.css('top', (window.screen.availHeight / 2) - (modal.outerHeight() / 2));

}

Alerts.__tabs = [];

Alerts.updateTabs = function(reload){

    if(typeof reload === 'undefined'){

        reload = true;

    }

    // É iniciado a variável responsável pelas guias
    var tabs = [];

    if(reload){

        // Ao passar por todos os modais, armazenamso a lista de guias
        $('body .alertsjs-modalarea .o-modal').each(function(){

            tabs.push({

                // Título da guia
                title: $(this).find('.hidden .title').html(),

                // Está minimizado?
                minimized: $(this).hasClass('modal-minimized'),

                // Guardar o modal para uso posterior
                modal: $(this)

            });

        });

        // Vamos limpar o elemento que guarda as guias
        $('.subheader .modals').empty();

        Alerts.__tabs = tabs;

    } else{

        Alerts.__tabs.forEach(function(tab){

            tab.minimized = tab.modal.hasClass('modal-minimized');

        });

    }

    // Passa por todas as guias
    Alerts.__tabs.forEach(function(tab){

        var modalTab = tab.elm;

        if(reload){

            // Cria o elemento da guia
            modalTab = $('<div class="modal-tab">' + tab.title + '</div>');

        }

        // Caso o modal esteja minimizado
        if(tab.minimized){

            // Mudamos o aspecto visual
            modalTab.addClass('maximize');

        } else{

            modalTab.removeClass('maximize');

        }

        if(tab.modal.hasClass('focused-modal')){

            modalTab.addClass('focused-tab');

        } else{

            modalTab.removeClass('focused-tab');

        }

        if(reload){

            // Quando a guia for clicada
            modalTab.on('click', function(){

                // E o modal tiver a classe minimizado
                if(tab.modal.hasClass('modal-minimized')){

                    // Vamos maximizar o modal
                    Alerts.maximize(tab.modal);

                } else{

                    // Caso contrário, vamos minimizar
                    Alerts.minimize(tab.modal);

                }

            });

        }

        tab.elm = modalTab;

        if(reload){

            // Por fim, vamos adicionar a guia ao elemento que guarda
            // todas as guias
            $('.subheader .modals').append(modalTab)

        }

    });

}

Alerts.log = function(content){

    console.log(content);

    Alerts.notify(content);

}

Alerts.blur = function(modal){

    modal.removeClass('focused-modal');

    Alerts.updateTabs(false);

}

Alerts.focus = function(modal){

    // Desfoca a modal atualmente focada
    $('.focused-modal').removeClass('focused-modal');

    // Remove o minimizado, caso esteja
    modal.removeClass('modal-minimized');

    // Foca a modal do argumento
    modal.addClass('focused-modal');

    // Atualiza o visual das tabs
    Alerts.updateTabs(false);

}

Alerts.open = function(cls, opts){

    if(typeof opts === 'undefined'){

        opts = {
            unique: false,
            data: {}
        }

    }

    if(typeof opts.showAwait === 'undefined'){

        opts.showAwait = false;

    }

    if(typeof opts.identifier === 'undefined'){

        opts.identifier = false;

    }

    // Se houver identificador e já houver algum modal com este mesmo,
    // foca no modal e ignora o resto do código
    if(opts.identifier && $('.o-modal[data-identifier="' + opts.identifier + '"]').length){

        return Alerts.focus($('.o-modal[data-identifier="' + opts.identifier + '"]'));

    }

    if($('body .alertsjs-modalarea').length == 0) Alerts.setup();

    var modal = $('<div class="alerts-js o-modal"></div>');

    // Adiciona o identificador ao modal
    if(opts.identifier){
        modal.attr('data-identifier', opts.identifier);
    }

    modal.append($('.modals .modal' + cls).clone());

    if(opts.data){

        Object.keys(opts.data).forEach(function(key){

            modal.find('[data-value=' + key + ']').text(opts.data[key]);

        });

    }

    // Caso algum comando fora declarado
    if(opts.command){

        // Passa por todos os comandos
        Object.keys(opts.command).forEach(function(key){

            // Quando houver um de mesmo nome, quando ele for clicado
            modal.find('[data-command=' + key + ']').on('click', function(){

                // É adicionada a função de mesmo nome
                opts.command[key](modal);

            });

        });

    }

    modal.hide();

    if($('.alerts-js ' + cls).length && opts.unique){

        $('.alerts-js ' + cls).parent().remove();

    }

    var appendedModal = $('body .alertsjs-modalarea').append(modal);

    // Apenas ativa o draggable caso esteja definido
    if(modal.draggable) modal.draggable();

    modal.on('mousedown', function(){

        Alerts.focus(modal);

    });

    var actionArea = $('<div class="action-area"></div>');

    var minBtn   = $("<div class='min'>_</div>");
    var closeBtn = $("<div class='modal-close close'>x</div>");

    minBtn.on('click', function(){

        Alerts.minimize(modal);

    });

    actionArea.append(minBtn);
    actionArea.append(closeBtn);

    modal.append(actionArea);

    modal.find('.modal-close').on('click', function(){

        Alerts.close(modal);

        if(opts.onclose){

            opts.onclose();

        }

    });

    Alerts.centralize(modal);

    // Se estiver ativo, não exibe o modal no mesmo instante
    if(!opts.showAwait){
        modal.show();
    }

    if(opts.ready) opts.ready(modal);

    Alerts.focus(modal);

    Alerts.updateTabs();

}

Alerts.minimize = function(modal){

    modal.addClass('modal-minimized');
    Alerts.updateTabs();

    Alerts.blur(modal);

}

Alerts.maximize = function(modal){

    modal.removeClass('modal-minimized');
    Alerts.updateTabs();

    Alerts.focus(modal);

}

Alerts.close = function(modal){

    // Simplesmente remove o modal
    modal.remove();

    // Remove a guia responsável por esse modal
    Alerts.updateTabs();

    // Foca no ultimo modal que não esteja minimizado
    Alerts.focus($('.o-modal:not(.modal-minimized)').last());

}

Alerts.getData = function(btn){

    var data = {};

    $(btn).find('[name]').each(function(){

        data[$(this).attr('name')] = $(this).val();

    });

    return data;

}

Alerts.notify = function(txt, vida, isErr){

    // txt = document.querySelectorAll('.notifica').length

    if(txt==='') return;
    if('undefined' == typeof isErr) isErr = false;

    if(!vida) vida = 4000

    var older_notifica = document.querySelectorAll('.notifica');
    var total_bottom = 30;

    Object.keys(older_notifica).forEach(function(i){
        total_bottom += older_notifica[i].offsetHeight;
        total_bottom += 10;     
    });

    var Box = $('<div>');

    $('body').append(Box);

    Box.addClass('notifica ldesatived' + (isErr?' isErr ':''));

    Box.html(txt);

    Box.css('bottom', total_bottom);


    setTimeout(function(){
        Box.removeClass('ldesatived')
        navigator.vibrate(400)

    },10)

    setTimeout(function(){

        if(Box.hasClass('avoid-death')){
            setTimeout(function(){

            Box.addClass('ldesatived')

            setTimeout(function(){

                var olders = document.querySelectorAll('.notifica:not(.ldesatived)');

                Object.keys(olders).forEach(function(i){
                    var atual_bottom = olders[i].style.bottom.substr(0, olders[i].style.bottom.length-2);

                    olders[i].style.bottom = atual_bottom-Box.offsetHeight + 'px';
                    olders[i].addClass('avoid-death');
                })
                Box.parentElement.removeChild(Box)

            }, 300)

            }, vida)
            return;
        }

        Box.addClass('ldesatived')

        setTimeout(function(){

            // var olders = $('.notifica:not(.ldesatived)');

            // olders.each(function(k){

            //  var actual_bottom = olders[k].css('bottom');

            //  console.log(actual_bottom);

            // });

            var olders = document.querySelectorAll('.notifica:not(.ldesatived)');

            Object.keys(olders).forEach(function(i){

                var atual_bottom = olders[i].style.bottom.replace('px', '');

                olders[i].style.bottom = atual_bottom-Box.offsetHeight + 'px';
                olders[i].className = olders[i].className.replace('avoid-death', '');
                //addClass('avoid-death');
            });

            Box.remove();

        }, 300)

    }, vida)

    return Box;

}


// function Alerts(structure, obj){

//     if(typeof structure == 'undefined') return console.error("Alerts: Need a structure.");
//     if(typeof obj       == 'undefined') obj = {Fechar: alerts._close}

//         // return console.error("Alerts: Need a obj");

//     if(typeof structure == 'string'){
//         var body = structure;

//         structure = {title: '', body: body}

//     }

//     if(typeof structure.title == 'undefined') structure.title = '';
//     if(typeof structure.body  == 'undefined') structure.body  = '';
//     if(typeof structure.ready  == 'undefined') structure.ready  = function(){};
//     if(typeof structure.force  == 'undefined') structure.force  = false;

//     if(Object.keys(obj).length==0) return console.error("Alerts: Obj must have keys.");

//     alerts.custom(structure.title, structure.body, Object.keys(obj), Object.values(obj), structure.ready);

// }

// window.addEventListener('load', function(){

//     Alerts.notify = alerts.notificaBox;

//     Alerts.closeForm = function(form){

//         form = form.replace(/\s/g, '_');

//         alerts._close($('.outerBox .' + form + '_form').parent());

//     }

//     Alerts.offLast = alerts.off_last;

//     Alerts.close = alerts._close;

//     Alerts.asker = function(ask, obj){
//         Alerts({
//             title: ask
//         }, obj);
//     }

// });

alerts = {

    _close: function(_caller){
        
        if(typeof _caller == 'undefined') return;

        if(typeof _caller === 'string'){
            _caller = $(_caller).parent().parent().find('.yes')[0];
        }

        $(_caller).parent().parent().parent().removeClass('not-easy-to-close');

        alerts.destroyBox(_caller);
        // Webcan.stopAllStreams()
    },

    is_on:function(){
        return 0!=$(".outerBox").length;
    },

    createBox:function(inn){

        var outerBox   = $('<div>');
        var InBox      = $('<div>');
        var boxContent = $('<div>');

        outerBox.addClass('outerBox ldesatived');
        InBox.addClass('inBox');

        InBox.on('click', function(event){
            
            if(event.target==this) alerts.off_last();

        });

        boxContent.addClass('boxContent');

        boxContent.append(inn);

        $('body').append(outerBox);

        outerBox.append(InBox);
        InBox.append(boxContent);

        setTimeout(function(){
            outerBox.removeClass('ldesatived');
        },10);

        if(outerBox.find('input').length>0) outerBox.find('input:not([type="checkbox"])').reverse().focus();

        outerBox.find('form').on('submit', function(event){

            event.preventDefault();

            $(this).parent().parent().find('.yes').click();

            return false;

        });

        return outerBox;

    },

    destroyBox:function(obj){

        if('undefined' == typeof obj) return console.log('obj indefinido');

        obj = $(obj);

        var outer = obj;

        if(!obj.hasClass('outerBox')) outer = obj.parent().parent().parent();

        if(!outer) return

        if(outer.hasClass('description')) outer = outer.parent().parent().parent()

        if(outer.hasClass('outerBox')){
            outer.addClass('ldesatived')
            setTimeout(function(){
                outer.remove();
            }, 1);
        }

    },

    destroyLast: function(){

        alerts.off_last();

    },

    get_last: function(){

        var outers = $('.outerBox:not(.ldesatived)');

        if(outers.length==0) return;

        return outers[outers.length-1];

    },

    off_last:function(){

        var last = alerts.get_last();

        if(typeof last == 'undefined') return;

        if(!$(last).hasClass('not-easy-to-close')) alerts.destroyBox(last);

    },

    enter_last_yes:function(){

        var last = alerts.get_last();

        if(typeof last == 'undefined') return;

        var yes = last.$('.yes.callback_reciver');

        if(typeof yes != 'undefined'){
            if(typeof yes.click != 'undefined') yes.click();
        }

    },

    // TODO: Impossibilitar o usuário de clicar rapidamente no botão. Após clicar, desabilitar
    // TODO:Se a rotação estiver ativa, a outerbox irá fechar para a direção do sim ou não
    yesno:function(title, desc, callback, _firstaction){

        if(typeof(desc)         == 'undefined') desc         = '';
        if(typeof(_firstaction) == 'undefined') _firstaction = function(){};

        var txt = "<span class='title'>" + title + "</span>"
        txt += "<span class='description'>" + desc + "</span>"
        txt += "<span class='yes callback_reciver' onclick='alerts.destroyBox(this)'>Sim</span><span class='no' onclick='alerts.destroyBox(this)'>Não</span>"

        var outerBox = this.createBox(txt);

        if(callback!=null){
            $('span.callback_reciver').addEventListener('click',function(){
                callback(outerBox);
            },true)
        }

        _firstaction(outerBox);
    },

    yn: function(title, desc, callback, _firstaction){
        this.custom(title, desc, ['Sim', 'Não'], [callback, alerts._close], _firstaction);
    },

    bool: function(title, desc, callback, _firstaction){
        this.yesno(title, desc, callback, _firstaction);
    },

    imp:function(title, placeholder, inp){
        var txt = "<span class='title'>" + title + "</span>"
        txt += "<span class='description'><input class='pass' type='text' placeholder='" + placeholder + "'/></span>"
        txt += "<span class='yes' onclick='alerts.destroyBox(this)'>Ok</span><span class='no' onclick='alerts.destroyBox(this)'>Cancelar</span>"

        this.createBox(txt)
    },

    ok: function(title, desc, _firstaction){

        if(typeof(desc)=='undefined') desc = '';
        if(typeof(_firstaction)=='undefined') _firstaction = function(){};

        var txt = "<span class='title'>" + title + "</span>"
        txt += "<span class='description'>" + desc + "</span>"
        txt += "<span class='yes' onclick='alerts.destroyBox(this)'>Fechar</span>"

        _firstaction(this.createBox(txt));
    },

    countdown: function(title, seconds, _firstaction){

        if(typeof(desc)=='undefined') desc = '';
        if(typeof(_firstaction)=='undefined') _firstaction = function(){};

        var txt = "<span class='title'>" + title + "</span>"
        txt += "<span class='description'>" + desc + "</span>"
        txt += "<span class='yes' onclick='alerts.destroyBox(this)'>Fechar</span>"

        _firstaction(this.createBox(txt));
    },

    box: function(opts){
        if(typeof(opts)             == 'undefined') opts = {}
        if(typeof(opts.onload)      == 'undefined') opts.onload = function(){};
        if(typeof(opts.title)       == 'undefnied') opts.title = '';
        if(typeof(opts.description) == 'undefined') opts.description = '';

        if(typeof(opts.buttons)     == 'undefined') opts.buttons = 'Fechar';
        if(typeof(opts.buttons)     == "string")    opts.buttons = [opts.buttons];

        if(typeof(opts.callbacks)   == 'undefined') opts.callbacks = function(_caller){alerts.destroyBox(_caller);};
        if(typeof(opts.callbacks)   == "function")  opts.callbacks = [opts.callbacks];
        
        if(typeof(opts.callback)    == 'undefined') opts.callback = [];

        var older_callbacks_count = _callback.length

        callback_buttons.forEach(function(k,i){

            _callback = _callback.concat(function(_this_obj){

                callback_buttons[i](_this_obj)

            })

        });

        var txt = "<span class='title'>" + opts.title + "</span>"
        txt += "<span class='description'>" + opts.desc + "</span>"

        buttons.forEach(function(_button,i){

            var older_i = i+older_callbacks_count

            if(typeof _callback[older_i]=='undefined') _callback[older_i] = function(){ }

            txt += "<span class='yes' onclick='_callback[" + older_i + "](this);'>" + _button + "</span>"

        });

        opts.onload(this.createBox(txt));
    },

    custom:function(title, desc, buttons, callback_buttons, _firstaction){

        if(typeof(_firstaction)=='undefined') _firstaction = function(){};

        if(typeof(desc)=='undefined') desc = '';

        if(typeof buttons == "string") buttons = [buttons]

        if(typeof callback_buttons == "function") callback_buttons = [callback_buttons]

        if(typeof _callback == "undefined") _callback = []

        var older_callbacks_count = _callback.length

        callback_buttons.forEach(function(k,i){

            // log(k)

            _callback = _callback.concat(function(_this_obj){

                // log(callback_buttons)

                callback_buttons[i](_this_obj)

            })

        })

        var txt = "<span class='title'>" + title + "</span>"
        txt += "<span class='description'>" + desc + "</span>"

        buttons.forEach(function(_button,i){

            var older_i = i+older_callbacks_count

            if(typeof _callback[older_i]=='undefined') _callback[older_i] = function(){ }

            txt += "<span class='yes' onclick='_callback[" + older_i + "](this);'>" + _button + "</span>"

        })

        _firstaction(this.createBox(txt));

    },


}