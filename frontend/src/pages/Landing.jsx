import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import About from '../components/About';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';

const Landing = () => {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login');

    const handleOpenAuthModal = (mode) => {
        setAuthModalMode(mode);
        setAuthModalOpen(true);
    };

    const handleCloseAuthModal = () => {
        setAuthModalOpen(false);
    };

    useEffect(() => {
        // Smooth scroll for anchor links
        const handleAnchorClick = (e) => {
            const anchor = e.target.closest('a');
            if (anchor) {
                const href = anchor.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const element = document.querySelector(href);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }
        };

        document.addEventListener('click', handleAnchorClick);
        return () => document.removeEventListener('click', handleAnchorClick);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar onOpenAuthModal={handleOpenAuthModal} />
            <Hero onOpenAuthModal={handleOpenAuthModal} />
            <Features />
            <About />
            <CTA onOpenAuthModal={handleOpenAuthModal} />
            <Footer />
            <AuthModal
                isOpen={authModalOpen}
                onClose={handleCloseAuthModal}
                initialMode={authModalMode}
            />
        </div>
    );
};

export default Landing;

