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

// Get book list available in the shop
public_users.get('/', function (req, res) {
  const promise = new Promise((resolve, reject) => {
    axios.get('http://localhost:5000/')
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
  promise
    .then(data => res.status(200).json(data))
    .catch(error => res.status(500).json({ message: "Error fetching book list", error: error.message }));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const promise = new Promise((resolve, reject) => {
    axios.get(`http://localhost:5000/isbn/${isbn}`)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
  promise
    .then(data => res.status(200).json(data))
    .catch(error => res.status(404).json({ message: `Error fetching book details with ISBN ${isbn}`, error: error.message }));
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const promise = new Promise((resolve, reject) => {
    axios.get(`http://localhost:5000/author/${author}`)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
  promise
    .then(data => res.status(200).json(data))
    .catch(error => res.status(404).json({ message: `No books found by author ${author}`, error: error.message }));
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
//public_users.get('/review/:isbn', function (req, res) {
//  const isbn = req.params.isbn;
//  const book = books[isbn];
  
//  if (book && book.reviews) {
//    return res.status(200).json(book.reviews);
//  } else {
//    return res.status(404).json({message: `Reviews not found for ISBN ${isbn}`});
//  }
//});

public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  
  const titleBooksPromise = new Promise((resolve, reject) => {
    const matchingBooks = [];
    const bookKeys = Object.keys(books);
    
    bookKeys.forEach(key => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        matchingBooks.push(books[key]);
      }
    });
    
    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject(new Error(`No books found with title ${title}`));
    }
  });
  
  titleBooksPromise
    .then(matchingBooks => {
      res.status(200).json(matchingBooks);
    })
    .catch(error => {
      res.status(404).json({ message: error.message });
    });
});

module.exports.general = public_users;
