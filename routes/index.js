var express = require('express');
var router = express.Router();
const knex = require('../db/knex');

/* GET home page. */
router.get('/', async function(req, res, next) {

    const ccList = await knex.select().table('public.client');
    console.log(ccList);
    res.render('index', { 
        title: 'Express',
        client: ccList[0]
    });
});


router.get('/gg', async (req, res, next) => {
    try{
        
        const ccList = await knex.raw("select * from public.client");
        res.send(JSON.stringify( ccList.rows ));
    } catch (error) {
        next(error)
    }
});




module.exports = router;
