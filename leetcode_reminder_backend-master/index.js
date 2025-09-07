const express = require('express')
const app = express()
require('./telegram/telegramBot')
const cors = require('cors')

require('./scheduler')
const dotenv = require('dotenv')
dotenv.config()

const port = process.env._PORT || 3000

//Middleware

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const toLowercaseDeep = (obj) => {
    if (typeof obj === 'string') {
      return obj.toLowerCase();
    } else if (Array.isArray(obj)) {
      return obj.map(toLowercaseDeep);
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, toLowercaseDeep(value)])
      );
    }
    return obj;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = toLowercaseDeep(req.body);
  }
  next();
});



//Conection
const connectdb= require('./connection')
connectdb()




const userrouter = require('./routes/users')
//Routes
app.use('/users', userrouter)
app.use('/leetcode', require('./routes/leetcode'))




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})