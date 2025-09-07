
const {getTodayPOTD ,getRecentAcceptedSubmissions ,isProblemOfDaySolved}= require('../services/leetcodeService');
const express = require('express');


const router= express.Router();


 router.get("/potd",async (req, res) => {
    const potd=await getTodayPOTD();
    if(potd){
        res.status(200).json(potd);
    }else{
        res.status(404).json({error:"No POTD found"});
    }
})

router.get("/recent-submissions",async (req, res) => {
    const username=req.body.username;
    if(!username){
        res.status(400).json({error:"Username is required"});
    }
    try{
        const submissions=await getRecentAcceptedSubmissions(username);
        res.status(200).json(submissions);
    }catch(error){
        res.status(500).json({error:error.message});
    }
})

router.get("/is-potd-solved",async (req, res) => {
    const username=req.body.username;
    if(!username ){
        res.status(400).json({error:"Username is required"});
    }
    try{
        const isSolved=await isProblemOfDaySolved(username);
        res.status(200).json(isSolved);
    }catch(error){
        res.status(500).json({error:error.message});
    }
});





module.exports= router;