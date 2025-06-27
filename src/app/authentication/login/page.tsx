/* eslint-disable react/no-unescaped-entities */
"use client";

import { Box, Card, Typography, Stack } from "@mui/material";
import Link from "next/link";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthLogin from "../auth/AuthLogin";

const gradientAnimation = {
  '@keyframes gradient': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
};

const Login = () => (
  <PageContainer title="Login" description="This is the login page">
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
        <Box display="flex" alignItems="center" justifyContent="center">
          <Logo />
        </Box>

        <AuthLogin
          subtext={
            <Typography
              variant="subtitle1"
              textAlign="center"
              color="textSecondary"
              mb={1}
              sx={{
                fontSize: {
                  xs: '1rem',
                  sm: '1rem'
                }
              }}
            >
              Sign In to View and Purchase Personalized Games For You!
            </Typography>
          }
          subtitle={
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} mt={3}>
              <Typography
                color="textSecondary"
                fontSize="14px"
                fontWeight="400"
              >
                Don't have an account?
              </Typography>

              <Typography
                component={Link}
                href="/authentication/register"
                fontSize="16px"
                fontWeight="500"
                sx={{
                  textDecoration: "none",
                  color: "primary.main",
                }}
              >
                Sign Up
              </Typography>
            </Stack>
          }
        />
      </Card>
    </Box>
  </PageContainer>
);

export default Login;