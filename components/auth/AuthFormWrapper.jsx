const AuthFormWrapper = ({ children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 mb-5">
      {children}
    </div>
  );
};

export default AuthFormWrapper;
