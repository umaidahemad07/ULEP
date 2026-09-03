const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/userSchema');
const Job = require('../models/jobSchema');
const session = require('express-session');
const { asyncWrapProviders } = require('async_hooks');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: 'umaidahemad07@gmail.com',
    pass: 'cefsipubbtfocyfc', // Aapka Google App password
  },
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });


router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const otp = crypto.randomInt(100000, 999999).toString();

        const tokenData = {email, otp};
        const otpToken = jwt.sign(tokenData, 'ulep_secret_key_super_secure_123', { expiresIn: '5m' });

        const info = await transporter.sendMail({
            from: '"U-LEP Hub" <umaidahemad07@gmail.com>',
            to: email, 
            subject: "One Time OTP", 
            text: `Your One Time password is ${otp}`,
            html: `<h3>Your OTP is: <b>${otp}</b></h3>`
        });
        console.log("Message successfully sent: %s", info.messageId);
        return res.status(200).json({ message: "OTP sent successfully!", token: otpToken });
    } catch (err) {
        console.error("====== ASLI BACKEND ERROR ======", err);
        return res.status(500).json({ error: err.message });
    }
});

router.post('/varify-otp', async (req,res) => {
    try{
        const {email, otp, token} = req.body;

        if (!email || !otp || !token) {
            return res.status(400).json({ error: "Missing data (email, otp, or token)" });
        };

        let decoded;
        try{
            decoded = jwt.verify(token, 'ulep_secret_key_super_secure_123');
        }catch(jwtErr){
            res.status(400).json({error:"otp is expired."});
        }

        if (decoded.email === email && decoded.otp === otp){

            return res.status(200).json({success: "OTP varification successful"});
        }else {
            return res.status(400).json({ error: "Please Enter Correct OTP!" });
        }

    }catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/check-username', async (req,res) => {
    try{
        let {username} = req.body;
        username = username.toLowerCase().trim();
        const usernameExist = await User.findOne({username:username});
        if(usernameExist){
            return res.status(200).json({
                available:false,
                message: "Username is already taken!",
            });
        }else{
            return res.status(200).json({
                available:true,
                message: "Username is available!",
            });
        }
    }catch (err){
        console.error("Username check error:", err);
        return res.status(500).json({ error: err.message });
    }
});

router.post('/register', async (req,res) => {
    try{
        const {name, gender, username, email, collegeName, branch, currentYear, password} = req.body;
        const existingUser = await User.findOne({email});
        if (existingUser){
            res.status(400).json({
                success: false,
                message: "email already Exist"
            });
        }
        const newUser = new User({name, gender, username, email, collegeName, branch, currentYear, password});
        await newUser.save();
        res.redirect('/ulep/login');
    }catch (err){
        console.error("Database error:", err);
        res.status(500).json({ success: false, message: "Server error, registration failed" });
    }
});

router.post('/login', async (req,res) => {
    const {identifier, password} = req.body;
    try{
        const user = await User.findOne({$or: [{ username: identifier }, { email: identifier }]});
        if (!user || user.password !== password) {
        return res.status(400).json({
            success: false,
            message: !user ? "User not found" : "Incorrect Password"
        });
        }
        req.session.userId = user._id;
        req.session.username = user.username;
        return res.redirect('/ulep');
    }catch (err){
        console.error("Login Error:", err); // Server terminal me exact error dikhayega
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
});

router.post('/forget-password', async (req,res)=>{
    const {email} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user)return res.status(400).send("Email not found");
        const username = user.username;
        res.redirect(`/ulep/reset-password/${username}`);
    }catch (err){
        console.log("Internal Server error in forgetting password");
        return err;
    }
});

router.post('/reset-password/:username', async (req,res)=> {
    const username = req.params.username;
    const {password} = req.body;
    try{
        const user = await User.findOne({username});
        if (!user) return res.status({message:"You are not Registered! Create your U-LEP account"});
        await User.findOneAndUpdate({username},{password});
        res.json({success:true});
    }catch (err){
        return res.status(200).json({success:false,message: "failed to update data"});
    }
});

