const express=require("express")
const userController=require('../controllers/userController')
const authMiddleware = require("../middlewares/authMiddleware")
const multerMiddleware = require("../middlewares/multerMiddleware")
const bookController=require('../controllers/bookController')
const adminMiddleware = require("../middlewares/adminMiddleware")

//object for router class in express
const router= new express.Router()

//register
router.post('/register',userController.registerController)

//login
router.post('/login',userController.loginController)

//google login
router.post('/google-login',userController.googleLoginController)

//get home book 
router.get('/home-book',bookController.getHomeBookController)

//-----------------------------Authorized Access-------------------------------------

//edit user
router.put('/user/:id',authMiddleware,multerMiddleware.single('picture'),userController.userEditController)

//add book
router.post('/book',authMiddleware,multerMiddleware.array('uploadImage',3),bookController.addBookController)

//get all book
router.get('/all-books',authMiddleware,bookController.getAllBooksController)

//get user uploaded books
router.get('/user-books',authMiddleware,bookController.getUserBooksController)

//get user brought books
router.get('/brought-books',authMiddleware,bookController.getUserBroughtBooksController)

//delete user uploaded book
router.delete('/book/:id',authMiddleware,bookController.deleteUploadBooksController)

//get view book
router.get('/view-book/:id',authMiddleware,bookController.viewBookController)

//book payment
router.put('/books/:id/buy',authMiddleware,bookController.bookPaymentController)

//get abstract via AI book
router.post('/book-ai',authMiddleware,bookController.generateAbstractAIController)

//-----------------------------Authorized Access : admin-------------------------------------

//edit admin
router.put('/admin/:id',adminMiddleware,multerMiddleware.single('picture'),userController.userEditController)

//get all users
router.get('/user-list',adminMiddleware,userController.getAllUsersController)

//get all books
router.get('/book-list',adminMiddleware,bookController.getAllBookController)

//update book status
router.put('/book/:id',adminMiddleware,bookController.updateBookStatusController)




module.exports=router