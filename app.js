// require models
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const itemRoutes = require('./routes/itemRoutes');
const multer = require('multer');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const userRoutes = require('./routes/userRoutes');
const offerRoutes = require('./routes/offerRoutes')



// const {MongoClient} = require('mongodb');
// const {getCollection} = require('./models/item');

//create app
const app = express();


//condfigure app
let port = 3000;
let host = 'localhost';

//MONGODB install command was already ran
let url = '';
app.set('view engine', 'ejs');

//connect to MongoDB
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        //start the server
        app.listen(port, host, () => {
            console.log('Server is running on port', port);
        })

    })
    .catch(err => console.log(err.message));

//mount middleware 
const upload = multer({ dest: './public/images' }).single('images');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'qwertyadfsdafasdfsadjadgkl',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    store: new MongoStore({ mongoUrl: '' })
}));

//enables flash
app.use(flash());

//sets error and success flashes
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    next();
});

//set up routes
app.get('/', (req, res) => {
    res.render('index');
});

//sets up item routes
app.use('/items', itemRoutes);

//sets up user routes
app.use('/users', userRoutes);

//sets up offer routes
app.use('/offers', offerRoutes);


//if invalid URL throws a 404
app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);

});


//if error on the servers end throws a 500
app.use((err, req, res, next) => {
    console.log(err.stack);
    if (!err.status) {
        err.status = 500;
        err.message = ("internal server error");
    }
    res.status(err.status);
    res.render('error', { Error: { Status: err.status }, error: { message: err.message } });
});