router.post('/post-job/:username',upload.array('upload'), async (req,res)=>{
    try{
        const username = req.params.username;
        const user = await User.findOne({username});
        const {title, deadline, shortdescription, briefdescription, amount, type} = req.body;

        const uploadedFiles = req.files ? req.files.map(file => file.filename) : [];
        const newJob = new Job({
                postedBy: user._id,
                title: title,
                deadline: deadline,
                shortDescription: shortdescription,
                briefDescription: briefdescription,
                upload: uploadedFiles.join(','), 
                amount: Number(amount),
                type: type
            });
        await newJob.save();
        res.redirect(`/ulep/my-post/${username}`);
        }catch(err){
            console.error("Error posting job:", err);
            res.status(500).send("Server Error while posting job");
        }
});

router.post('/show/:username/:id/to-poster',upload.array('upload'),async(req,res)=>{
    try{
        const {username, id} = req.params;
        const {sender,body} = req.body;
        const userSender = await User.findOne({username: sender});
        const userTo = await User.findOne({username});
        const job = await Job.findByIdAndUpdate(id, {$push:{messages:{sender:userSender._id, to:userTo._id, body:body}}});
        res.redirect(`/ulep/show/${username}/${id}`);
    }catch(err){
        console.error(err);
        res.status(500).send("Something went wrong!");
    }
});

router.post('/show/:username/:id/by-poster', async(req,res)=>{
    try{
        const {username, id} = req.params;
        const {to,body} = req.body;
        const userSender = await User.findOne({username});
        const userTo = await User.findOne({username:to});
        const newBody = "@" + to + ":  " + body;
        const job = await Job.findByIdAndUpdate(id, {$push:{messages:{sender:userSender._id, to:userTo._id, body:newBody}}});
        res.redirect(`/ulep/show/${username}/${id}`);
    }catch(err){
        console.error(err);
        res.status(500).send("Something went wrong!");
    }
});

router.post('/show/assign/:username/:id', async(req,res)=>{
    try{
    const {username, id} = req.params;
    const user = await User.findOne({username});
    const job = await Job.findByIdAndUpdate(id,{assignee: user._id});
    res.redirect(`/ulep/show/${job.postedBy}/${job._id}`);
    }catch (err){
        console.error(err);
        res.status(500).send("Something went wrong");
    }
});

router.post('/show/:username/:id/workSubmission',upload.fields([{ name: 'completeWork', maxCount: 5 },{ name: 'qr', maxCount: 1 }]), async (req,res)=>{
    try {
        const {username, id} = req.params;
        const job = await Job.findById(id);
        const workFilesPaths = req.files['completeWork'] 
            ? req.files['completeWork'].map(file => file.filename) 
            : [];
        const qrPath = req.files['qr'] 
            ? req.files['qr'][0].filename 
            : null;
        await Job.findByIdAndUpdate(id, {
            $push: {completeWork: { $each: workFilesPaths }},
            $set: {qr: qrPath}
        });
        res.redirect(`/ulep/show/${username}/${id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Upload failed!");
    }
});

router.post('/edit-profile/:username', async (req,res)=>{
    try{
        const username = req.params.username;
        const {currentYear, about} = req.body;
        const user = await User.findOne({username});
        await User.findByIdAndUpdate(user._id, {currentYear,about});
        res.redirect(`/ulep/profile/${username}`);
    }catch (err){
        console.error(err);
        res.status(500).send("Something went wrong");
    }
})
router.post('/show/ss/:username/:id',upload.single('ss'), async(req,res)=>{
    try{
        const jobId = req.params.id;
        const username = req.params.username;
        await Job.findByIdAndUpdate(
            jobId, 
            { ss: req.file.filename } 
        );
        res.redirect(`/ulep/show/${username}/${jobId}`);
    }catch (err){
        console.error(err);
        res.status(500).send("someting went wrong");
    }
});
router.post('/show/:username/:id/complete',async(req,res)=>{
    try {
        const { username, id } = req.params;
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).send("Job not found");
        }
        job.deleteAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await job.save();
        res.redirect(`/ulep/show/${username}/${id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error marking job as complete");
    }
});
module.exports = router;