/* eslint-disable react/react-in-jsx-scope */
import { View } from 'react-native';

import { ThemedText } from '../../components';

export const MEDIA_KEY = 'Media';

export const Media = () => {
    return <View style={{ padding: 20, flex: 1 }}>
        <ThemedText content={'todo'} />
    </View>;
};
