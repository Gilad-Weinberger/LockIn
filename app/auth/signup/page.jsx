"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithEmail, signInWithGoogle } from "../../../lib/auth";
import { createUser, getUserData } from "@/lib/functions/userFunctions";

// Components
import AuthLayout from "../../../components/auth/AuthLayout";
import AuthFormWrapper from "../../../components/auth/AuthFormWrapper";
import AlertMessage from "../../../components/auth/AlertMessage";
import FormSignUp from "../../../components/auth/FormSignUp";
import FormDivider from "../../../components/auth/FormDivider";
import ButtonGoogle from "../../../components/auth/ButtonGoogle";
import AuthNavLink from "../../../components/auth/AuthNavLink";
import LegalNotice from "../../../components/auth/LegalNotice";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    // Validate password strength
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    const { user, error } = await signUpWithEmail(
      formData.email,
      formData.password
    );

    if (error) {
      setError(error);
    } else {
      // Create user object in database and redirect to pricing
      await createUser(user);
      router.push("/pricing");
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
      // Check if user object exists in database
      const userData = await getUserData(user.uid);

      if (!userData) {
        // Create user object and redirect to pricing
        await createUser(user);
        router.push("/pricing");
      } else {
        router.push("/tasks");
      }
    }

    setIsLoading(false);
  };

  return (
    <AuthLayout>
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
      </AuthFormWrapper>

      <LegalNotice />
    </AuthLayout>
  );
};

export default SignUpPage;
