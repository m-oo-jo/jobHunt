const express=require('express');
const app=express();
app.use(express.static("public"));

app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');

app.get('/',(req,res)=>{
   res.render('index', {
  jobTitle: "Software Engineer",
  company: "TechNova Solutions",
    location: "Remote",
    description: "We are looking for a motivated software engineer to join our development team."

});
})

app.get('/apply',(req,res)=>{
    res.render('apply');
})
app.post('/apply',(req,res)=>{
    
    const name=req.body.fullName;
    res.render('success',{
        name:name
    });
})

app.listen(5000,()=>{
    console.log('server is running on port 5000');
})

