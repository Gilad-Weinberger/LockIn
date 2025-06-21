import Link from "next/link";

const LegalNotice = () => {
  return (
    <div className="text-sm text-gray-500 text-center">
      By proceeding, you agree to the
      <br />
      <Link
        href="/legal/tos"
        className="text-gray-500 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        href="/legal/privacy-policy"
        className="text-gray-500 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Privacy Policy
      </Link>
    </div>
  );
};

export default LegalNotice;
