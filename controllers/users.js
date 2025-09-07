

const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/users');
const {isProblemOfDaySolved}  = require('../services/leetcodeService');


const handlegetuserbyemail = async (req, res) => {
    // Extract the email from the request parameters
    const email = req.params.email;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    // Check if the email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    // Find the user by email
    const user = await User.findOne({ email })
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user });
}


const handeluserdelete = async (req, res) => {
    const { email } = req.body;
    console.log(email);
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    // Check if the email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOneAndDelete({ email: email })
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted successfully' });
}



const handelusersetup = async (req, res) => {
    try {
      const {
        email,
        leetcodeUsername,
        telegramChatId,
        whatsappNumber,
        reminders,
        frequency,
      } = req.body;
  
      if (!email || !leetcodeUsername) {
        return res.status(400).json({ error: "Email and LeetCode username are required." });
      }
      
  
      const user = await User.findOneAndUpdate(
        { email },
        {
          email,
          leetcodeUsername,
          telegramChatId,
          whatsappNumber,
          reminders,
          frequency,
          updatedAt: Date.now(),
        },
        { upsert: true, new: true }
      );

      if(!telegramChatId){
        bot.sendMessage(
          telegramChatId,
          `Hello ${leetcodeUsername}, your account has been set up successfully!`
        );
      }

  
      res.status(201).json({ success: true, user });
    } catch (err) {
      console.error("Setup User Error:", err.message);
      res.status(500).json({ error: "Failed to save user settings." });
    }
  };


  const handeuserpotdstatus=async (req,res)=>{
    const { email } = req.body;
    if (!email ) {
        return res.status(400).json({ message: 'Email required' });
    }

    // Check if the email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne(
        { email: email },
    )
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const leetcodeUsername = user.leetcodeUsername;
    if(!leetcodeUsername){
        return res.status(404).json({ message: 'LeetCode username not found' });
    }
    const potd = await isProblemOfDaySolved(leetcodeUsername);
    const status= potd.isSolved? true : false;
    const potdtitel= potd.problemOfDay.title;
    
    return res.status(200).json(
    { 
    message: `The POTD is ${status ? 'solved' : 'not solved'}` ,
    status: status,
    titel: potdtitel,
    });
  }


module.exports = {
    handlegetuserbyemail,
    handeluserdelete,
     handelusersetup,
     handeuserpotdstatus
}
