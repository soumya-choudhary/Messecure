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
                    <div className="relative lg:ml-10 mt-10 lg:mt-0">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                            <img src="/Image1.png" alt="Messecure App Interface" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-300 rounded-full opacity-60 blur-2xl -z-10"></div>
                        <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-blue-300 rounded-full opacity-60 blur-2xl -z-10"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;

