module.exports = {

    unhandledRejection: (reason, p) => {

        console.log('\n/* ------------------- Pliffer Keeper ------------------- */'.red);
        console.log('                     unhandledRejection                     '.bgRed);
        console.log('');
        console.log('Unhandled Rejection at: ', p);
        console.log("\n");
        console.log('Reason:', reason);
        console.log('\n/* ------------------- Pliffer Keeper ------------------- */\n'.red);

    },

    uncaughtException: (reason, p) => {

        console.log('\n/* ------------------- Pliffer Keeper ------------------- */'.red);
        console.log('                     unhandledRejection                     '.bgRed);
        console.log('');
        console.log('Unhandled Rejection at: ', p);
        console.log("\n");
        console.log('Reason:', reason);
        console.log('\n/* ------------------- Pliffer Keeper ------------------- */\n'.red);

    },

    rejectionHandled: (reason, p) => {

        console.log('\n/* ------------------- Pliffer Keeper ------------------- */'.red);
        console.log('                     unhandledRejection                     '.bgRed);
        console.log('');
        console.log('Unhandled Rejection at: ', p);
        console.log("\n");
        console.log('Reason:', reason);
        console.log('\n/* ------------------- Pliffer Keeper ------------------- */\n'.red);

    }

}