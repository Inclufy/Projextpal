import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.button,
    styles[`button_${size}`],
    variant === 'outline' && styles.buttonOutline,
    variant === 'text' && styles.buttonText,
    (disabled || loading) && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.buttonTextBase,
    styles[`buttonText_${size}`],
    variant === 'outline' && styles.buttonTextOutline,
    variant === 'text' && styles.buttonTextSecondary,
    (disabled || loading) && styles.buttonTextDisabled,
    textStyle,
  ];

  const content = (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.white : COLORS.purple} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );

  if (variant === 'primary' && !disabled && !loading) {
    return (
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, styles[`button_${size}`], style]}
      >
        <TouchableOpacity
          onPress={onPress}
          style={styles.gradientButton}
          activeOpacity={0.8}
        >
          <Text style={textStyles}>{title}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (variant === 'secondary' && !disabled && !loading) {
    return (
      <LinearGradient
        colors={COLORS.secondaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, styles[`button_${size}`], style]}
      >
        <TouchableOpacity
          onPress={onPress}
          style={styles.gradientButton}
          activeOpacity={0.8}
        >
          <Text style={textStyles}>{title}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button_small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  button_medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  button_large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.purple,
  },
  buttonText: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray[300],
    borderColor: COLORS.gray[300],
  },
  gradientButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextBase: {
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonText_small: {
    fontSize: 14,
  },
  buttonText_medium: {
    fontSize: 16,
  },
  buttonText_large: {
    fontSize: 18,
  },
  buttonTextOutline: {
    color: COLORS.purple,
  },
  buttonTextSecondary: {
    color: COLORS.purple,
  },
  buttonTextDisabled: {
    color: COLORS.gray[500],
  },
});