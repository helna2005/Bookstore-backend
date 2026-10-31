const { GoogleGenerativeAI } = require('@google/generative-ai');
const books = require('../models/bookModel')
const stripe = require('stripe')(process.env.STRIPE_SK);

//add book
exports.addBookController = async (req, res) => {
    console.log(" inside addBookController");
    //get book details from req body
    const { title, author, imagURL, pages, price, discountPrice, abstract, publisher, isbn, language, category } = req.body
    const uploadImage = req.files.map(item => item.filename)
    const sellerMail = req.payload
    console.log(title, author, imagURL, pages, price, discountPrice, abstract, publisher, isbn, language, category, uploadImage, sellerMail);

    //     //check book exist or not
    const existingBook = await books.findOne({ title, sellerMail })
    //book  already exist
    if (existingBook) {
        res.status(409).json("Book Already Exist")
    } else {
        //add book
        const newBook = await books.create({ title, author, imagURL, pages, price, discountPrice, abstract, publisher, isbn, language, category, uploadImage, sellerMail })
        res.status(201).json(newBook)
    }
}

//get latest books: get 4 books
exports.getHomeBookController = async (req, res) => {
    console.log("getHomeBookController");
    const homeBook = await books.find().sort({ _id: -1 }).limit(4)
    res.status(200).json(homeBook)
}


//get all books : ignore  book uploaded by logined user
exports.getAllBooksController = async (req, res) => {
    console.log("getAllBooksController");
    const loginUserMail = req.payload
    //query add to url for search
    const searchKey = req.query.search
    const allBook = await books.find({ sellerMail: { $ne: loginUserMail }, title: { $regex: searchKey, $options: "i" } })
    res.status(200).json(allBook)
}

//get logined user uploaded book
exports.getUserBooksController = async (req, res) => {
    console.log("getUserBooksController");
    const loginUserMail = req.payload
    const userBook = await books.find({ sellerMail: loginUserMail })
    res.status(200).json(userBook)
}

//get logined user purchased book 
exports.getUserBroughtBooksController = async (req, res) => {
    console.log("getUserBroughtBooksController");
    const loginUserMail = req.payload
    const userBroughtBook = await books.find({ buyerMail: loginUserMail })
    res.status(200).json(userBroughtBook)
}

//delete book uploaded by logined user
exports.deleteUploadBooksController = async (req, res) => {
    console.log("deleteUploadBooksController");
    const { id } = req.params
    const deleteBook = await books.findByIdAndDelete({ _id: id })
    res.status(200).json(deleteBook)
}

//get single book to view
exports.viewBookController = async (req, res) => {
    console.log("viewBookController");
    const { id } = req.params
    const bookDetails = await books.findById({ _id: id })
    res.status(200).json(bookDetails)
}

//get all books: admin page
exports.getAllBookController=async(req,res)=>{
    console.log("inside getAllBookController");
    const allBooks=await books.find()
    res.status(200).json(allBooks)
}

//update book satus: adimn page 
exports.updateBookStatusController = async (req, res) => {
    console.log("updateBookStatusController");
    const { id } = req.params
    const bookDetails = await books.findById({ _id: id })
    bookDetails.status="approved"
    await bookDetails.save()
    res.status(200).json(bookDetails)
}

//book payment
exports.bookPaymentController = async (req, res) => {
    console.log("inside bookPaymentController");
    const buyerMail = req.payload
    const { id } = req.params
    const bookDetails = await books.findById({ _id: id })
    bookDetails.status = "sold"
    bookDetails.buyerMail = buyerMail
    await bookDetails.save()
    //create stripe checkout session
    const line_items = [{
        price_data: {
            currency: "usd",
            product_data: {
                name: bookDetails.title,
                description: `${bookDetails.author},${bookDetails.publisher}`,
                // images: bookDetails.uploadImage,
                metadata: {
                    title: bookDetails.title, author: bookDetails.author, price: bookDetails.discountPrice
                }
            },
            unit_amount: Math.round(bookDetails.discountPrice) * 100
        },
        quantity: 1
    }]
    const session = await stripe.checkout.sessions.create({
        success_url: 'https://bookstore-frontend-eight-bay.vercel.app/success',
        cancel_url: 'https://bookstore-frontend-eight-bay.vercel.app/failed',
        line_items,
        mode: 'payment',
        allowed_payment_method_types: ['card']
    })
    console.log(session);
    res.status(200).json({checkoutURL:session.url})
}

//get book abstract using gemini api
exports.generateAbstractAIController=async(req,res)=>{
    console.log("Inside generateAbstractAIController");
    const genAI=new GoogleGenerativeAI(process.env.GEMINI_API)
    const {title}=req.body
    const model=genAI.getGenerativeModel({
        model:"gemini-3.5-flash-lite"
    })
    const result=await model.generateContent(`Give me a short Abstract, isbn, author name of the book ${title} in json format`)
    let replay=result.response.candidates[0].content.parts[0].text;

    //Remove markdowncode fences
    replay=replay.replace(/```json|```/g,"").trim();
    
    //convert string into json
    const bookData=JSON.parse(replay)
    console.log(bookData);
    
    //extract abstract
    const abstract=bookData.abstract;
    const author=bookData.author;
    const isbn=bookData.isbn;

    res.status(200).json({
        success:true,
        user:title,
        content:{abstract,author,isbn}
    })
    
}