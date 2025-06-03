import { useNavigation, useTheme } from "@react-navigation/native";
import React from "react";
import { KeyboardAvoidingView, Platform, TouchableNativeFeedback, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { Ctx } from "../../app";
import { Repo } from "../../data/repo";
import { loadThreads } from "../../data/utils";
import { HeaderButton, ModalAlert, ThemedText } from "../../utils";

export const CREATE_THREAD_KEY = 'CreateThread';

export const CreateThreadHeaderTitle = () => {
    const { state } = React.useContext(Ctx);
    return <View>
        <TouchableNativeFeedback>
            <ThemedText content={`Create a thread in /${state.board}/`} />
        </TouchableNativeFeedback>
    </View>;
};
export const CreateThreadHeaderRight = () => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const form = temp.createThreadForm;
    const sailor = useNavigation();
    const [needsConfirmation, setNeedsConfirmation] = React.useState(false);

    return <View style={{
        overflow: 'hidden',
        borderRadius: config.borderRadius,
        marginRight: 5,
    }}>
        <HeaderButton
            enabled={true}
            onPress={() => { setNeedsConfirmation(true); }}
            child={<ThemedText content={'Post'} />}
        />

        {needsConfirmation &&
            <ModalAlert
                msg={`You are about to post a thread in /${state.board}/\nThis can't be reversed`}
                left={'Cancel'}
                right={'Submit'}
                visible={true}
                onClose={() => { setNeedsConfirmation(false); }}
                onPressLeft={() => { setNeedsConfirmation(false); }}
                onPressRight={async () => {
                    setTemp({ ...temp, creatingThread: true });
                    await Repo(config.api).threads.create(form);
                    await loadThreads(state, setState, null, true);
                    sailor.goBack();
                    setTemp({ ...temp, creatingThread: false });
                }}
            />
        }
    </View>
};
export const CreateThread = () => {
    const { state, config } = React.useContext(Ctx);
    const [form, setForm] = React.useState({
        data: {
            board: state.board,
            alias: config.alias,
            sub: null,
            com: null,
        },
        media: null,
    });
    const theme = useTheme();

    const outerStyle = {
        backgroundColor: theme.colors.card,
        borderBottomLeftRadius: config.borderRadius,
        borderBottomRightRadius: config.borderRadius,
        overflow: 'hidden',
        margin: 10,
    };
    const inputStyle = {
        backgroundColor: theme.colors.highlight,
        fontSize: 16,
        paddingLeft: 10,
        paddingRight: 10,
        color: theme.colors.text
    };

    return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} >
        <View style={{ flex: 1 }}>
            {form.media &&
                <View>
                    <ThemedText content={form.media} />
                </View>
            }

            <View style={outerStyle} >
                <View style={{ padding: 10, }}>
                    <ThemedText content={'Name'} />
                </View>
                <TextInput
                    value={form.data.alias || ''}
                    style={inputStyle}
                    placeholder='Name (Optional)'
                    onChangeText={(text) => setForm({ ...form, data: { ...form.data, alias: text } })}
                />
            </View>
            <View style={outerStyle} >
                <View style={{ padding: 10, }}>
                    <ThemedText content={'Subject'} />
                </View>
                <TextInput
                    value={form.data.sub || ''}
                    style={inputStyle}
                    placeholder='Subject'
                    multiline
                    onChangeText={(text) => setForm({ ...form, data: { ...form.data, sub: text } })}
                />
            </View>
            <View style={{
                ...outerStyle,
                flex: 1
            }} >
                <View style={{ padding: 10, }}>
                    <ThemedText content={'Comment'} />
                </View>
                <TextInput
                    placeholder="Comment"
                    value={form.data.com || ''}
                    style={{ ...inputStyle, flex: 1, borderWidth: 1, borderColor: 'red' }}
                    multiline
                    onChangeText={(text) => setForm({ ...form, data: { ...form.data, com: text } })}
                />
            </View>
        </View>
    </KeyboardAvoidingView>;
};
