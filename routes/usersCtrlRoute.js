const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/jwt.utils');
const models = require('../models');
const asyncLib = require('async');
require('passport');

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;

//Routes
module.exports = {
    register: function(req, res) {

        //Params
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const bio = req.body.bio;
        const club = req.body.club;
        const followers = req.body.followers;
        const following = req.body.following;

        if(email == null || username == null || password == null) {
            return res.status(400).json({'error': 'missing parameters'});
        }
        if(username.length >= 26 || username.length <= 4){
            return res.status(400).json({'error': 'wrong username (must be length 5-25)'});
        }

        if(!EMAIL_REGEX.test(email)){
            return res.status(400).json({'error': 'email is not valid'});

        }

        if(!PASSWORD_REGEX.test(password)){
            return res.status(400).json({'error': 'password invalid (must length 4-8 and include 1 number)'});

        }
        asyncLib.waterfall([
            function(done) {
              models.User.findOne({
                attributes: ['email'],
                where: { email: email }
              })
              .then(function(userFound) {
                done(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
              });
            },
            function(userFound, done) {
              if (!userFound) {
                bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
                  done(null, userFound, bcryptedPassword);
                });
              } else {
                return res.status(409).json({ 'error': 'user already exist' });
              }
            },
            function(userFound, bcryptedPassword, done) {
               models.User.create({
                email: email,
                username: username,
                password: bcryptedPassword,
                bio: bio,
                club: club,
                isAdmin: 0,
                followers: followers,
                following: following
              })
              .then(function(newUser) {
                done(newUser);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'cannot add user' });
              });
            }
          ], function(newUser) {
            if (newUser) {
              return res.status(201).json({
                'userId': newUser.id
              });
            } else {
              return res.status(500).json({ 'error': 'cannot add user' });
            }
          });
        },
        login: function(req, res) {
          
          // Params
          const email    = req.body.email;
          const password = req.body.password;
      
          if (email == null ||  password == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
          }
      
          asyncLib.waterfall([
            function(done) {
              models.User.findOne({
                where: { email: email }
              })
              .then(function(userFound) {
                done(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
              });
            },
            function(userFound, done) {
              if (userFound) {
                bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
                  done(null, userFound, resBycrypt);
                });
              } else {
                return res.status(404).json({ 'error': 'user not exist in DB' });
              }
            },
            function(userFound, resBycrypt, done) {
              if(resBycrypt) {
                done(userFound);
              } else {
                return res.status(403).json({ 'error': 'invalid password' });
              }
            }
          ], function(userFound) {
            if (userFound) {
              return res.status(201).json({
                'userId': userFound.id,
                'token': jwtUtils.generateTokenForUser(userFound)
              });
            } else {
              return res.status(500).json({ 'error': 'cannot log on user' });
            }
          });
        },
               
        // logout : function (req,res){
        //   // Params
        //   let headerAuth = req.headers['authorization'];
        //   const userId = jwtUtils.getUserId(headerAuth);
        //   let token = jwtUtils.generateTokenForUser(headerAuth);
          

        //   console.log(headerAuth, token, userId);
        //   var delete_cookie = function(name) {headerAuth = name +'=;expiresIn=Thu, 01 Jan 1970 00:00:01 GMT;'; };
        //   delete_cookie();
        //   // asyncLib.waterfall([
        //   //   function(done) {
        //   //     models.User.findOne({
        //   //       where: { id: userId }
        //   //     })
        //   //     .then(function(userFound) {
        //   //       done(null, userFound);
        //   //     })
        //   //     .catch(function(err) {
        //   //       return res.status(500).json({ 'error': 'unable to verify user' });
        //   //     });
        //   //   },
            
            
        //   // ], function(userFound) {
        //   //   if (userFound ==! userId) {
        //   //     return res.status(201).json({
        //   //       'userId': userFound.id,
        //   //       'token': jwtUtils.changeGenerateTokenForUser(userFound)
        //   //     });
        //   //   } else {
        //   //     return res.status(500).json({ 'error': 'cannot logout user' });
        //   //   }
        //   // });
          
        // },        
       
        getUserProfile: function(req, res) {
          // Getting auth header
          const headerAuth  = req.headers['authorization'];
          const userId      = jwtUtils.getUserId(headerAuth);
          const token = jwtUtils.parseAuthorization(headerAuth);
          console.log(token);
         
      
          if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });
      
          models.User.findOne({
            attributes: [ 'id', 'email', 'username', 'bio', 'club'],
            where: { id: userId }
          }).then(function(user) {
            if (user) {
              res.status(201).json(user);
            } else {
              res.status(404).json({ 'error': 'user not found' });
            }
          }).catch(function(err) {
            res.status(500).json({ 'error': 'cannot fetch user' });
          });
        },
        updateUserProfile: function(req, res) {
          // Getting auth header
          const headerAuth  = req.headers['authorization'];
          const userId      = jwtUtils.getUserId(headerAuth);
      
          // Params
          const bio = req.body.bio;
          const club = req.body.club;

      
          asyncLib.waterfall([
            function(done) {
              models.User.findOne({
                attributes: ['id', 'bio', 'club'],
                where: { id: userId }
              }).then(function (userFound) {
                done(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
              });
            },
            function(userFound, done) {
              if(userFound) {
                userFound.update({
                  bio: (bio ? bio : userFound.bio),
                  club: (club ? club : userFound.club)
                }).then(function() {
                  done(userFound);
                }).catch(function(err) {
                  res.status(500).json({ 'error': 'cannot update user' });
                });
              } else {
                res.status(404).json({ 'error': 'user not found' });
              }
            },
          ], function(userFound) {
            if (userFound) {
              return res.status(201).json(userFound);
            } else {
              return res.status(500).json({ 'error': 'cannot fetch user profile' });
            }
          });
        },

        deleteUserProfile: function(req, res) {
          // Getting auth header
          const headerAuth  = req.headers['authorization'];
          const userId      = jwtUtils.getUserId(headerAuth);
      
          // Params
          const id = req.body.id;
         
      
          asyncLib.waterfall([
            function(done) {
              models.User.findOne({
                attributes: ['id'],
                where: { id: userId }
              }).then(function (userFound) {
                done(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
              });
            },
            function(userFound, done) {
              if(userFound) {
                userFound.destroy({
                  id: (id ? id : userFound.id)
                 
                }).then(function() {
                  done(userFound);
                }).catch(function(err) {
                  res.status(500).json({ 'error': 'cannot delete user' });
                });
              } else {
                res.status(404).json({ 'error': 'user not found' });
              }
            },
          ], function(userFound) {
            if (userFound) {
              return res.status(201).json(userFound);
            } else {
              return res.status(500).json({ 'error': 'cannot fetch user profile' });
            }
          });
        },

        // follow: function(req, res) {
        //   // Getting auth header
        //   const headerAuth  = req.headers['authorization'];
        //   const userId      = jwtUtils.getUserId(headerAuth);
      
        //   // Params
        //   const id = req.body.id;
        //   const following = req.params.id;
         
      
        //   asyncLib.waterfall([
        //     function(done) {
        //       models.User.findOne({
        //         attributes: ['id'],
        //         where: { id: userId,
        //                    }
        //       }).then(function (userFound) {
        //         done(null, userFound);
        //       })
        //       .catch(function(err) {
        //         return res.status(500).json({ 'error': 'unable to verify user' });
        //       });
        //     },
        //     function(userFound, done) {
        //       if(userFound) {
        //         userFound.update({
        //           following: (following ? following : userFound.following )
                  
        //         }).then(function() {
        //           done(userFound);
        //         }).catch(function(err) {
        //           res.status(500).json({ 'error': 'cannot follow user' });
        //         });
        //       } else {
        //         res.status(404).json({ 'error': 'user not found' });
        //       }
        //     },
        //   ], function(userFound) {
        //     if (userFound) {
        //       return res.status(201).json(userFound);
        //     } else {
        //       return res.status(500).json({ 'error': 'cannot fetch user profile' });
        //     }
        //   });
        // },
              
}