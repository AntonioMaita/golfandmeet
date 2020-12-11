//Imports

const express = require('express');
const usersCtrlRoute = require('./routes/usersCtrlRoute');
const messagesCtrlRoute = require('./routes/messagesCtrlRoute');
const likesCtrlRoute = require('./routes/likesCtrlRoute');

//Router
exports.router = (function() {
    const apiRouter = express.Router();

    //Users routes
    apiRouter.route('/users/register/').post(usersCtrlRoute.register);
    apiRouter.route('/users/login/').post(usersCtrlRoute.login);


    apiRouter.route('/users/profile/').get(usersCtrlRoute.getUserProfile);
    apiRouter.route('/users/profile/').put(usersCtrlRoute.updateUserProfile);
    apiRouter.route('/users/profile/').delete(usersCtrlRoute.deleteUserProfile);

    // apiRouter.route('/users/follow/:id').put(usersCtrlRoute.follow);


    //Messages routes
    apiRouter.route('/messages/new/').post(messagesCtrlRoute.createMessage);
    apiRouter.route('/messages/').get(messagesCtrlRoute.listMessages);

    //Likes
    apiRouter.route('/messages/:messageId/vote/like').post(likesCtrlRoute.likePost);
    apiRouter.route('/messages/:messageId/vote/dislike').post(likesCtrlRoute.dislikePost);

    return apiRouter;

})();