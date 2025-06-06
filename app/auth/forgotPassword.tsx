import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  useColorScheme,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRequestReset, useResetPassword } from "@/hooks/usePassworrdReset";
import CustomButton from "@/components/ui/CustomButton";
import EmailModal from "@/components/auth/emailModal";
import TokenModal from "@/components/auth/tokenModal";
import NewPasswordModal from "@/components/auth/newPassword";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const ForgotPasswordFlow = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  const { mutate: requestReset, isPending: isRequesting } = useRequestReset();
  const {
    mutate: resetPassword,
    isPending: isResetting,
    isSuccess: isSucccess,
    isError: err,
  } = useResetPassword();

  const handleEmailSubmit = (emailInput: string) => {
    setEmail(emailInput);
    requestReset(emailInput, {
      onSuccess: () => {
        Alert.alert(
          "Success",
          "If your email is in our system, you will receive 6 digit code."
        );
        setTimeout(() => {
          setStep(2);
        }, 2000);
      },
      onError: () => {
        Alert.alert("Error", "Failed to send reset email. Try again.");
      },
    });
  };

  const handleTokenSubmit = (code: string) => {
    if (code.length === 6) {
      setToken(code);
      Alert.alert("Success", "Code accepted. Redirecting...");
      setTimeout(() => {
        setStep(3);
      }, 2000);
    } else {
      Alert.alert("Invalid Code", "Code must be 6 digits.");
    }
  };

  const handlePasswordSubmit = (
    password: string,
    password_confirmation: string
  ) => {
    if (password !== password_confirmation) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    console.log("Submitting password reset");
    console.log(token);
    resetPassword(
      { token, password, password_confirmation },

      {
        onSuccess: () => {
          Alert.alert("Success", "Password has been reset.", [
            { text: "Go to Login", onPress: () => router.push("/auth/signIn") },
          ]);
        },
        onError: (error: any) => {
          console.log("[Reset Error]", error?.response?.data);
          Alert.alert(
            "Error",
            error?.response?.data?.message || "Failed to reset password."
          );
        },
      }
    );
  };
 
  return (
    <ThemedView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={require("@/assets/images/SEPHCOCO LOUNGE 3.png")}
          style={styles.logo}
        />
      </View>
      <ThemedText
        type="subtitle"
        style={{ color: theme.text, textAlign: "center" }}
      >
        Welcome Back!!
      </ThemedText>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.heading, { color: theme.text }]}>
          Forgot your password?
        </Text>
        <Text style={[styles.subtext, { color: theme.gray }]}>
          Tap below to reset your account password.
        </Text>
        <CustomButton text="Reset Password" onPress={() => setStep(1)} />

        <EmailModal
          visible={step === 1}
          onClose={() => setStep(2)}
          onSubmit={handleEmailSubmit}
          loading={isRequesting}
        />

        <TokenModal
          visible={step === 2}
          onClose={() => setStep(3)}
          onSubmit={handleTokenSubmit}
          loading={false}
        />

        <NewPasswordModal
          visible={step === 3}
          onClose={() => router.push("/auth/signIn")}
          onSubmit={handlePasswordSubmit}
          loading={isResetting}
        />
      </View>
    </ThemedView>
  );
};

export default ForgotPasswordFlow;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: 30,
    gap: 20,
    paddingVertical: 60,
  },
  imageWrapper: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  logo: {
    height: 67,
    width: 64,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtext: {
    fontSize: 16,
    marginBottom: 24,
  },
});
