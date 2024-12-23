import express from 'express';


const app = express();

app.listen(3001, ()=>{
    console.log('Server is running')
})

app.get('/User', async function(req,res){
    res.send('Getting all the user data')
})