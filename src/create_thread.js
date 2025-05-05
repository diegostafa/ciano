import React from "react";
import { Button, TouchableNativeFeedback, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { ThemedText } from "./utils";

export const CreateThreadHeaderLeft = () => {
    return <View />;
};
export const CreateThreadHeaderTitle = () => {
    return <View>
        <TouchableNativeFeedback>
            <ThemedText content={`Create a new thread`} />
        </TouchableNativeFeedback>
    </View>;
};
export const CreateThreadHeaderRight = () => {
    return <View />
};
export const CreateThread = () => {
    const [form, setForm] = React.useState({});
    const [media] = React.useState(null);

    return <View style={{ flex: 1 }}>
        <View>
            <TextInput onChangeText={text => setForm({ ...form, alias: text })} />
            <TextInput onChangeText={text => setForm({ ...form, sub: text })} />
            <TextInput onChangeText={text => setForm({ ...form, com: text })} />
        </View>

        <View>
            {media ?
                <ThemedText content={media} /> :
                <Button title={'Attach'} onPress={() => { }} />
            }
        </View>
    </View>;
};