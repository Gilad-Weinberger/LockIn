"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmail,
  signInWithGoogle,
  resetPassword,
} from "../../../lib/auth";
import { createUser, getUserData } from "@/lib/functions/userFunctions";

// Components
import AuthLayout from "../../../components/auth/AuthLayout";
import AuthFormWrapper from "../../../components/auth/AuthFormWrapper";
import AlertMessage from "../../../components/auth/AlertMessage";
import FormSignIn from "../../../components/auth/FormSignIn";
import FormPasswordReset from "../../../components/auth/FormPasswordReset";
import FormDivider from "../../../components/auth/FormDivider";
import ButtonGoogle from "../../../components/auth/ButtonGoogle";
import AuthNavLink from "../../../components/auth/AuthNavLink";

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const router = useRouter();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { user, error } = await signInWithEmail(
      formData.email,
      formData.password
    );

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

  const handleGoogleSignIn = async () => {
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

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setResetMessage("");

    const { error } = await resetPassword(resetEmail);

    if (error) {
      setError(error);
    } else {
      setResetMessage("Password reset email sent! Check your inbox.");
      setShowResetPassword(false);
      setResetEmail("");
    }
  };

  const handleForgotPassword = () => {
    setShowResetPassword(true);
    setError("");
  };

  const handleCancelReset = () => {
    setShowResetPassword(false);
    setResetEmail("");
    setError("");
  };

  const handleResetEmailChange = (e) => {
    setResetEmail(e.target.value);
  };

  return (
    <AuthLayout>
      <AuthFormWrapper>
        <AlertMessage message={error} type="error" />
        <AlertMessage message={resetMessage} type="success" />

        {!showResetPassword ? (
          <>
            <FormSignIn
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleEmailSignIn}
              isLoading={isLoading}
              onForgotPassword={handleForgotPassword}
            />

            <FormDivider />

            <ButtonGoogle onClick={handleGoogleSignIn} disabled={isLoading} />
          </>
        ) : (
          <FormPasswordReset
            resetEmail={resetEmail}
            onEmailChange={handleResetEmailChange}
            onSubmit={handlePasswordReset}
            onCancel={handleCancelReset}
            isLoading={isLoading}
          />
        )}

        <AuthNavLink
          text="Don't have an account?"
          linkText="Sign up"
          href="/auth/signup"
        />
      </AuthFormWrapper>
    </AuthLayout>
  );
};

export default SignInPage;
