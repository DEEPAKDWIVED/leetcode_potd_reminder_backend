var cron = require('node-cron');
const { getProblemOfDay, isProblemOfDaySolved } = require('./services/leetcodeService');
const { sendTelegramReminder } = require('./telegram/notifications');
const POTD = require('./models/potd');
const User = require('./models/users');

// Batch size for processing users
const BATCH_SIZE = 50;

// Function to fetch and store POTD at 0 UTC
const fetchAndStorePOTD = async () => {
  try {
    console.log("🔄 Fetching new POTD at UTC midnight...");
    
    // Add a small delay to ensure LeetCode has updated the POTD
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { date, title } = await getProblemOfDay();
    
    // Create new POTD entry
    const potdDate = new Date(date);
    potdDate.setUTCHours(0, 0, 0, 0);
    
    await POTD.findOneAndUpdate(
      { date: potdDate },
      { title, date: potdDate },
      { upsert: true, new: true }
    );
    
    console.log("✅ New POTD stored successfully:", title);
    
    // Run initial reminder check after POTD update
    await runReminderWindow();
  } catch (error) {
    console.error("❌ Error fetching/storing POTD:", error.message);
  }
};

// Process users in batches
const processUserBatch = async (users, utcHour) => {
  // Create a proper Date object for today at midnight UTC for consistent comparison
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);
  
  console.log(`🔄 Processing batch of ${users.length} users at UTC hour ${utcHour}`);
  
  const promises = users.map(async (user) => {
    try {
      // Get username for logging (with fallback)
      const userIdentifier = user.leetcodeUsername || user.telegramChatId || 'unknown';
      console.log(`🔍 Processing user ${userIdentifier}`);
      
      // Find today's POTD (using the properly created date object)
      const potd = await POTD.findOne({ date: todayUTC });
      
      if (!potd) {
        console.log("❌ No POTD found for today.");
        return; // No POTD available
      }

      if (!user.telegramChatId) {
        console.log(`❌ User ${userIdentifier} has no Telegram chat ID.`);
        return; // No Telegram chat ID
      }

      // Check if problem already solved
      if (user.reminderStatus?.lastPOTDSolvedTitle === potd.title) {
        console.log(`✅ User ${userIdentifier} already solved today's problem.`);
        return; // Already solved today's problem
      }
      
      // Check if reminder already sent in current hour
      // This prevents sending multiple reminders in the same hour
      const lastReminded = user.reminderStatus?.lastRemindedAt;
      if (lastReminded) {
        const lastRemindedTime = new Date(lastReminded);
        if (lastRemindedTime.getUTCHours() === utcHour && 
            lastRemindedTime.getUTCDate() === todayUTC.getUTCDate() && 
            lastRemindedTime.getUTCMonth() === todayUTC.getUTCMonth() &&
            lastRemindedTime.getUTCFullYear() === todayUTC.getUTCFullYear()) {
          console.log(`⏭️ User ${userIdentifier} already reminded during hour ${utcHour} UTC`);
          return; // Already reminded this hour
        }
      }
    
      // Check if problem is solved
      const { isSolved, problemOfDay } = await isProblemOfDaySolved(user.leetcodeUsername);

      if (!isSolved) {
        const hoursLeft = 24 - utcHour;
        const message = `🔔 *LeetCode POTD Reminder*\n\n` +
                       `You haven't solved today's problem yet!\n\n` +
                       `📌 *Problem:* ${problemOfDay.title}\n` +
                       `⏳ *Time Left:* ${hoursLeft} hours until reset\n\n` +
                       `Happy coding! 💻`;

        // Send reminder and check the result
        const result = await sendTelegramReminder(user.telegramChatId, message);
        
        if (result && result.success) {
          // Update reminder status
          user.reminderStatus.lastRemindedAt = new Date();
          await user.save();
          console.log(`✅ Reminder sent to ${userIdentifier} at hour ${utcHour} UTC`);
        } else {
          console.error(`⚠️ Failed to send reminder to ${userIdentifier}: ${result?.error || 'Unknown error'}`);
        }
      } else {
        console.log(`✅ User ${userIdentifier} has now solved today's problem.`);
        user.reminderStatus.lastPOTDSolvedTitle = potd.title;
        await user.save();
      }

    } catch (err) {
      console.error(`❌ Error processing user ${user.leetcodeUsername || user.telegramChatId || 'unknown'}:`, err.message);
    }
  });

  // Using Promise.allSettled to ensure all users are processed even if some fail
  await Promise.allSettled(promises);
  console.log(`✅ Batch processing complete`);
};

const runReminderWindow = async () => {
  console.log("📅 Running POTD Reminder Check...");
  const now = new Date();
  const utcHour = now.getUTCHours();    
 
  if (utcHour < 7 || utcHour > 23) {
    console.log("⏰ Outside reminder window (7-23 UTC), skipping...");
    return;
  }

  try {
   
    const totalUsers = await User.countDocuments({ "reminders.potd": true });
    console.log(`📊 Processing ${totalUsers} users...`);

   
    for (let skip = 0; skip < totalUsers; skip += BATCH_SIZE) {
      const users = await User.find({ "reminders.potd": true })
        .skip(skip)
        .limit(BATCH_SIZE);
      
      await processUserBatch(users, utcHour);
      
      
      if (skip + BATCH_SIZE < totalUsers) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log("✅ Reminder cycle complete.");
  } catch (error) {
    console.error("❌ Error in reminder window:", error.message);
  }
};


cron.schedule("1 0 * * *", fetchAndStorePOTD,{
  scheduled: true,
  timezone: "UTC"
});

cron.schedule("0 7-23 * * *", async () => {
  try {
    await runReminderWindow();
  } catch (error) {
    console.error("❌ Error in scheduled reminder:", error.message);
  }
}, {
  scheduled: true,
  timezone: "UTC"
});


module.exports = {
  fetchAndStorePOTD,
  runReminderWindow,
};
