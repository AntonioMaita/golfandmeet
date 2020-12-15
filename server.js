//imports
const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const apiRouter = require('./apiRouter').router;
const logout = require('passport');

//Instantiate server
const server = express();

//Body Parser Config
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());



//Configure routes


 
    server.get('/', function (req, res) {
        res.setHeader('Content-Type','text/html');
        res.status(200).send('<h1>Bonjour de mon serveur</h1>');
    });

    

    server.use('/api/', apiRouter);

    // server.get('/users/logout',(req,res)=>{
    //     req.logout();
    //     res.redirect('/');
    //    })


//Launch Server
server.listen(process.env.PORT, function() {
    console.log(`Server listen on port ${process.env.PORT} !`);
})
  

  

