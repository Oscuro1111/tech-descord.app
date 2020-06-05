module.exports=function(express){
    const {Router}=express;
    
    return Router().get('/home',(req,res,next)=>{

        try {
            res.send("Welcome to home!");
        } catch (error) {
            throw error;
        }
    });
}