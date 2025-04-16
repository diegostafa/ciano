import React from 'react';
import { Button, Text, View } from 'react-native';
import { Ctx } from './app';
import { Prefs } from './data';

const Settings = () => {
    const { setState } = React.useContext(Ctx);

    return <View><Text>TODO: SETTINGS</Text>
        <Button title={'Clear settings'} onPress={async () => {
            const newState = await Prefs.clear();
            setState(newState);
        }} />
    </View>;
};

export { Settings };

