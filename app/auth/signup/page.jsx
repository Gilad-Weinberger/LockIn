"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithEmail, signInWithGoogle } from "../../../lib/auth";

// Components
import AuthLayout from "../../../components/auth/AuthLayout";
import AuthHeader from "../../../components/auth/AuthHeader";
import AuthFormWrapper from "../../../components/auth/AuthFormWrapper";
import AlertMessage from "../../../components/auth/AlertMessage";
import FormSignUp from "../../../components/auth/FormSignUp";
import FormDivider from "../../../components/auth/FormDivider";
import ButtonGoogle from "../../../components/auth/ButtonGoogle";
import AuthNavLink from "../../../components/auth/AuthNavLink";
import { SignUpIcon } from "../../../components/auth/icons";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    const { user, error } = await signUpWithEmail(
      formData.email,
      formData.password,
      formData.name
    );

    if (error) {
      setError(error);
    } else {
      setSuccess(
        "Account created successfully! Please check your email to verify your account."
      );
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    }

    setIsLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError("");

    const { user, error } = await signInWithGoogle();

    if (error) {
      setError(error);
    } else {
      router.push("/tasks");
    }

    setIsLoading(false);
  };

  return (
    <AuthLayout>
      <AuthHeader
        icon={<SignUpIcon />}
        title="Create Account"
        subtitle="Sign up to get started with your account"
      />

      <AuthFormWrapper>
        <AlertMessage message={error} type="error" />
        <AlertMessage message={success} type="success" />

        <FormSignUp
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleEmailSignUp}
          isLoading={isLoading}
        />

        <FormDivider />

        <ButtonGoogle onClick={handleGoogleSignUp} disabled={isLoading} />

        <AuthNavLink
          text="Already have an account?"
          linkText="Sign in"
          href="/auth/signin"
        />

        <div className="text-xs text-gray-500 text-center">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:text-blue-500">
            Privacy Policy
          </a>
        </div>
      </AuthFormWrapper>
    </AuthLayout>
  );
};

export default SignUpPage;
