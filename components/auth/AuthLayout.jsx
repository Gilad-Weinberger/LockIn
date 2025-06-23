const AuthLayout = ({ children }) => {
  return (
    <div className="h-screen flex">
      {/* Right Panel - Auth Form */}
      <div className="w-full flex items-center justify-center p-4 bg-[#fbfaf9]">
        <div className="max-w-md w-full space-y-8">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
