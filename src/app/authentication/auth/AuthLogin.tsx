import React, { useState } from "react";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Link from "next/link";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface loginType {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Check if the email is an admin email
      const isAdmin = email.endsWith('@admin.com');
      
      // Store user info and role in cookies (more secure than localStorage)
      document.cookie = `isLoggedIn=true; path=/; max-age=86400`;
      document.cookie = `userEmail=${email}; path=/; max-age=86400`;
      document.cookie = `userRole=${isAdmin ? 'admin' : 'customer'}; path=/; max-age=86400`;
      
      // Also keep localStorage for backward compatibility
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem('userRole', isAdmin ? 'admin' : 'customer');
      
      // Show success toast
      setToastSeverity("success");
      setToastMessage("Login successful! Redirecting...");
      setOpenToast(true);
      
      // Redirect after a short delay to the appropriate dashboard
      setTimeout(() => {
        if (isAdmin) {
          window.location.href = "/admin-dashboard"; // Use direct navigation instead of router
        } else {
          window.location.href = "/"; // Use direct navigation instead of router
        }
      }, 1000);
    } catch (err) {
      setToastSeverity("error");
      setToastMessage(err instanceof Error ? err.message : "Login failed");
      setOpenToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseToast = () => {
    setOpenToast(false);
  };

  React.useEffect(() => {
    console.log("Auth state on load:", {
      isLoggedIn: localStorage.getItem("isLoggedIn"),
      userEmail: localStorage.getItem("userEmail"),
      userRole: localStorage.getItem("userRole"),
    });
    
    // Check if we should already be logged in
    if (localStorage.getItem("isLoggedIn") === "true") {
      const userRole = localStorage.getItem("userRole");
      console.log("User already logged in, should redirect to:", userRole === "admin" ? "/admin-dashboard" : "/");
    }
  }, []);

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <form onSubmit={handleSubmit}>
        <Stack>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="email"
              mb="5px"
            >
              Email
            </Typography>
            <CustomTextField 
              variant="outlined" 
              fullWidth 
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              type="email"
              required
            />
          </Box>

          <Box mt="25px">
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
            >
              Password
            </Typography>
            <CustomTextField 
              type={showPassword ? "text" : "password"} 
              variant="outlined" 
              fullWidth 
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
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
          
          <Stack
            justifyContent={{ xs: "flex-start", sm: "space-between" }}
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            my={2}
            spacing={{ xs: 1, sm: 0 }}
          >
            <FormGroup>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Remember Me"
              />
            </FormGroup>

            <Typography
              component={Link}
              href="/authentication/forgot-password"
              fontWeight="500"
              sx={{
                display: { xs: "block", sm: "inline" },
                textAlign: { xs: "center", sm: "left" },
                textDecoration: "none",
                color: "primary.main",
                mt: { xs: 1, sm: 0 }
              }}
            >
              Forgot Password?
            </Typography>
          </Stack>
        </Stack>

        <Box>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </Box>
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

export default AuthLogin;