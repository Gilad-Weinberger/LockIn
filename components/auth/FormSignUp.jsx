"use client";

import InputField from "./InputField";

const FormSignUp = ({ formData, onInputChange, onSubmit, isLoading }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <InputField
        id="name"
        name="name"
        type="text"
        label="Full Name"
        value={formData.name}
        onChange={onInputChange}
        placeholder="Enter your full name"
        required
      />

      <InputField
        id="email"
        name="email"
        type="email"
        label="Email Address"
        value={formData.email}
        onChange={onInputChange}
        placeholder="Enter your email"
        required
      />

      <InputField
        id="password"
        name="password"
        type="password"
        label="Password"
        value={formData.password}
        onChange={onInputChange}
        placeholder="Create a password"
        helperText="Must be at least 6 characters long"
        required
      />

      <InputField
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        value={formData.confirmPassword}
        onChange={onInputChange}
        placeholder="Confirm your password"
        required
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition duration-200 font-medium"
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
};

export default FormSignUp;
