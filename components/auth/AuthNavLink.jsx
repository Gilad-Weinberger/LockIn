import Link from "next/link";

const AuthNavLink = ({ text, linkText, href }) => {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-600">
        {text}{" "}
        <Link
          href={href}
          className="font-medium text-blue-600 hover:text-blue-500 transition duration-200"
        >
          {linkText}
        </Link>
      </p>
    </div>
  );
};

export default AuthNavLink;
