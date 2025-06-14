const AuthHeader = ({ icon, title, subtitle }) => {
  return (
    <div className="text-center">
      <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
    </div>
  );
};

export default AuthHeader;
