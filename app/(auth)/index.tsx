import { login, signup } from "@/api/auth";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { authState } from "@/storage/atom/auth.atom";
import { useAtomValue } from "jotai";
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from "react-native";

/**
 * Simple Auth screen for Expo (SDK ~55) in TypeScript + React Native.
 * - Toggle between Sign In and Sign Up
 * - Basic client-side validation
 * - Password visibility toggle
 * - Dummy handlers for email/password and social auth
 *
 * Save as: /Users/kevonporter/Desktop/outsiderstosociety/apps/REDNIT/rednit/app/index.tsx
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[a-z0-9._]+$/;

export default function AuthScreen() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const authenticated = useAtomValue(authState);

    const validate = (): string | null => {
        if (!email.trim() || !password.trim()) {
            return "Email and password are required.";
        }
        if (isSignUp && !USERNAME_REGEX.test(username)) {
            return "Please enter a valid username.";
        }
        if (!EMAIL_REGEX.test(email)) {
            return "Please enter a valid email address.";
        }
        if (password.length < 6) {
            return "Password must be at least 6 characters.";
        }
        if (isSignUp && password !== confirmPassword) {
            return "Passwords do not match.";
        }
        return null;
    };

    const handlePrimary = async () => {
        const error = validate();
        if (error) {
            Alert.alert("Validation", error);
            return;
        }
        setLoading(true);
        try {

            if (isSignUp) {
                // Example: call sign up API
                const res = await signup(username, email, password)
                Alert.alert("Success", "Authentication: " + authenticated);
                console.log("Sign Up:", res);
            } else {
                // Example: call sign in API
                const res = await login(email, password);
                Alert.alert("Success", "Authentication: " + authenticated);
                console.log("Sign In:", res);
            }
            // reset form or navigate away
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Something went wrong: " + err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.inner}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ThemedText type="title" style={{ alignSelf: 'center', marginBottom: 10 }}>Red<ThemedText>Nit</ThemedText></ThemedText>

                <ThemedView style={styles.form}>
                    {isSignUp && <>
                        <ThemedText style={styles.label}>Username</ThemedText>
                        <ThemedTextInput
                            keyboardType="name-phone-pad"
                            autoCapitalize="none"
                            placeholder="realkevonporter"
                            value={username}
                            onChangeText={setUsername}
                            style={styles.input}
                            textContentType="username"
                            importantForAutofill="yes"
                        />
                    </>}
                    <ThemedText style={styles.label}>Email</ThemedText>
                    <ThemedTextInput
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        textContentType="emailAddress"
                        importantForAutofill="yes"
                    />

                    <ThemedText style={styles.label}>Password</ThemedText>
                    <ThemedView style={[styles.passwordRow, styles.input,]}>
                        <ThemedTextInput
                            placeholder="Enter password"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            style={[{ flex: 1 }]}
                            textContentType="password"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword((s) => !s)}
                            style={styles.toggleBtn}
                        >
                            <Text style={styles.toggleText}>{showPassword ? "Hide" : "Show"}</Text>
                        </TouchableOpacity>
                    </ThemedView>

                    {isSignUp && (
                        <>
                            <ThemedText style={styles.label}>Confirm Password</ThemedText>
                            <ThemedTextInput
                                placeholder="Confirm password"
                                secureTextEntry={!showPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                style={styles.input}
                                textContentType="password"
                                autoCapitalize="none"
                            />
                        </>
                    )}

                    <TouchableOpacity
                        style={[styles.primaryBtn, loading && styles.disabledBtn]}
                        onPress={handlePrimary}
                        disabled={loading}
                        testID="primaryAuthButton"
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <ThemedText lightColor="#f7f7f7" style={styles.primaryText}>
                                {isSignUp ? "Create Account" : "Sign In"}
                            </ThemedText>
                        )}
                    </TouchableOpacity>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchText}>
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}
                        </Text>
                        <TouchableOpacity onPress={() => setIsSignUp((s) => !s)}>
                            <ThemedText style={styles.switchBtn}>{isSignUp ? "Sign In" : "Sign Up"}</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>rednit LLC</Text>
                        <View style={styles.divider} />
                    </View>

                </ThemedView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const PADDING = 20;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inner: {
        flex: 1,
        padding: PADDING,
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 18,
        textAlign: "center",
        color: "#111",
    },
    form: {
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    label: {
        fontSize: 13,
        color: "#666",
        marginBottom: 6,
        marginTop: 10,
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: "#e6e9ef",
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    passwordRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    toggleBtn: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    toggleText: {
        color: "#000",
        fontWeight: "600",
    },
    primaryBtn: {
        marginTop: 16,
        backgroundColor: "#000",
        height: 48,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    disabledBtn: {
        opacity: 0.7,
    },
    primaryText: {
        fontWeight: "700",
        fontSize: 16,
    },
    switchRow: {
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    switchText: {
        color: "#666",
        marginRight: 6,
    },
    switchBtn: {
        fontWeight: "700",
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 18,
        marginBottom: 12,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#eef2f6",
    },
    dividerText: {
        marginHorizontal: 10,
        color: "#9aa4b2",
    },
    socialRow: {
        marginTop: 6,
    },
    socialBtn: {
        height: 44,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e6e9ef",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        backgroundColor: "#fff",
    },
    socialText: {
        color: "#111",
        fontWeight: "600",
    },
});