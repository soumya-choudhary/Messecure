const About = () => {
    return (
        <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div>
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full mb-6">
                            <span className="text-sm font-medium text-blue-700">About Us</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Built for{' '}
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Modern Communication
                            </span>
                        </h2>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            Messecure is designed with security and privacy at its core. We've created a platform that combines
                            the best of encrypted real-time messaging, social networking, and AI-powered assistance with Aura AI.
                        </p>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Whether you're connecting with friends, collaborating with teams, or chatting with Aura AI for intelligent assistance,
                            our platform provides enterprise-grade security and all the tools you need for seamless, protected communication.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Lightning Fast</h3>
                                    <p className="text-gray-600">Real-time messaging with minimal latency for instant communication.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Secure & Private</h3>
                                    <p className="text-gray-600">Your data is encrypted and protected with industry-standard security.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">AI-Powered</h3>
                                    <p className="text-gray-600">Chat with Aura AI powered by Gemini for intelligent assistance and conversations.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Cross-Platform</h3>
                                    <p className="text-gray-600">Works seamlessly across all devices and platforms.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Visual */}
                    <div className="relative">
                        <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 shadow-2xl">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-3 bg-white/30 rounded w-3/4 mb-2"></div>
                                        <div className="h-2 bg-white/20 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-white/20 rounded w-full"></div>
                                    <div className="h-4 bg-white/20 rounded w-5/6"></div>
                                    <div className="h-4 bg-white/20 rounded w-4/6"></div>
                                </div>
                                <div className="flex items-center space-x-2 pt-4">
                                    <div className="flex-1 h-10 bg-white/20 rounded-lg"></div>
                                    <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-200 rounded-full opacity-50 blur-2xl"></div>
                        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 rounded-full opacity-50 blur-2xl"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;

