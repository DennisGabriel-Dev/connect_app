import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DetalheProgramacaoScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Programação {id}</Text>
    </View>
  );
}