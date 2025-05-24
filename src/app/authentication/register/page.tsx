"use client";

import { Box, Card, Typography, Stack } from "@mui/material";
import Link from "next/link";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthRegister from "../auth/AuthRegister";

const gradientAnimation = {
  '@keyframes gradient': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
};

const Register = () => (
  <PageContainer title="Register" description="this is Register page">
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...gradientAnimation,

        "&:before": {
          content: '""',
          padding: 20,
          background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
          backgroundSize: "400% 400%",
          animation: "gradient 15s ease infinite",
          position: "absolute",
          height: "100%",
          width: "100%",
          opacity: "0.6",
          zIndex: 0,
        },
      }}
    >
      <Card
        elevation={9}
        sx={{ p: 4, zIndex: 1, width: "100%", maxWidth: { xs: "350px", md: "500px", lg: "500px" } }}
      >
        <Box display="flex" alignItems="center" justifyContent="center">
          <Logo />
        </Box>
        <AuthRegister
          subtext={
            <Typography
              variant="subtitle1"
              textAlign="center"
              color="textSecondary"
              mb={2}
            >
              Complete the form below to create a new account.
            </Typography>
          }
          subtitle={
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={1}
              mt={3}
            >
              <Typography
                color="textSecondary"
                fontSize="14px"
                fontWeight="400"
              >
                Already have an Account?
              </Typography>

              <Typography
                component={Link}
                href="/authentication/login"
                fontWeight="500"
                fontSize="16px"
                sx={{
                  textDecoration: "none",
                  color: "primary.main",
                }}
              >
                Sign In
              </Typography>
            </Stack>
          }
        />
      </Card>
    </Box>
  </PageContainer>
);

export default Register;