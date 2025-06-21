const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Analytics Preview */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4">
              Transform Your Productivity
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users who have revolutionized their task
              management with LockIn.
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl"></div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-[#fbfaf9]">
        <div className="max-w-md w-full space-y-8">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
