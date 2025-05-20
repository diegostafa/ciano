/* eslint-disable react/react-in-jsx-scope */
import { View } from 'react-native';

import { ThemedText } from '../../utils';

export const ADVANCED_KEY = 'Advanced';

export const Advanced = () => {
    return <View style={{ padding: 20, flex: 1 }}>
        <ThemedText content={'todo'} />
    </View>;
};
