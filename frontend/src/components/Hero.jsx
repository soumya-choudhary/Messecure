import { Link } from 'react-router';

const Hero = ({ onOpenAuthModal }) => {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 blur-xl animate-pulse z-0"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-xl animate-pulse delay-1000 z-0"></div>

            <div className="relative max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="text-center 2xl:text-left z-20">
                        {/* Tagline Chip */}
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100/80 border border-blue-200 rounded-full mb-8 backdrop-blur-sm">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-sm font-medium text-blue-700">Secure & Encrypted Communication</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                            <span className="text-gray-900">Chat Securely,</span>
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Connect Confidently
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto 2xl:mx-0 mb-10 leading-relaxed">
                            Messecure is a secure, encrypted chat platform that enables you to connect with friends, join group conversations,
                            share stories, and chat with <span className="font-semibold text-purple-600">Aura AI</span>—your intelligent assistant powered by Gemini.
                            Experience instant messaging with enterprise-grade security and beautiful design.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center 2xl:items-start justify-center 2xl:justify-start gap-4 mb-16">
                            <button
                                onClick={() => onOpenAuthModal('register')}
                                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                            >
                                <span>Get Started</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                            <Link
                                to="#features"
                                className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                            >
                                Explore Features
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto 2xl:mx-0">
                            <div className="text-center 2xl:text-left">
                                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                    10K+
                                </div>
                                <div className="text-gray-600 font-medium">Active Users</div>
                            </div>
                            <div className="text-center 2xl:text-left">
                                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                    1M+
                                </div>
                                <div className="text-gray-600 font-medium">Messages Sent</div>
                            </div>
                            <div className="text-center 2xl:text-left">
                                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                    99.9%
                                </div>
                                <div className="text-gray-600 font-medium">Uptime</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Chat Illustration - Desktop Only */}
                    <div className="hidden 2xl:block relative z-10">
                        <div className="relative">
                            {/* Main Chat Card */}
                            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/50">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-white font-bold text-lg">M</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-800 rounded w-32 mb-2"></div>
                                            <div className="h-2 bg-gray-400 rounded w-24"></div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="space-y-3">
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl rounded-tl-none p-4 ml-12 shadow-md">
                                            <div className="h-3 bg-white/90 rounded w-full mb-2"></div>
                                            <div className="h-3 bg-white/70 rounded w-3/4"></div>
                                        </div>
                                        <div className="bg-gray-100 rounded-2xl rounded-tr-none p-4 mr-12">
                                            <div className="h-3 bg-gray-600 rounded w-full mb-2"></div>
                                            <div className="h-3 bg-gray-500 rounded w-2/3"></div>
                                        </div>
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl rounded-tl-none p-4 ml-12 shadow-md">
                                            <div className="h-3 bg-white/90 rounded w-2/3"></div>
                                        </div>
                                    </div>

                                    {/* Input Area */}
                                    <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                                        <div className="flex-1 h-12 bg-gray-100 rounded-full"></div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-200 rounded-full opacity-50 blur-2xl -z-10"></div>
                            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 rounded-full opacity-50 blur-2xl -z-10"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
