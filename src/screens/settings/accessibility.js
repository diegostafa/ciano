/* eslint-disable react/react-in-jsx-scope */
import { ScrollView } from 'react-native';

import { ThemedText } from '../../components';

export const ACCESSIBILITY_KEY = 'Accessibility';

export const Accessibility = () => {
    return <ScrollView style={{ padding: 20, flex: 1 }}>
        <ThemedText content={'todo'} />
    </ScrollView>;
};
