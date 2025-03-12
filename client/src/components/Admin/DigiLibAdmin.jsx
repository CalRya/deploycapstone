import React from 'react';
import '../css/DigiLib.css';
import BookList from '../Admin/booklist';
import EditBook from '../Admin/editbook';
import BookDisplay from '../DigiLib/bookDisplay';
import NavbarAdmin from '../Navbar/NavbarAdmin';
import ApproveBorrowRequests from './approvedBorrowBooks';
import LibrarianPanel from './LibrarianPanel';

const DigiLib = () => {
  return (
    <div className="digilib-container"> {/* ✅ Added class for spacing */}
      <NavbarAdmin />
      <BookList/>
      <EditBook/>
      <ApproveBorrowRequests />
    
      
    </div>
  );
};

export default DigiLib;
