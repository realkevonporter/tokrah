import { signOutUser } from "@/api/auth";
import { verifyReferral } from "@/api/referral";
import React, { useRef, useState, useEffect } from "react";
import {

View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
KeyboardAvoidingView,
Platform,
Alert,
NativeSyntheticEvent,
TextInputKeyPressEventData,
Pressable,
} from "react-native";

type Props = {
length?: number;
onVerify?: (code: string) => void;
onResend?: () => void;
};

export default function VerifyScreen({ length = 6, onVerify, onResend }: Props) {
const [digits, setDigits] = useState<string[]>(Array.from({ length }, () => ""));
const inputs = useRef<Array<TextInput | null>>([]);
const [active, setActive] = useState(0);
const [secondsLeft, setSecondsLeft] = useState(60);
const [isResending, setIsResending] = useState(false);

useEffect(() => {
    //inputs.current[0]?.focus();
}, []);

useEffect(() => {
    if (secondsLeft === 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
}, [secondsLeft]);

const handleChange = (text: string, idx: number) => {
    // Accept only digits, handle paste of multiple digits
    const clean = text.replace(/\D/g, "");
    if (!clean) {
        const newDigits = [...digits];
        newDigits[idx] = "";
        setDigits(newDigits);
        return;
    }

    // If pasted multiple digits, fill forward
    if (clean.length > 1) {
        const newDigits = [...digits];
        for (let i = 0; i < clean.length && idx + i < length; i++) {
            newDigits[idx + i] = clean[i];
        }
        setDigits(newDigits);
        const next = Math.min(length - 1, idx + clean.length);
        setActive(next);
        inputs.current[next]?.focus();
        return;
    }

    // Single digit
    const newDigits = [...digits];
    newDigits[idx] = clean;
    setDigits(newDigits);
    if (idx < length - 1) {
        setActive(idx + 1);
        inputs.current[idx + 1]?.focus();
    } else {
        inputs.current[idx]?.blur();
    }
};

const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, idx: number) => {
    if (e.nativeEvent.key === "Backspace") {
        if (digits[idx] === "") {
            if (idx > 0) {
                setActive(idx - 1);
                inputs.current[idx - 1]?.focus();
                const newDigits = [...digits];
                newDigits[idx - 1] = "";
                setDigits(newDigits);
            }
        } else {
            const newDigits = [...digits];
            newDigits[idx] = "";
            setDigits(newDigits);
        }
    }
};

const code = digits.join("");
const isComplete = digits.every((d) => d !== "");

const handleVerifyPress = () => {
    if (!isComplete) {
        Alert.alert("Incomplete code", "Please enter the full verification code.");
        return;
    }
    onVerify?.(code);
    // Example stub: replace with API call
    // Alert.alert("Verifying", `Code: ${code}`);
    verifyReferral(code);
};

const handleResend = async () => {
    if (secondsLeft > 0 || isResending) return;
    setIsResending(true);
    try {
        await (onResend ? onResend() : Promise.resolve());
        setSecondsLeft(60);
    } catch (err) {
        Alert.alert("Error", "Unable to resend code. Try again.");
    } finally {
        setIsResending(false);
    }
};

return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: "padding", android: undefined })}
    >
        <View style={styles.box}>
            <Text style={styles.title}>Verify your account</Text>
            <Text style={styles.subtitle}>Enter the {length}-digit code sent to your phone or email</Text>

            <View style={styles.row}>
                {Array.from({ length }).map((_, idx) => (
                    <TextInput
                        key={idx}
                        ref={(r:any) => (inputs.current[idx] = r)}
                        value={digits[idx]}
                        onChangeText={(text) => handleChange(text, idx)}
                        onKeyPress={(e) => handleKeyPress(e, idx)}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        maxLength={length === 1 ? 1 : 1}
                        style={[styles.input, active === idx && styles.inputActive]}
                        returnKeyType="done"
                        accessible
                        accessibilityLabel={`Digit ${idx + 1}`}
                        importantForAutofill="yes"
                    />
                ))}
            </View>

            <TouchableOpacity
                style={[styles.verifyButton, !isComplete && styles.verifyDisabled]}
                onPress={handleVerifyPress}
                disabled={!isComplete}
            >
                <Text style={styles.verifyText}>Verify</Text>
            </TouchableOpacity>

            <View style={styles.rowBetween}>
                <Text style={styles.smallText}>
                    Didn’t receive a code?
                </Text>
                <TouchableOpacity onPress={handleResend} disabled={secondsLeft > 0 || isResending}>
                    <Text style={[styles.resendText, (secondsLeft > 0 || isResending) && styles.resendDisabled]}>
                        {isResending ? "Resending..." : secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
                    </Text>
                </TouchableOpacity>
            </View>

            <Pressable onPress={signOutUser}>
                <Text>Sign Out</Text>
            </Pressable>
        </View>
    </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 24,
},
box: {
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
},
title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111",
},
subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 18,
},
row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
},
input: {
    width: 44,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    textAlign: "center",
    fontSize: 20,
    color: "#111",
    backgroundColor: "#fff",
},
inputActive: {
    borderColor: "#6366f1",
    shadowColor: "#6366f1",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
},
verifyButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
},
verifyDisabled: {
    backgroundColor: "#666",
},
verifyText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
},
rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
},
smallText: {
    color: "#777",
},
resendText: {
    color: "#000",
    fontWeight: "600",
},
resendDisabled: {
    color: "#999",
},
});