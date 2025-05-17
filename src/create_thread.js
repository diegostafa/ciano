import { useNavigation, useTheme } from "@react-navigation/native";
import React from "react";
import { TouchableNativeFeedback, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import ImageCropPicker from "react-native-image-crop-picker";

import { Ctx } from "./app";
import { Repo } from "./repo";
import { loadThreads } from "./state";
import { Fab, HeaderButton, ModalAlert, ThemedIcon, ThemedText } from "./utils";

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
    const theme = useTheme();

    return <View style={{
        overflow: 'hidden',
        borderRadius: config.borderRadius,
        marginRight: 5,
        backgroundColor: needsConfirmation ? 'gray' : theme.colors.primary
    }}>
        <HeaderButton
            isActive={!needsConfirmation}
            onPress={() => { setNeedsConfirmation(true); }}
            child={<ThemedText content={'Post'} />}
        />

        {needsConfirmation &&
            <ModalAlert
                msg={`You are about to post a thread in /${state.board}/\nThis can't be reversed`}
                left={'Cancel'}
                right={'Post'}
                visible={true}
                onClose={() => { setNeedsConfirmation(false); }}
                onPressLeft={() => { setNeedsConfirmation(false); }}
                onPressRight={async () => {
                    console.log(form);
                    setTemp({ ...temp, creatingThread: true });
                    await Repo.threads.create(form);
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

    return <View style={{ flex: 1 }}>
        <Fab onPress={() => { }} />
        {form.media && <View />}

        <View>
            <ThemedText content={'Subject'} />
            <TextInput
                value={form.data.alias || ''}
                style={{
                    backgroundColor: theme.colors.highlight,
                    fontSize: 16,
                    paddingLeft: 20,
                    color: theme.colors.text
                }}
                placeholder='Name (Optional)'
                onChangeText={(text) => setForm({ ...form, data: { ...form.data, alias: text } })}
            />
        </View>
        <View >
            <View style={{
                margin: 10,
                borderRadius: config.borderRadius,
                overflow: 'hidden',
            }}>
                <TextInput
                    value={form.data.alias || ''}
                    style={{
                        backgroundColor: theme.colors.highlight,
                        fontSize: 16,
                        paddingLeft: 20,
                        color: theme.colors.text
                    }}
                    placeholder='Name (Optional)'
                    onChangeText={(text) => setForm({ ...form, data: { ...form.data, alias: text } })}
                />
            </View>
            <View style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginRight: 10,
                marginBottom: 10,
                borderRadius: config.borderRadius,
                overflow: 'hidden',
            }}>
                <View style={{ justifyContent: 'flex-end' }}>
                    <TouchableNativeFeedback onPress={() => {
                        ImageCropPicker.openPicker({
                            mediaType: "video",
                        }).then((video) => {
                            // todo: validation
                            setForm({ ...form, media: video });
                            console.log(video);
                        });
                    }}>
                        <View style={{ padding: 10, backgroundColor: theme.colors.highlight }}>
                            <ThemedIcon name={'attach'} size={22} />
                        </View>
                    </TouchableNativeFeedback>

                </View>
                <TextInput
                    value={form.data.com || ''}
                    style={{
                        flex: 1,
                        padding: 5,
                        fontSize: 16,
                        color: theme.colors.text,
                        backgroundColor: theme.colors.highlight
                    }}
                    placeholder='Comment (max 2000 chars)'
                    multiline
                    onChangeText={(text) => setForm({ ...form, data: { ...form.data, com: text } })}
                />
            </View>
        </View>
    </View>;
};