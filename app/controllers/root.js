module.exports = (router) => {

    router.get('/*', (req, res) => {

        res.render('home', {
        	require: require
        });

    });

    return router;

}