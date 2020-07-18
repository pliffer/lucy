var Keeper = {

    // Stores the main database
    db: null,
    socket: null,

    dbName: 'lucy',

    load: function(){

        Keeper.syncables = [];

        Keeper.db = new Dexie(Keeper.dbName);

        Keeper.db.version(1).stores({
            commands: 'id, trigger, command',
        });

        Keeper.db.version(2).stores({
            commands: null
        });

        Keeper.db.version(3).stores({
            commands: 'trigger, command'
        });

        Keeper.db.open().then(function(){

            if(Keeper.syncables.length) Keeper.initialSync();

        });

    },

    syncables: [],

    __listeners: {},

    addListener: function(table, f){

        if(!Keeper.__listeners[table]) Keeper.__listeners[table] = [];

        Keeper.__listeners[table].push(f);

    },

    triggerUpdate: function(table){

        if(!Keeper.__listeners[table]) Keeper.__listeners[table] = [];

        Keeper.__listeners[table].forEach(function(f){

            f();

        });

    },

    // Aguarda para que o banco de dados esteja carregado
    waitOpen: function(){

        // Espera a definição da variavel Keeper.db
        return Helpers.whenVar('db', Keeper);

    }

}

$(Keeper.load);
