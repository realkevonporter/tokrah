import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";

type ZodiacSign =
  | "Capricorn"
  | "Aquarius"
  | "Pisces"
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius";

function getZodiacSign(date: Date): ZodiacSign {
  const day = date.getDate();
  const month = date.getMonth() + 1; // JS months are 0-based

  if ((month === 1 && day <= 19) || (month === 12 && day >= 22)) {
    return "Capricorn";
  }
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return "Aquarius";
  }
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return "Pisces";
  }
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return "Aries";
  }
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return "Taurus";
  }
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return "Gemini";
  }
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return "Cancer";
  }
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return "Leo";
  }
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return "Virgo";
  }
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return "Libra";
  }
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return "Scorpio";
  }
  return "Sagittarius";
}

type Props = {
  birthday: Date | string;
};

export default function ZodiacSign({ birthday }: Props) {
  const sign = useMemo(() => {
    const date = typeof birthday === "string" ? new Date(birthday) : birthday;
    return getZodiacSign(date);
  }, [birthday]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Zodiac Sign</Text>
      <Text style={styles.value}>{sign}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#111",
    alignItems: "center",
  },
  label: {
    color: "#888",
    fontSize: 12,
  },
  value: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },
});