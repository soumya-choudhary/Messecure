import { Link } from 'react-router';

const Hero = ({ onOpenAuthModal }) => {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background Images with aesthetic modern style */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90 z-10"></div>
                <img src="/Image1.png" alt="Background Element 1" className="absolute top-0 right-0 w-full md:w-3/4 h-full object-cover opacity-40 blur-sm mix-blend-overlay" />
                <img src="/Image2.png" alt="Background Element 2" className="absolute bottom-0 left-0 w-full md:w-1/2 h-full object-cover opacity-30 blur-md mix-blend-screen" />
                {/* Additional gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent z-10"></div>
            </div>

            <div className="relative max-w-7xl mx-auto w-full z-20">
                <div className="flex flex-col items-center justify-center text-center">
                    {/* Tagline Chip */}
                    <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white/10 border border-white/20 rounded-full mb-8 backdrop-blur-md shadow-2xl hover:bg-white/20 transition-all duration-300">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        <span className="text-sm font-medium text-gray-200 tracking-wide">Secure & Encrypted Communication</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight tracking-tight text-white drop-shadow-2xl">
                        <span>Chat Securely,</span>
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Connect Confidently
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                        Messecure is a premium encrypted chat platform enabling you to connect with friends, share stories, and converse with <span className="font-medium text-purple-400">Aura AI</span>. Experience instant messaging with enterprise-grade security and a flawless, modern design.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 w-full sm:w-auto">
                        <button
                            onClick={() => onOpenAuthModal('register')}
                            className="w-full sm:w-auto group px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 border border-white/10"
                        >
                            <span>Get Started</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                        <a
                            href="#features"
                            className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/20 text-white rounded-2xl font-semibold text-lg hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-md flex justify-center"
                        >
                            Explore Features
                        </a>
                    </div>

                    {/* Stats with Glassmorphism */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors">
                            <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight">
                                10K+
                            </div>
                            <div className="text-gray-400 font-medium uppercase tracking-wider text-sm">Active Users</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors">
                            <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight">
                                1M+
                            </div>
                            <div className="text-gray-400 font-medium uppercase tracking-wider text-sm">Messages Sent</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors">
                            <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight">
                                99.9%
                            </div>
                            <div className="text-gray-400 font-medium uppercase tracking-wider text-sm">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
