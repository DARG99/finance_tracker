const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) =>{
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        req.user = {id: decoded.id};
        next();
        
    } catch (error) {
        res.status(401).json({error: 'Please authenticate'});
        
    }
}

module.exports = auth