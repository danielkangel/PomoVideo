const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const defTimer = require("./models/default");
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false, sameSite: 'strict'},
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL})
}));
app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
    if (!req.session.settings) {
        req.session.settings = defTimer;
    }
    next();
});
app.use(methodOverride('_method'));
app.use(require('./routes'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});