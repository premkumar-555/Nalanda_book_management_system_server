# Nalanda_book_management_system

A NodeJs server application to manage the books borrowing and related processes.

REST APIs :

1. User Management:
   Users model : {
   name : required,
   email : required, uniqueIndex
   password : required,
   role : ['admin', 'member'] default : 'member'
   }

- User Registration : using {name, email, password}
- User Login: using {email, password}
- - admin has all accesses, while member has restricted accesses

2. Book Management:
   Books model : {
   title : required,
   author : required,
   isbn : required, uniqueIndex,
   publishedDate : required,
   genre : required,
   totalCopies : required
   availableCopies : required
   }

- Add Book: \*Only admin can add new book
- Update Book: \*Only admin can update book details
- Delete Book: \*Only admin can delete book from the library.
- List Books: \*All users can view list of books + pagination(default 1) + filtering(by title, author, genre) + limit (default 50, if not given) ==> POST API : filter body
  {
  search : 'book or author',
  genre : ['comedy', 'horror'...]
  }

3. Borrowing System:
   borrowing model : {
   userId,
   bookId,
   borrowedAt,
   returnedAt,
   status : BORROWED OR RETURNED
   }

- Borrow Book: Members can borrow a book. Ensure the book is available (copies > 0)
- Return Book: Members can return a borrowed book.
- Borrow History: Members can view their borrowing history

4. Reports and Aggregations:

- Most Borrowed Books: Generate a report of the most borrowed books. - { title : 'bookName', totalBorrows : count }, sort in descending order by 'totalBorrows' (high to low count) ?

- Active Members: List the most active members based on borrowing history. - { userName : 'userName', totalBorrows : count }, sort in descending order by 'totalBorrows' (high to low count) ?

- Book Availability: Provide a summary report of book availability in counts (total books, borrowed books, available books).
