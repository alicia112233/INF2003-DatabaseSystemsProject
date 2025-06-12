"use client";

import { Box, Card, Typography } from "@mui/material";
import { Suspense } from "react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthResetPassword from "../auth/AuthResetPassword";

const gradientAnimation = {
    '@keyframes gradient': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' },
    },
};

const ResetPasswordContent = () => (
    <PageContainer title="Reset Password" description="Create a new password">
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
                <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                    <Logo />
                </Box>

                <AuthResetPassword
                    title={
                        <Typography
                            textAlign="center"
                            sx={{ fontSize: "25px", fontWeight: 600 }}
                        >
                            Reset Your Password Here
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
                            Enter your new password below. ↓
                        </Typography>
                    }
                />
            </Card>
        </Box>
    </PageContainer>
);

const ResetPassword = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordContent />
    </Suspense>
);

export default ResetPassword;