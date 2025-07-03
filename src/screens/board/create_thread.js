import { useNavigation, useTheme } from '@react-navigation/native';
import { filesize } from 'filesize';
import React from 'react';
import { Image, KeyboardAvoidingView, TouchableHighlight } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import ImageCropPicker from 'react-native-image-crop-picker';

import { Ctx, HEADER_HEIGHT, IS_IOS } from '../../app';
import { Col, HeaderButton, HeaderThemedText, ModalAlert, ModalLocalMediaPreview, Row, ThemedButton, ThemedIcon, ThemedText } from '../../components';
import { setStateAndSave } from '../../context/state';
import { hasFormErrors } from '../../context/temp';
import { uploadThread } from '../../data/utils';
import { getCurrFullBoard } from '../../helpers';

export const CREATE_THREAD_KEY = 'CreateThread';

export const CreateThreadHeaderTitle = () => {
    const { state } = React.useContext(Ctx);
    return <Col>
        <ThemedButton>
            <HeaderThemedText content={`Create a thread in /${state.board}/`} />
        </ThemedButton>
    </Col>;
};
export const CreateThreadHeaderRight = () => {
    const { state, setState, temp, setTemp, config } = React.useContext(Ctx);
    const form = temp.createThreadForm;
    const sailor = useNavigation();
    const theme = useTheme();
    const [needsConfirmation, setNeedsConfirmation] = React.useState(false);

    return <Col style={{
        overflow: 'hidden',
        borderRadius: config.borderRadius,
        marginRight: 5,
    }}>
        <HeaderButton
            enabled={!hasFormErrors(temp)}
            onPress={() => { setNeedsConfirmation(true); }}
            child={<ThemedText content={'Post'} style={{ color: theme.colors.primaryInverted }} />}
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
                    setNeedsConfirmation(false);
                    const thread = await uploadThread(state, setState, setTemp, form);
                    if (thread && config.autoWatchThreadsCreated) {
                        if (!state.watching.some(item => item.thread.id === thread.id)) {
                            await setStateAndSave(setState, 'watching', [...state.watching, {
                                thread,
                                new: 0,
                                you: 0
                            }]);
                        }
                    }
                    sailor.goBack();
                }}
            />
        }
    </Col>
};
export const CreateThread = () => {
    const { state, config, temp, setTemp } = React.useContext(Ctx);
    const [once, setOnce] = React.useState(true);
    const theme = useTheme();
    const [form, setForm] = React.useState({
        data: {
            board: state.board,
            alias: config.defaultName,
            sub: null,
            com: null,
        },
        media: null,
    });
    const outerStyle = {
        backgroundColor: theme.colors.card,
        borderBottomLeftRadius: config.borderRadius,
        borderBottomRightRadius: config.borderRadius,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden'
    };
    const inputStyle = {
        backgroundColor: theme.colors.background,
        fontSize: 16 * config.uiFontScale,
        paddingLeft: 10,
        paddingRight: 10,
        color: theme.colors.text
    };
    const labelStyle = {
        padding: 10,
    };
    const laberTextStyle = {
        fontWeight: 'bold'
    };

    React.useEffect(() => {
        if (once) {
            setTemp(prev => ({
                ...prev,
                formMediaError: null,
                formNameError: null,
                formSubError: null,
                formComError: null,
            }));
            setOnce(false);
        }
    }, [once, setTemp]);

    return <KeyboardAvoidingView
        behavior={IS_IOS ? 'padding' : 'height'}
        keyboardVerticalOffset={HEADER_HEIGHT}
        style={{ flex: 1 }}>
        <ModalLocalMediaPreview />
        <Col style={{ flex: 1, gap: 10, padding: 10, backgroundColor: theme.colors.card }}>
            <Col style={outerStyle} >
                <Row style={labelStyle}>
                    {temp.formSubError !== null && <ThemedIcon err size={20} name={"alert"} />}
                    <ThemedText style={laberTextStyle} content={'Name'} />
                </Row>
                <TextInput
                    value={form.data.alias || ''}
                    style={temp.formNameError === null ? inputStyle : { ...inputStyle, borderColor: theme.colors.err }}
                    placeholder='(Optional)'
                    onChangeText={(text) => setForm(prev => ({ ...prev, data: { ...prev.data, alias: text } }))}
                />
            </Col>

            {form.media &&
                <Col style={outerStyle}>
                    <Col>
                        <Row style={{ ...labelStyle, justifyContent: 'space-between', alignItems: 'center' }}>
                            <Row style={{ alignItems: 'center' }}>
                                {temp.formMediaError !== null && <ThemedIcon err size={20} name={"alert"} />}
                                <ThemedText style={laberTextStyle} content={'Attached file'} />
                            </Row>
                            <Col style={{ position: 'absolute', top: 1, right: 1, backgroundColor: theme.colors.danger, overflow: 'hidden' }}>
                                <ThemedButton onPress={() => {
                                    setTemp(prev => ({ ...prev, formMediaError: null }));
                                    setForm(prev => ({ ...prev, media: null }));
                                }}>
                                    <Col style={{ padding: 10 }}>
                                        <ThemedText style={{ fontWeight: 'bold' }} content={"Remove"} />
                                    </Col>
                                </ThemedButton>
                            </Col>
                        </Row>
                        <Row style={{ backgroundColor: theme.colors.background, padding: 10, gap: 10, alignItems: 'center' }}>
                            <TouchableHighlight onPress={() => {
                                setTemp(prev => ({ ...prev, selectedLocalMedia: form.media }));
                            }}>
                                <Col>
                                    <Image src={form.media.path} resizeMode='contain' style={{ width: 100, height: 100, borderRadius: config.borderRadius, }} />
                                </Col>
                            </TouchableHighlight>
                            <Col style={{ flex: 1, justifyContent: 'space-between' }}>
                                <Col>
                                    <ThemedText content={`Name: ${form.media.path.split('/').pop()}`} />
                                    {temp.formMediaError !== null ?
                                        <ThemedText style={{ color: theme.colors.err }} content={`Size: ${filesize(form.media.size)}\n(${temp.formMediaError})`} /> :
                                        <ThemedText content={`Size: ${filesize(form.media.size)}`} />
                                    }
                                    <ThemedText content={`Type: ${form.media.mime}`} />
                                </Col>
                            </Col>
                        </Row>
                    </Col>
                </Col>
            }
            <Row style={{ alignItems: 'center', gap: 10 }}>
                <Col style={{ ...outerStyle, borderBottomRightRadius: form.media === null ? 0 : config.borderRadius, flex: 1, }} >
                    <Row style={labelStyle}>
                        {temp.formSubError !== null && <ThemedIcon err size={20} name={"alert"} />}
                        <ThemedText style={laberTextStyle} content={'Subject'} />
                    </Row>
                    <TextInput
                        value={form.data.sub || ''}
                        style={temp.formSubError === null ? inputStyle : { ...inputStyle, borderColor: theme.colors.err }}
                        placeholder='Subject'
                        onChangeText={(text) => setForm(prev => ({ ...prev, data: { ...prev.data, sub: text } }))}
                    />
                </Col>
                {form.media === null &&
                    <Col style={{ ...outerStyle, borderBottomLeftRadius: 0, borderBottomRightRadius: config.borderRadius, overflow: 'hidden' }}>
                        <ThemedButton onPress={() => {
                            ImageCropPicker.openPicker({
                                mediaType: 'any',
                                multiple: false
                            }).then((media) => {
                                const fsize = media.size;
                                const maxSize = getCurrFullBoard(state).max_file_size;
                                if (fsize > maxSize) {
                                    setTemp(prev => ({ ...prev, formMediaError: `File is too big, max is ${filesize(maxSize)}` }));
                                }
                                setForm(prev => ({ ...prev, media }));
                            });
                        }}>
                            <Col style={{ width: 50, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <ThemedIcon name={"attach"} size={32} />
                            </Col>
                        </ThemedButton>
                    </Col>
                }
            </Row>

            <Col style={outerStyle} >
                <Row style={labelStyle}>
                    {temp.formComError !== null && <ThemedIcon err size={20} name={"alert"} />}
                    <ThemedText style={laberTextStyle} content={'Comment'} />
                </Row>
                <TextInput
                    placeholder='Comment'
                    value={form.data.com || ''}
                    style={temp.formComError === null ? inputStyle : { ...inputStyle, borderColor: theme.colors.err }}
                    multiline
                    onChangeText={(text) => setForm(prev => ({ ...prev, data: { ...prev.data, com: text } }))}
                />
            </Col>
        </Col >
    </KeyboardAvoidingView >;
};
