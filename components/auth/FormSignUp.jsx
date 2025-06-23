"use client";

import Link from "next/link";
import InputField from "./InputField";
import Logo from "@/components/ui/Logo";

const FormSignUp = ({ formData, onInputChange, onSubmit, isLoading }) => {
  return (
    <div className="space-y-6">
      {/* App Logo */}
      <div className="flex justify-center">
        <Logo />
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
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
          helperText="Must be at least 8 characters long"
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
    </div>
  );
};

export default FormSignUp;
