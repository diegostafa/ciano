import { useNavigation, useTheme } from "@react-navigation/native";
import React from "react";
import { KeyboardAvoidingView, TouchableNativeFeedback } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { Ctx, isIos } from "../../app";
import { Col, HeaderButton, ModalAlert, ThemedText } from "../../components";
import { Repo } from "../../data/repo";
import { loadThreads } from "../../data/utils";

export const CREATE_THREAD_KEY = 'CreateThread';

export const CreateThreadHeaderTitle = () => {
    const { state } = React.useContext(Ctx);
    return <Col>
        <TouchableNativeFeedback>
            <ThemedText content={`Create a thread in /${state.board}/`} />
        </TouchableNativeFeedback>
    </Col>;
};
export const CreateThreadHeaderRight = () => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const form = temp.createThreadForm;
    const sailor = useNavigation();
    const [needsConfirmation, setNeedsConfirmation] = React.useState(false);

    return <Col style={{
        overflow: 'hidden',
        borderRadius: config.borderRadius,
        marginRight: 5,
    }}>
        <HeaderButton
            enabled
            onPress={() => { setNeedsConfirmation(true); }}
            child={<ThemedText content={'Post'} />}
        />

        {needsConfirmation &&
            <ModalAlert
                msg={`You are about to post a thread in /${state.board}/\nThis can't be reversed`}
                left={'Cancel'}
                right={'Submit'}
                visible
                onClose={() => { setNeedsConfirmation(false); }}
                onPressLeft={() => { setNeedsConfirmation(false); }}
                onPressRight={async () => {
                    setTemp({ ...temp, creatingThread: true });
                    await Repo(state.api).threads.create(form);
                    await loadThreads(state, setState, null, true);
                    sailor.goBack();
                    setTemp({ ...temp, creatingThread: false });
                }}
            />
        }
    </Col>
};
export const CreateThread = () => {
    const { state, config } = React.useContext(Ctx);
    const [form, setForm] = React.useState({
        data: {
            board: state.board,
            alias: config.defaultName,
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
        fontSize: 16 * config.uiFontScale,
        paddingLeft: 10,
        paddingRight: 10,
        color: theme.colors.text
    };

    return <KeyboardAvoidingView behavior={isIos() ? 'padding' : 'height'} style={{ flex: 1 }} >
        <Col style={{ flex: 1 }}>
            {form.media &&
                <Col>
                    <ThemedText content={form.media} />
                </Col>
            }

            <Col style={outerStyle} >
                <Col style={{ padding: 10, }}>
                    <ThemedText content={'Name'} />
                </Col>
                <TextInput
                    value={form.data.alias || ''}
                    style={inputStyle}
                    placeholder='Name (Optional)'
                    onChangeText={(text) => setForm({ ...form, data: { ...form.data, alias: text } })}
                />
            </Col>
            <Col style={outerStyle} >
                <Col style={{ padding: 10, }}>
                    <ThemedText content={'Subject'} />
                </Col>
                <TextInput
                    value={form.data.sub || ''}
                    style={inputStyle}
                    placeholder='Subject'
                    multiline
                    onChangeText={(text) => setForm({ ...form, data: { ...form.data, sub: text } })}
                />
            </Col>
            <Col style={{
                ...outerStyle,
                flex: 1
            }} >
                <Col style={{ padding: 10, }}>
                    <ThemedText content={'Comment'} />
                </Col>
                <TextInput
                    placeholder="Comment"
                    value={form.data.com || ''}
                    style={{ ...inputStyle, flex: 1, borderWidth: 1, borderColor: 'red' }}
                    multiline
                    onChangeText={(text) => setForm({ ...form, data: { ...form.data, com: text } })}
                />
            </Col>
        </Col>
    </KeyboardAvoidingView>;
};
