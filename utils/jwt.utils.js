const jwt = require('jsonwebtoken');


const JWT_SIGN_SECRET = '2b10ciQYoYTXdOo8RQWBSMOQZggxXV12hOzpuLQvf8YPG4ufyKMwmy2b10ZhnUrEQHegCyvSKuKpwCIeLi/LLO5HYsg217uH88DxqcRjXbHhPmS';
//exported functions

module.exports = {
    generateTokenForUser: function(userData){
        return jwt.sign({
            userId: userData.id,
            isAdmin:userData.isAdmin
        },
        JWT_SIGN_SECRET,
        {
            expiresIn: '1h'
        })
    },

    parseAuthorization: function(authorization) {
        return (authorization != null) ? authorization.replace('Bearer ', '') : null;
      },
      getUserId: function(authorization) {
        var userId = -1;
        var token = module.exports.parseAuthorization(authorization);
        if(token != null) {
          try {
            var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
            if(jwtToken != null)
              userId = jwtToken.userId;
          } catch(err) { }
        }
        return userId;
    }
}