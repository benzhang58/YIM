import { ReactNode } from "react";
import { SafeAreaView, ScrollView, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";

export function Screen({
  children,
  scroll = true,
  contentStyle
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
}) {
  if (!scroll) {
    return <SafeAreaView style={[styles.safeArea, contentStyle]}>{children}</SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, contentStyle]} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 18
  }
});
