import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        onMobileMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
