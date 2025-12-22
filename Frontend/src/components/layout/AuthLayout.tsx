/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
import AnalyticsIcon from "@mui/icons-material/Analytics";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import GroupsIcon from "@mui/icons-material/Groups";
import SecurityIcon from "@mui/icons-material/Security";
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
    useMediaQuery,
    useTheme as useMuiTheme
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "../common/ui/ThemeToggle";
import { getBrandConfig } from "../../lib/utils/runtimeConfig";

type AuthLayoutProps = {
    children: React.ReactNode;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    const muiTheme = useMuiTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("lg"));
    const { t } = useTranslation("auth");

    // Brand configuration state with defaults
    const [brandName, setBrandName] = useState("SecureScribe");
    const [brandLogo, setBrandLogo] = useState("/images/logos/logo2.png");

    // Load brand configuration from runtime config
    useEffect(() => {
        try {
            const brandCfg = getBrandConfig();
            setBrandName(brandCfg.name);
            setBrandLogo(brandCfg.logo);
        } catch (error) {
            console.warn("Failed to load brand config, using defaults:", error);
        }
    }, []);

    const featureItems = [
        {
            icon: SecurityIcon,
            label: t("features.security", "Enterprise Security"),
        },
        {
            icon: FlashOnIcon,
            label: t("features.speed", "Lightning Fast"),
        },
        {
            icon: GroupsIcon,
            label: t("features.collaboration", "Team Collaboration"),
        },
        {
            icon: AnalyticsIcon,
            label: t("features.analytics", "Advanced Analytics"),
        },
    ];

    return (
        <Box
            sx={{
                display: "grid",
                minHeight: "100vh",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                alignItems: "center",
                justifyContent: "center",
                gap: "24px",
                overflow: "hidden",
                position: "relative",
                backgroundColor: "var(--bg-primary)",
            }}
        >
            {/* Brand Panel (visible on desktop) */}
            {!isMobile && (
                <Box
                    component="section"
                    aria-label="Brand intro"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        gap: "48px",
                        position: "relative",
                        overflow: "hidden",
                        backgroundColor: "var(--bg-secondary)",
                        padding: "48px 24px",
                    }}
                >
                    {/* Brand Logo */}
                    <Avatar
                        src={brandLogo}
                        alt={`${brandName} logo`}
                        sx={{
                            width: 120,
                            height: 120,
                            border: "4px solid var(--border-primary)",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                            position: "relative",
                            zIndex: 2,
                        }}
                    >
                        SS
                    </Avatar>

                    {/* Brand Text */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "24px",
                            maxWidth: "520px",
                            textAlign: "center",
                            position: "relative",
                            zIndex: 2,
                        }}
                    >
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                            {t(
                                "hero.title",
                                { brandName },
                            )}
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: "20px",
                                lineHeight: "1.6",
                                fontWeight: 500,
                                color: "var(--text-secondary)",
                            }}
                        >
                            {t("hero.subtitle", "Secure your data with confidence")}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                fontSize: "17px",
                                fontWeight: 400,
                                color: "var(--text-secondary)",
                            }}
                        >
                            {t(
                                "hero.description",
                                "The most secure and reliable platform for your digital needs"
                            )}
                        </Typography>
                    </Box>

                    {/* Features List */}
                    <Stack
                        spacing={2}
                        sx={{
                            marginTop: "40px",
                            width: "100%",
                            maxWidth: "420px",
                            position: "relative",
                            zIndex: 2,
                        }}
                    >
                        {featureItems.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "20px",
                                        fontSize: "16px",
                                        color: "var(--text-primary)",
                                        padding: "20px 24px",
                                        borderRadius: "16px",
                                        backgroundColor: "var(--bg-primary)",
                                        border: "1px solid var(--border-primary)",
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                                        position: "relative",
                                        overflow: "hidden",
                                    }}
                                >
                                    <IconComponent
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            color: "var(--color-primary)",
                                            flexShrink: 0,
                                        }}
                                    />
                                    <span>{feature.label}</span>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            )}

            {/* Theme Toggle */}
            <Box
                sx={{
                    position: "absolute",
                    bottom: "32px",
                    right: "32px",
                    zIndex: 1000,
                }}
            >
                <ThemeToggle />
            </Box>

            {/* Auth Card */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    minHeight: isMobile ? "auto" : "100vh",
                }}
            >
                <Card
                    sx={{
                        width: "100%",
                        maxWidth: "560px",
                        padding: "32px",
                        borderRadius: "20px",
                        boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            backgroundColor: "var(--color-primary)",
                        },
                    }}
                >
                    <CardContent sx={{ padding: 0 }}>{children}</CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default AuthLayout;
