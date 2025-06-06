const express = require('express');
const controller = require('../controllers/itemController');
const offerRoutes = require('./offerRoutes');
const multer = require('multer');
const path = require('path');
const { isLoggedIn, isSeller } = require('../middlewares/auth');
const {body} = require('express-validator');



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (mimeTypes.includes(file.mimetype))
    return cb(null, true);
  else
    cb(new Error('Invalid file type. Only jpg, jpeg, png and gif are allowed'), false);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }).single('images');


const router = express.Router();

//GET /items: send all items to the user

router.get('/', controller.index);


//GET /items/new: send html form for creating a new item

router.get('/new', isLoggedIn, controller.new);


//POST /items: create a new item

router.post('/', isLoggedIn,
[body('title', 'title is required').trim().escape(),
body('price', 'price is required').trim().escape(),
body('details', 'artist is required'),
body('images', 'image is required')
], upload, controller.create);


//GET /items/:id: send details of items identified by id

router.get('/:id', controller.show);


//GET /items/:id/edit: send html for editing an existing item
router.get('/:id/edit', isLoggedIn, isSeller, controller.edit);

//PUT /items/:id: update the item identified by id
router.put('/:id', isLoggedIn, isSeller,
[body('title').trim().escape(),
body('price').trim().escape(),
], upload, controller.update);

//DELETE /items/:id, delete the item identified by id
router.delete('/:id', isLoggedIn, isSeller, controller.delete);

router.use('/:id/offers', offerRoutes);

module.exports = router;