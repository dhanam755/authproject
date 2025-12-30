const jwt = require('jsonwebtoken');
const JWT_SECRET=process.env.JWT_SECRET||'mysecretkey';
const authMiddleware =(req,res,next)=>{
    if (!req.headers || !req.headers.authorization) {
        return res.status(401).json({ message: 'Authorization header missing'});}
    const header =req.headers.authorization;
    if(!header||!header.startsWith('Bearer')){
        return res.status(401).json({ message:'No TOKEN HERE!,ACCESS DENIED' })
    }
const token =header.split(' ')[1];
try{
    const decode =jwt.verify(token,JWT_SECRET);
    req.user={ _id: decode.id};
    next();}
    catch{
        res.status(401).json({message:'Token Invalid'});
    }
};
module.exports = authMiddleware;