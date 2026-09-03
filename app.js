require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require("nodemailer");
const ejsMate = require('ejs-mate');
const session = require('express-session');
const User = require('./models/userschema');
const Job = require('./models/jobSchema');
const cron = require('node-cron');
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge: 24*60*60*1000,
        httpOnly: true,
    }
}));
const postRoutes = require('./routes/post-routes');
app.use('/ulep', postRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('DATABASE CONNECTED: database section correctly working'))
.catch(err => console.error('database connection error:', err));

cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date();
        const jobsToDelete = await Job.find({ 
            deleteAt: { $lte: now, $ne: null } 
        });
        for (let job of jobsToDelete) {
            const filesToDelete = [];   
            if (job.ss) filesToDelete.push(job.ss);
            if (job.qr) filesToDelete.push(job.qr);
            if (job.upload && job.upload.length > 0) filesToDelete.push(...job.upload);
            if (job.completeWork && job.completeWork.length > 0) filesToDelete.push(...job.completeWork);
            filesToDelete.forEach(filename => {
                const filePath = path.join(__dirname, 'public/uploads', filename); 
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); 
                }
            });
            await Job.findByIdAndDelete(job._id);
            console.log(`Job ${job._id} aur uski files delete ho gayi hain.`);
        }
    } catch (error) {
        console.error("Background task (Cron) error:", error);
    }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const isAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();}
    return res.redirect('/');
};

const isGuest = (req,res,next) => {
    if (req.session && req.session.userId){
        return res.redirect('/ulep');}
    next();
};

app.get('/',isGuest,(req,res)=>{
    res.render('root.ejs');
});
app.get('/ulep', isAuth, (req,res)=>{
    const username = req.session.username;
    res.render('home.ejs',{username, activeTab:"home"});
});
app.get('/ulep/register',(req,res)=>{
    res.render('register.ejs');
});
app.get('/ulep/login',isGuest, (req,res)=>{
    res.render('login.ejs');
});
app.get('/ulep/forget-password',(req,res)=>{
    res.render('forget-password.ejs');
});
app.get('/ulep/reset-password/:username',(req,res)=>{
    const username = req.params.username;
    res.render('reset-password.ejs',{username}); 
});
app.get('/ulep/take-task/:username',isAuth,async(req,res)=>{
    try{
        const username = req.params.username;
        const user = await User.findOne({username});
        const jobs = await Job.find({postedBy:{$ne: user._id}})
        .populate('postedBy', 'username')
        .populate('assignee','username')
        .populate('messages.sender messages.to','username');
        res.render('take-task.ejs',{username,activeTab:"takeTask",user,jobs});
    }catch (err){
        console.error(err);
        res.status(400).send("Page loading error!");
    }
});
app.get('/ulep/my-post/:username',isAuth, async(req,res)=>{
    try{
        const username = req.session.username;
        const user = await User.findOne({username});
        const jobs = await Job.find({postedBy: user._id})
        .populate('postedBy', 'username')
        .populate('assignee','username');
        res.render('my-post.ejs',{username,activeTab:"myPost",jobs});
    }catch (err){
        console.error(err);
        res.status(400).send("Page loading error!");
    }
});
app.get('/ulep/my-work/:username',isAuth, async(req,res)=>{
    try{
        const username = req.params.username;
        const user = await User.findOne({username});
        const jobs = await Job.find({assignee: user._id})
        .populate('postedBy assignee','username')
        .populate('messages.sender messages.to', 'username');
        res.render('my-work.ejs',{username,activeTab:"myWork",user,jobs});
    }catch (err){
        console.error(err);
        res.status(400).send("Page loading error!");
    }
});
app.get('/ulep/post-job/:username',isAuth, async (req,res)=>{
    try{
        const username = req.session.username;
        const jobs = await Job.find({username: username});
        res.render('post-job.ejs',{username, jobs, activeTab:"postJob"});
    }catch (err){
        console.error(err);
        res.status(400).send("Page loading error!");
    }
});
app.get('/ulep/profile/:username',isAuth, async(req,res)=>{
    try{
        const username = req.params.username;
        const usernameBySession = req.session.username;
        const user = await User.findOne({username});
        res.render('profile.ejs',{username,activeTab:"profile",usernameBySession,user});
    }catch (err){
        console.error(err);
        res.status(400).send("Page loading error!");
    }
});
app.get('/ulep/edit-profile/:username',isAuth,async(req,res)=>{
    try{
        const username = req.params.username;
        const user = await User.findOne({username});
        res.render('edit-profile.ejs',{username,activeTab: "profile",user});
    }catch (err){
        console.error(err);
        res.status(400).send("Page loading error!");
    }
});
app.get('/ulep/show/:username/:id',isAuth,async(req,res)=>{
    try{
        const {username: usernameByQuery, id} = req.params;
        const usernameBySession = req.session.username;
        const job = await Job.findById(id)
        .populate('postedBy', 'username')
        .populate('assignee', 'username')
        .populate('messages.sender messages.to', 'username');
        const firstchats = [];
        const seenSenders = [];
        for (let message of job.messages){
            const sender = message.sender.username;
            if (sender !== usernameByQuery && !seenSenders.includes(sender)) {
                firstchats.push(message);
                seenSenders.push(sender);
            }
        }
        res.render('show.ejs',{usernameByQuery, usernameBySession, activeTab: "",job,firstchats});
    }catch (err){
        console.error(err);
        res.status(400).send("Page loading error!");
    }
});  


const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>{
    console.log(`app is listening on port ${PORT}`);
});