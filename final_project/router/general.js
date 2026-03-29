const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
//public_users.get('/',function (req, res) {
//  res.send(JSON.stringify(books,null,4));
//});

public_users.get('/', function (req, res) {
  const booksPromise = new Promise((resolve, reject) => {
    if (books && Object.keys(books).length > 0) {
      resolve(books);
    } else {
      reject(new Error('There are no books to review'));
    }
  });

  booksPromise
    .then(booksData => {
      res.send(JSON.stringify(booksData, null, 4));
    })
    .catch(error => {
      res.status(404).json({ message: error.message });
    });
});

// Get book details based on ISBN
//public_users.get('/isbn/:isbn',function (req, res) {
//  const isbn = req.params.isbn;
//  const book = books[isbn];
//  if (book) {
//    return res.status(200).json(book);
//  } else {
//    return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
//  }
// });

 public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const bookPromise = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error(`Book with ISBN ${isbn} not found`));
    }
  });
  
  bookPromise
    .then(book => {
      res.status(200).json(book);
    })
    .catch(error => {
      res.status(404).json({ message: error.message });
    });
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];
  const bookKeys = Object.keys(books);
  
  bookKeys.forEach(key => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
      matchingBooks.push(books[key]);
    }
  });
  
  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({message: `No books found by author ${author}`});
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];
  const bookKeys = Object.keys(books);
  
  bookKeys.forEach(key => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      matchingBooks.push(books[key]);
    }
  });
  
  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({message: `No books found with title ${title}`});
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  
  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({message: `Reviews not found for ISBN ${isbn}`});
  }
});

module.exports.general = public_users;
