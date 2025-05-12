const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid

}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.

}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // 1. Check if credentials are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // 2. Find the user in registered users
  const user = users.find(user => user.username === username);
  
  // 3. Verify user exists
  if (!user) {
    return res.status(404).json({ 
      message: "User not found. Please register first." 
    });
  }

  // 4. Verify password matches
  if (user.password !== password) {
    return res.status(401).json({ 
      message: "Invalid password" 
    });
  }

  // 5. Create JWT token
  const token = jwt.sign(
    { username: user.username },
    "fingerprint_customer",
    { expiresIn: '1h' }
  );

  // 6. Store in session
  req.session.authorization = {
    token,
    username: user.username
  };

  // 7. Successful response
  return res.status(200).json({
    message: "Login successful",
    username: user.username,
    token: token
  });

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const reviewText = req.query.review; // Get review from query parameter
  const username = req.session.authorization.username; // Get username from session

  // Check if review is provided
  if (!reviewText) {
    return res.status(400).json({ message: "Review text is required" });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews object if it doesn't exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add/modify the review
  books[isbn].reviews[username] = reviewText;

  return res.status(200).json({ 
    message: "Review submitted successfully",
    book: books[isbn]
  });

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Get username from session
  
    // Check if book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Check if the book has any reviews
    if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
      return res.status(404).json({ message: "No reviews found for this book" });
    }
  
    // Check if the user has a review for this book
    if (!books[isbn].reviews[username]) {
      return res.status(403).json({ 
        message: "You haven't reviewed this book or review already deleted" 
      });
    }
  
    // Delete the user's review
    delete books[isbn].reviews[username];
  
    return res.status(200).json({ 
      message: "Review deleted successfully",
      book: books[isbn]
    });
  });
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
