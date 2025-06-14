"use client";

import InputField from "./InputField";

const FormPasswordReset = ({
  resetEmail,
  onEmailChange,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Reset Password
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <InputField
        id="reset-email"
        name="reset-email"
        type="email"
        label="Email Address"
        value={resetEmail}
        onChange={onEmailChange}
        placeholder="Enter your email"
        required
      />

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition duration-200 font-medium"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default FormPasswordReset;
