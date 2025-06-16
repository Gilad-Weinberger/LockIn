import Link from "next/link";

const NavbarLogo = () => {
  return (
    <div className="flex items-center">
      <Link href="/" className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">L</span>
        </div>
        <span className="text-xl font-bold text-gray-800">LockIn</span>
      </Link>
    </div>
  );
};

export default NavbarLogo;
