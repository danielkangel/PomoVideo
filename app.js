const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: true, httpOnly: true, sameSite: 'none'}
}));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(require('./routes'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});