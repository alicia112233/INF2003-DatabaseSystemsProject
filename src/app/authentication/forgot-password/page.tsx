/* eslint-disable react/no-unescaped-entities */
"use client";

import { Box, Card, Typography } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthForgotPassword from "../auth/AuthForgotPassword";

const gradientAnimation = {
  '@keyframes gradient': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
};

const ForgotPassword = () => (
  <PageContainer title="Forgot Password" description="Reset your password">
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        ...gradientAnimation,

        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
          backgroundSize: "400% 400%",
          animation: "gradient 15s ease infinite",
          opacity: 0.6,
          zIndex: 0,
        },
      }}
    >
      <Card
        elevation={9}
        sx={{
          p: 4,
          zIndex: 1,
          width: "100%",
          maxWidth: {
            xs: "350px",
            md: "500px",
            lg: "600px",
          },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
          <Logo />
        </Box>

        <AuthForgotPassword
          title={
            <Typography
              textAlign="center"
              sx={{ fontSize: "25px", fontWeight: 600 }}
            >
              Forgot Your Password?
            </Typography>
          }

          subtext={
            <Typography
              variant="subtitle1"
              textAlign="center"
              color="textSecondary"
              mb={3}
              sx={{
                fontSize: {
                  xs: '0.9rem',
                  sm: '1rem'
                }
              }}
            >
              Don't worry! Just enter your email address! <br />
              We'll send you instructions to reset your password.
            </Typography>
          }
        />
      </Card>
    </Box>
  </PageContainer>
);
export default ForgotPassword;