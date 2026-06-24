import { useState } from 'react';
import { Link } from 'react-router';

const Navbar = ({ onOpenAuthModal }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Messecure
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Features
                        </a>
                        <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            About
                        </a>
                        <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            Contact
                        </a>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            onClick={() => onOpenAuthModal('login')}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => onOpenAuthModal('register')}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 space-y-4 border-t border-gray-200">
                        <a
                            href="#features"
                            className="block px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Features
                        </a>
                        <a
                            href="#about"
                            className="block px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About
                        </a>
                        <a
                            href="#contact"
                            className="block px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Contact
                        </a>
                        <div className="pt-4 space-y-2 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onOpenAuthModal('login');
                                }}
                                className="w-full px-4 py-2 text-center text-gray-700 border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onOpenAuthModal('register');
                                }}
                                className="w-full px-4 py-2 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

