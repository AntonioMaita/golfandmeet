//Imports

const express = require('express');
const usersCtrlRoute = require('./routes/usersCtrlRoute');
const messagesCtrlRoute = require('./routes/messagesCtrlRoute');

//Router
exports.router = (function() {
    const apiRouter = express.Router();

    //Users routes
    apiRouter.route('/users/register/').post(usersCtrlRoute.register);
    apiRouter.route('/users/login/').post(usersCtrlRoute.login);
    apiRouter.route('/users/profile/').get(usersCtrlRoute.getUserProfile);
    apiRouter.route('/users/profile/').put(usersCtrlRoute.updateUserProfile);

    //Messages routes
    apiRouter.route('/messages/new/').post(messagesCtrlRoute.createMessage);
    apiRouter.route('/messages/').get(messagesCtrlRoute.listMessages);

    return apiRouter;

})();