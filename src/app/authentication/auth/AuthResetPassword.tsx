import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface ResetPasswordType {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthResetPassword = ({ title, subtitle, subtext }: ResetPasswordType) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      // If no token, show error and redirect
      setToastSeverity("error");
      setToastMessage("Invalid or missing reset token");
      setOpenToast(true);
      setTimeout(() => {
        window.location.href = "/authentication/forgot-password";
      }, 3000);
    }
  }, [searchParams]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setToastSeverity("error");
      setToastMessage("Passwords do not match");
      setOpenToast(true);
      return;
    }

    if (password.length < 6) {
      setToastSeverity("error");
      setToastMessage("Password must be at least 6 characters long");
      setOpenToast(true);
      return;
    }

    if (!token) {
      setToastSeverity("error");
      setToastMessage("Invalid reset token");
      setOpenToast(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      // Show success toast
      setToastSeverity("success");
      setToastMessage("Password reset successfully! Redirecting to login...");
      setOpenToast(true);
      
      // Clear form
      setPassword("");
      setConfirmPassword("");
      
      // Redirect to login after success
      setTimeout(() => {
        window.location.href = "/authentication/login";
      }, 2000);
      
    } catch (err) {
      setToastSeverity("error");
      setToastMessage(err instanceof Error ? err.message : "Failed to reset password");
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
      {title}

      {subtext}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
            >
              New Password
            </Typography>
            <CustomTextField 
              type={showPassword ? "text" : "password"} 
              variant="outlined" 
              fullWidth 
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              placeholder="Enter your new password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="confirmPassword"
              mb="5px"
            >
              Confirm New Password
            </Typography>
            <CustomTextField 
              type={showConfirmPassword ? "text" : "password"} 
              variant="outlined" 
              fullWidth 
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your new password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box>
            <Button
              color="primary"
              variant="contained"
              size="large"
              fullWidth
              type="submit"
              disabled={loading || !token}
            >
              {loading ? "Resetting..." : "Reset Password"}
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

export default AuthResetPassword;