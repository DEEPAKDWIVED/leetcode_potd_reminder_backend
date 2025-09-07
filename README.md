# LeetCode POTD Reminder

A Telegram bot and backend service that helps users stay consistent with LeetCode's Problem of the Day (POTD) by sending reminders and tracking progress.

![LeetCode POTD Reminder](https://img.shields.io/badge/LeetCode-POTD%20Reminder-orange)
![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green)
![MongoDB](https://img.shields.io/badge/MongoDB-v4%2B-blue)
![Telegram Bot](https://img.shields.io/badge/Telegram-Bot-blue)

## 🌟 Features

- **Daily POTD Tracking**: Automatically fetches and stores LeetCode's Problem of the Day
- **Smart Reminders**: Sends reminders to users who haven't solved the day's problem
- **Progress Tracking**: Checks if users have solved the POTD and updates their status
- **User Management**: Allows users to set up their LeetCode username and reminder preferences
- **Telegram Integration**: Provides a user-friendly interface through Telegram

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

## 🚀 Getting Started

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/potd-reminder.git
   cd potd-reminder/Backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   _PORT=8000
   _MONGODB_URI=your_mongodb_connection_string
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

4. Start the application
   ```bash
   npm run dev
   ```

## 💻 Usage

### Telegram Bot Commands

- `/start` - Start the bot and create your account
- `/setup` - Configure your LeetCode username and reminder preferences
- `/profile` - View your current settings
- `/potd` - Get today's Problem of the Day
- `/rsubmissions` - View your recent LeetCode submissions
- `/syspotd` - Manually sync the POTD to the database (admin only)
- `/help` - Show all available commands

### API Endpoints

- `GET /` - Health check
- `POST /users` - Create a new user
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `GET /leetcode/potd` - Get today's POTD
- `GET /leetcode/check/:username` - Check if user has solved today's POTD

## 🔧 Architecture

The application consists of several components:

- **Express Server**: Handles API requests
- **MongoDB Database**: Stores user data and POTD information
- **Telegram Bot**: Provides user interface and interaction
- **Scheduler**: Runs daily tasks to fetch POTD and send reminders
- **LeetCode Service**: Interacts with LeetCode's GraphQL API

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **node-telegram-bot-api**: Telegram Bot API
- **node-cron**: Task scheduler
- **axios**: HTTP client for LeetCode API
- **dotenv**: Environment variable management
- **cors**: Cross-origin resource sharing

## 🚀 Deployment

### Railway

1. Create a Railway account
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

### Heroku

1. Create a Heroku app
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

### Render

1. Create a Web Service on Render
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

 