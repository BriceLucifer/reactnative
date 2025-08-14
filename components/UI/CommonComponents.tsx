/**
 * @fileoverview Common UI components bundled together for simplicity
 * 
 * This file contains smaller, commonly used UI components that don't warrant
 * separate files. They are grouped here for better maintainability.
 */

import React, { Component, ReactNode } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '@/types';

// ===== LOADING SPINNER =====

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  style?: ViewStyle;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.PRIMARY,
  text,
  style,
  overlay = false,
}) => {
  const containerStyle = [
    styles.spinnerContainer,
    overlay && styles.overlay,
    style,
  ];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.spinnerText}>{text}</Text>}
    </View>
  );
};

// ===== BUTTON COMPONENT =====

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const buttonStyle = [
    styles.buttonBase,
    styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
    disabled && styles.textDisabled,
    textStyle,
  ];

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const renderContent = () => (
    <>
      {loading && <ActivityIndicator size="small" color={getLoadingColor(variant)} style={styles.loader} />}
      <Text style={textStyles}>{loading ? 'Loading...' : title}</Text>
    </>
  );

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[buttonStyle, { padding: 0 }]}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
      >
        <LinearGradient
          colors={['#4A4849', '#292927']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.gradient, styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={buttonStyle}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// ===== ERROR BOUNDARY =====

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.retry);
      }

      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>
            We encountered an unexpected error. Please try again.
          </Text>
          
          <Button
            title="Try Again"
            onPress={this.retry}
            variant="primary"
            style={styles.retryButton}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

// ===== MODAL WRAPPER =====

interface ModalWrapperProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  animationType?: 'slide' | 'fade' | 'none';
  transparent?: boolean;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  visible,
  onClose,
  children,
  animationType = 'slide',
  transparent = true,
}) => {
  return (
    <Modal
      visible={visible}
      animationType={animationType}
      transparent={transparent}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackground} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ===== HELPER FUNCTIONS =====

function getLoadingColor(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
      return COLORS.WHITE;
    case 'secondary':
      return COLORS.PRIMARY;
    case 'danger':
      return COLORS.WHITE;
    case 'ghost':
      return COLORS.PRIMARY;
    default:
      return COLORS.WHITE;
  }
}

// ===== STYLES =====

const styles = StyleSheet.create({
  // Loading Spinner
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.LG,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  spinnerText: {
    marginTop: SPACING.MD,
    fontSize: 16,
    color: COLORS.SECONDARY,
    textAlign: 'center',
  },

  // Button
  buttonBase: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSmall: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    minHeight: 36,
  },
  buttonMedium: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    minHeight: 44,
  },
  buttonLarge: {
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.LG,
    minHeight: 52,
  },
  buttonPrimary: {
    backgroundColor: COLORS.PRIMARY,
  },
  buttonSecondary: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  buttonDanger: {
    backgroundColor: COLORS.ERROR,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textPrimary: {
    color: COLORS.WHITE,
  },
  textSecondary: {
    color: COLORS.PRIMARY,
  },
  textDanger: {
    color: COLORS.WHITE,
  },
  textGhost: {
    color: COLORS.PRIMARY,
  },
  textDisabled: {
    opacity: 0.7,
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  gradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 12,
  },
  loader: {
    marginRight: SPACING.SM,
  },

  // Error Boundary
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
    backgroundColor: COLORS.WHITE,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.MD,
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.XL,
  },
  retryButton: {
    minWidth: 120,
  },

  // Modal
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});