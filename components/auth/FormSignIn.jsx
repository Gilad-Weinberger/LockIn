"use client";

import Link from "next/link";
import { useState } from "react";
import InputField from "./InputField";

const FormSignIn = ({
  formData,
  onInputChange,
  onSubmit,
  isLoading,
  onForgotPassword,
}) => {
  return (
    <div className="space-y-6">
      {/* App Logo */}
      <div className="flex justify-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-xl font-bold text-gray-800">LockIn</span>
        </Link>
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
          placeholder="Enter your password"
          required
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-500 transition duration-200"
          >
            Forgot your password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition duration-200 font-medium"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default FormSignIn;
