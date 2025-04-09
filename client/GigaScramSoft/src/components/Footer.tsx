import React from 'react';
// import { FaGithub, FaTwitter, FaFacebook, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import '../styles/components/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* <div className="footer-section">
          <h3>About GigaScramSoft</h3>
        </div> */}
        
        {/* <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="footer-social-icons">
            <a href="https://github.com/gigascramsoft" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
            <a href="https://twitter.com/gigascramsoft" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://facebook.com/gigascramsoft" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://linkedin.com/company/gigascramsoft" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          </div>
        </div> */}
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} GigaScramSoft. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 