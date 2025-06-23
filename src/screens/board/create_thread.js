import { useNavigation, useTheme } from '@react-navigation/native';
import { filesize } from 'filesize';
import React from 'react';
import { Image, KeyboardAvoidingView, TouchableHighlight, TouchableNativeFeedback, useWindowDimensions } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import ImageCropPicker from 'react-native-image-crop-picker';

import { Ctx, HEADER_HEIGHT, isIos } from '../../app';
import { Col, HeaderButton, HeaderThemedText, ModalAlert, ModalLocalMediaPreview, Row, ThemedIcon, ThemedText } from '../../components';
import { uploadThread } from '../../data/utils';
import { getCurrFullBoard } from '../../helpers';

export const CREATE_THREAD_KEY = 'CreateThread';

export const CreateThreadHeaderTitle = () => {
    const { state } = React.useContext(Ctx);
    return <Col>
        <TouchableNativeFeedback>
            <HeaderThemedText content={`Create a thread in /${state.board}/`} />
        </TouchableNativeFeedback>
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
            enabled
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
                    if (thread && config.autoWatchThreads) {
                        if (!state.watching.some(item => item.threadId === thread.id)) {
                            setState(prev => ({
                                ...prev, watching: [...prev.watching, {
                                    thread,
                                    last: temp.comments.length,
                                    new: 0,
                                    you: 0
                                }]
                            }))
                        }
                    }
                    sailor.goBack();
                }}
            />
        }
    </Col>
};
export const CreateThread = () => {
    const { state, config, setTemp } = React.useContext(Ctx);
    const { width } = useWindowDimensions();
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
    const [formMediaError, setFormMediaError] = React.useState(null);
    const [formNameError, setFormNameError] = React.useState(null);
    const [formComError, setFormComError] = React.useState(null);
    const [formSubError, setFormSubError] = React.useState(null);

    const outerStyle = {
        backgroundColor: theme.colors.card,
        borderBottomLeftRadius: config.borderRadius,
        borderBottomRightRadius: config.borderRadius,
        borderWidth: 1,
        borderColor: theme.colors.border,
    };
    const inputStyle = {
        backgroundColor: theme.colors.highlight,
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

    return <KeyboardAvoidingView
        behavior={isIos() ? 'padding' : 'height'}
        keyboardVerticalOffset={HEADER_HEIGHT}
        style={{ flex: 1 }}>
        <ModalLocalMediaPreview />
        <Col style={{ flex: 1, gap: 10, padding: 10 }}>
            <Col style={outerStyle} >
                <Row style={labelStyle}>
                    {formSubError !== null && <ThemedIcon err size={20} name={"alert"} />}
                    <ThemedText style={laberTextStyle} content={'Subject'} />
                </Row>
                <TextInput
                    value={form.data.alias || ''}
                    style={inputStyle}
                    placeholder='(Optional)'
                    onChangeText={(text) => setForm({ ...form, data: { ...form.data, alias: text } })}
                />
            </Col>

            {form.media &&
                <Col style={outerStyle}>
                    <Col>
                        <Row style={{ ...labelStyle, justifyContent: 'space-between', alignItems: 'center' }}>
                            <Row style={{ alignItems: 'center' }}>
                                {formMediaError !== null && <ThemedIcon err size={20} name={"alert"} />}
                                <ThemedText style={laberTextStyle} content={'Attached file'} />
                            </Row>
                            <Col style={{ position: 'absolute', top: 1, right: 1, backgroundColor: theme.colors.danger, overflow: 'hidden' }}>
                                <TouchableNativeFeedback onPress={() => { setForm({ ...form, media: null }); }}>
                                    <Col style={{ padding: 10 }}>
                                        <ThemedText style={{ fontWeight: 'bold' }} content={"Remove"} />
                                    </Col>
                                </TouchableNativeFeedback>
                            </Col>
                        </Row>
                        <Row style={{ backgroundColor: theme.colors.highlight, padding: 10, gap: 10, alignItems: 'center' }}>
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
                                    {formMediaError !== null ?
                                        <ThemedText style={{ color: theme.colors.err }} content={`Size: ${filesize(form.media.size)}\n(${formMediaError})`} /> :
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
                <Col style={{ ...outerStyle, flex: 1, }} >
                    <Row style={labelStyle}>
                        {formSubError !== null && <ThemedIcon err size={20} name={"alert"} />}
                        <ThemedText style={laberTextStyle} content={'Subject'} />
                    </Row>
                    <TextInput
                        value={form.data.sub || ''}
                        style={inputStyle}
                        placeholder='Subject'
                        multiline
                        onChangeText={(text) => setForm({ ...form, data: { ...form.data, sub: text } })}
                    />
                </Col>
                {form.media === null &&
                    <Col style={{ ...outerStyle, borderRadius: config.borderRadius, overflow: 'hidden' }}>
                        <TouchableNativeFeedback onPress={() => {
                            ImageCropPicker.openPicker({
                                mediaType: 'any',
                                multiple: false
                            }).then((media) => {
                                const fsize = media.size;
                                const maxSize = getCurrFullBoard(state).max_file_size;
                                console.log(fsize, maxSize);
                                if (fsize > maxSize) {
                                    setFormMediaError(`File is too big, max is ${filesize(maxSize)}`);
                                }
                                setForm({ ...form, media });
                            });
                        }}>
                            <Col style={{ width: 50, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <ThemedIcon name={"attach"} size={32} />
                            </Col>
                        </TouchableNativeFeedback>
                    </Col>
                }
            </Row>

            <Col style={outerStyle} >
                <Row style={labelStyle}>
                    {formComError !== null && <ThemedIcon err size={20} name={"alert"} />}
                    <ThemedText style={laberTextStyle} content={'Comment'} />
                </Row>
                <TextInput
                    placeholder='Comment'
                    value={form.data.com || ''}
                    style={{ ...inputStyle, maxHeight: 300 }}
                    multiline
                    onChangeText={(text) => setForm({ ...form, data: { ...form.data, com: text } })}
                />
            </Col>
        </Col >
    </KeyboardAvoidingView >;
};
