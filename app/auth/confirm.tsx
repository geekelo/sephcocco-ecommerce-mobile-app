import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "@/components/ui/CustomButton";
import { useLocalSearchParams, router } from "expo-router";
import {
  useCheckEmailConfirmation,
  useConfirmEmailToken,
  useRequestEmailConfirmationToken,
} from "@/mutation/useEmail";
import { Colors } from "@/constants/Colors";

const { width, height } = Dimensions.get("window");

export default function ConfirmEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [token, setToken] = useState("");
  const [countdown, setCountdown] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  console.log(email);

  const { mutate: confirmEmail, isPending, data: confirm, error} = useConfirmEmailToken();
  const {
    mutate: resendToken,
    isPending: isResending,
    data: req,
  } = useRequestEmailConfirmationToken();
const { mutate: checkConfirmation, isPending: checking, data: status } = useCheckEmailConfirmation();
  console.log('confirm',confirm);
  console.log(req);
  console.log(error)

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleConfirm = () => {
    if (!token.trim()) {
      Alert.alert("Missing Token", "Please enter your confirmation token");
      return;
    }

    confirmEmail(
      { email, token: token.trim() },
      {
        onSuccess: () => {
          Alert.alert(
            "Success",
            "Email confirmed successfully! You can now sign in.",
            [
              {
                text: "Continue to Sign In",
                onPress: () => router.replace("/auth/signIn"),
              },
            ]
          );
        },
        onError: (error: any) => {
          Alert.alert(
            "Confirmation Failed",
            error?.response?.data?.message || 
            "Invalid or expired confirmation token. Please check your email or request a new token."
          );
        },
      }
    );
  };

  const handleResend = () => {
    resendToken(email, {
      onSuccess: () => {
        setCountdown(60); // 60 second cooldown
        Alert.alert(
          "Token Sent",
          "A new confirmation token has been sent to your email. Please check your inbox and spam folder."
        );
      },
      onError: (error: any) => {
        Alert.alert(
          "Resend Failed",
          error?.response?.data?.message || 
          "Failed to resend confirmation token. Please try again later."
        );
      },
    });
  };

  const formatEmail = (email: string) => {
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 3) return email;
    const maskedLocal = localPart[0] + "*".repeat(localPart.length - 2) + localPart.slice(-1);
    return `${maskedLocal}@${domain}`;
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail" size={32} color="#4F46E5" />
              </View>
              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}>
                We've sent a confirmation code to
              </Text>
              <Text style={styles.emailText}>{formatEmail(email)}</Text>
            </View>

            {/* Token Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmation Code</Text>
              <View style={styles.tokenInputWrapper}>
                <TextInput
                  placeholder="Enter 6-digit code"
                  value={token}
                  onChangeText={(text) => setToken(text.replace(/[^0-9]/g, ""))}
                  style={styles.tokenInput}
                  keyboardType="numeric"
                  maxLength={6}
                  autoCapitalize="none"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <Text style={styles.helperText}>
                Enter the 6-digit code from your email
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <CustomButton
                text={isPending ? "Verifying..." : "Verify Email"}
                onPress={handleConfirm}
                disabled={isPending || !token || token.length < 6}
                style={[
                  styles.confirmButton,
                  (!token || token.length < 6) && styles.buttonDisabled,
                ]}
              />

              <TouchableOpacity
                onPress={handleResend}
                disabled={isResending || countdown > 0}
                style={[
                  styles.resendButton,
                  (isResending || countdown > 0) && styles.resendButtonDisabled,
                ]}
              >
                <Ionicons
                  name="refresh"
                  size={16}
                  color={isResending || countdown > 0 ? "#9CA3AF" : "#4F46E5"}
                  style={styles.resendIcon}
                />
                <Text
                  style={[
                    styles.resendText,
                    (isResending || countdown > 0) && styles.resendTextDisabled,
                  ]}
                >
                  {isResending
                    ? "Sending..."
                    : countdown > 0
                    ? `Resend in ${countdown}s`
                    : "Resend Code"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Help Section */}
            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>Didn't receive the code?</Text>
              <View style={styles.helpList}>
                <Text style={styles.helpItem}>• Check your spam/junk folder</Text>
                <Text style={styles.helpItem}>• Make sure {email} is correct</Text>
                <Text style={styles.helpItem}>• Wait a few minutes for delivery</Text>
                <Text style={styles.helpItem}>• Try resending the code</Text>
              </View>
            </View>

            {/* Back to Sign In */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={18} color={Colors.light.gray} />
              <Text style={styles.backText}>Back to Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.light.pink,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.gray,
    textAlign: "center",
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.orange,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light["black-01"],
    marginBottom: 8,
  },
  tokenInputWrapper: {
    backgroundColor: Colors.light["gray-200"],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
  },
  tokenInput: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.light.text,
    paddingVertical: 16,
    letterSpacing: 4,
    textAlign: "center",
  },
  helperText: {
    fontSize: 14,
    color: Colors.light.gray,
    marginTop: 8,
    textAlign: "center",
  },
  buttonContainer: {
    marginBottom: 32,
  },
  confirmButton: {
    marginBottom: 16,
    backgroundColor: Colors.light.orange,
    borderRadius: 12,
    shadowColor: Colors.light.orange,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: Colors.light["gray-200"],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendIcon: {
    marginRight: 8,
  },
  resendText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.orange,
  },
  resendTextDisabled: {
    color: Colors.light["gray-500"],
  },
  helpSection: {
    backgroundColor: Colors.light.pink,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light["black-01"],
    marginBottom: 12,
  },
  helpList: {
    gap: 4,
  },
  helpItem: {
    fontSize: 14,
    color: Colors.light.gray,
    lineHeight: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  backText: {
    fontSize: 16,
    color: Colors.light.gray,
    marginLeft: 8,
    fontWeight: "500",
  },
});