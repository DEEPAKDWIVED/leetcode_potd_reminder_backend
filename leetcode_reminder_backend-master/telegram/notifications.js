const bot = require('../telegram/telegramBot');

/**
 * Sends a reminder message to a Telegram chat
 * @param {string|number} chatId - Telegram chat ID to send the message to
 * @param {string} message - The message content to send (supports Markdown)
 * @returns {Promise} - Promise that resolves when message is sent
 */



const sendTelegramReminder = async (chatId, message) => {
  try {
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });
    
    console.log(`✅ Telegram reminder sent to chat ${chatId}`);
    return { success: true, chatId };
  } catch (error) {
    console.error(`❌ Failed to send Telegram reminder to ${chatId}: ${error.message}`);
    return { success: false, error: error.message, chatId };
  }
};




module.exports = {
  sendTelegramReminder
};