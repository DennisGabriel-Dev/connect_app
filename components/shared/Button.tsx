import { Colors } from '@/constants/theme';
import { StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
}

export default function Button({ title, onPress }: ButtonProps) {
  const theme = useColorScheme(); 
  const currentColors = Colors[theme ?? 'light']; 

  return (
    <TouchableOpacity style={[styles.button, {backgroundColor: currentColors.tint}]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});