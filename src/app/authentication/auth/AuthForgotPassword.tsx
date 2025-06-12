import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import Link from "next/link";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";

interface ForgotPasswordType {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthForgotPassword = ({ title, subtitle, subtext }: ForgotPasswordType) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      // Show success toast
      setToastSeverity("success");
      setToastMessage("Password reset instructions have been sent, please check console!");
      setOpenToast(true);
      
      // Clear the email field
      setEmail("");
      
    } catch (err) {
      setToastSeverity("error");
      setToastMessage(err instanceof Error ? err.message : "Failed to send reset email");
      setOpenToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseToast = () => {
    setOpenToast(false);
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="email"
              mb="5px"
            >
              Email Address
              <Typography
                component="span"
                color="red"
                display="inline"
              >
                *
              </Typography>
            </Typography>

            <CustomTextField 
              variant="outlined" 
              fullWidth 
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="Enter your email address"
            />
          </Box>

          <Box>
            <Button
              color="primary"
              variant="contained"
              size="large"
              fullWidth
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </Box>

          <Box textAlign="center">
            <Typography
              component={Link}
              href="/authentication/login"
              fontWeight="500"
              sx={{
                textDecoration: "none",
                color: "primary.main",
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              ← Back to Login
            </Typography>
          </Box>
        </Stack>
      </form>

      {subtitle}

      <Snackbar 
        open={openToast} 
        autoHideDuration={6000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toastSeverity} 
          sx={{ width: '100%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AuthForgotPassword;