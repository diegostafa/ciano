/* eslint-disable react/display-name */
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import { filesize } from 'filesize';
import React from 'react';
import { ActivityIndicator, Modal, Text, TouchableNativeFeedback, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import HTMLView from 'react-native-htmlview';
import Icon from 'react-native-vector-icons/Ionicons';
import VideoPlayer from 'react-native-video-player';

import { BOARD_NAV_KEY, CATALOG_KEY, Ctx } from './app';
import { Config } from './context/config';
import { Repo } from './data/repo';
import { DarkHtmlHeaderTheme, DarkHtmlTheme, LightHtmlHeaderTheme, LightHtmlTheme } from './theme';


// --- helper functions

export const setLocal = async (key, value) => {
    return AsyncStorage.setItem(key, JSON.stringify(value));
};
export const getLocal = async (key) => {
    return AsyncStorage.getItem(key).then(res => JSON.parse(res));
};
export const getRemote = async ({ key, remote }) => {
    const newValue = await remote().catch(console.error);
    await setLocal(key, newValue).catch(console.error);
    return newValue;
};
export const getLocalOrRemote = async ({ key, remote }) => {
    const value = await getLocal(key).catch(console.error);
    if (value !== null) {
        return value;
    }
    if (!remote) {
        return null;
    }
    const newValue = await remote().catch(console.error);
    await setLocal(key, newValue).catch(console.error);
    return newValue;
};
export const relativeTime = (tstamp) => {
    return formatDistanceToNow(Number(tstamp) * 1000, { addSuffix: true });
};
export const historyAdd = async (state, thread) => {
    if (!thread) {
        return state.history;
    }
    const idx = state.history.findIndex(item => item.board === state.board && item.thread.id === thread.id);
    if (idx !== -1) {
        state.history.splice(idx, 1);
    }
    const history = [...state.history, { board: state.board, thread }];
    await Config.set('history', history);
    return history;
};
export const getComment = (comments, threadId) => {
    return comments.find(item => item.id === threadId);
};
export const getRepliesTo = (comments, comment) => {
    return comments.filter(item => item.com && item.com.includes("&gt;&gt;" + comment.id));
};
export const quotes = (comment) => {
    if (!comment.com) {
        return [];
    }
    const matches = comment.com.match(/&gt;&gt;\d+/g) || [];
    return matches.map(match => Number(match.slice(8)));
}
export const getThreadSignature = (thread) => {
    const board = `<info>/${thread.board}/ - </info>`;
    if (thread.sub) {
        return `${board}<sub>${thread.sub}</sub>`;
    } else {
        return `${board}<com>${thread.com}</com>`;
    }
}
export const currRoute = (state) => {
    const tabRoute = state.routes.find(r => r.name === BOARD_NAV_KEY);
    const stackState = tabRoute?.state;
    const currentRoute = stackState?.routes?.[stackState.index]?.name;
    return currentRoute || CATALOG_KEY;
};
export const arraysDiffer = (a, b) => {
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return true;
    }
    return false;
};
export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
export const isImg = (ext) => {
    return ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif';
}
export const getCurrBoard = (state) => {
    return state.boards.find(item => item.code === state.board);
}
// --- components

export const ThemedIcon = ({ name, size, color }) => {
    const theme = useTheme();
    return <Icon name={name} size={size || 28} color={color || theme.colors.text} />;
};
export const HeaderIcon = ({ name, onPress }) => {
    return <View style={{
        overflow: 'hidden',
        borderRadius: '50%',
    }}>
        <TouchableNativeFeedback onPress={onPress}>
            <View style={{ padding: 10 }}>
                <ThemedIcon name={name} size={26} />
            </View>
        </TouchableNativeFeedback>
    </View>;
};
export const TabIcon = (name) => ({ color }) => {
    return ThemedIcon({ name, size: 24, color });
};
export const Fab = ({ onPress, child }) => {
    const theme = useTheme();
    const size = 52;

    return <View style={{
        position: 'absolute',
        bottom: 36,
        right: 32,
        zIndex: 1,
        height: size,
        width: size,
        borderRadius: '50%',
        overflow: 'hidden',

    }}>
        <TouchableNativeFeedback onPress={onPress}>
            <View style={{
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                height: size,
                width: size,
            }}>
                {child || <ThemedIcon name={'add'} />}
            </View>
        </TouchableNativeFeedback>
    </View>;
};
export const ModalView = ({ content, visible, onClose, fullscreen, noBackdrop }) => {
    const { width, height } = useWindowDimensions();
    const isVertical = width < height;
    const theme = useTheme();
    const { config } = React.useContext(Ctx);

    return <Modal
        animationType='fade'
        transparent
        visible={visible}
        onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={noBackdrop ? null : onClose}>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                <View style={{
                    width: fullscreen ? '100%' : isVertical ? '90%' : '50%',
                    maxHeight: fullscreen ? '100%' : isVertical ? '80%' : '90%',
                    borderRadius: config.borderRadius,
                    backgroundColor: theme.colors.card,
                    justifyContent: 'space-evenly',
                    overflow: 'hidden'
                }}>
                    {content}
                </View>
            </View>
        </TouchableWithoutFeedback>
    </Modal >;
};
export const ModalAlert = ({ msg, visible, left, right, onClose, onPressLeft, onPressRight }) => {
    const btnStyle = { padding: 10, flex: 1, alignItems: 'center' };

    return <ModalView
        visible={visible}
        onClose={onClose}
        content={
            <View>
                <View style={{ padding: 15 }} >
                    <ThemedText content={msg} />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {left && <TouchableNativeFeedback onPress={onPressLeft}>
                        <View style={btnStyle}>
                            <ThemedText content={left} />
                        </View>
                    </TouchableNativeFeedback>}

                    {right && <TouchableNativeFeedback onPress={onPressRight}>
                        <View style={btnStyle}>
                            <ThemedText content={right} />
                        </View>
                    </TouchableNativeFeedback>}

                </View>
            </View>
        }
    />
}
export const ModalMenu = ({ visible, onClose, items }) => {
    const btnStyle = { padding: 15, flexDirection: 'row' };
    return <ModalView
        visible={visible}
        onClose={onClose}
        content={
            <View>
                {items.map(([value, icon, action]) => {
                    return <TouchableNativeFeedback key={value} onPress={action}>
                        <View style={btnStyle}>
                            {icon && <ThemedIcon name={icon} size={20} />}
                            <ThemedText content={capitalize(value)} style={{ marginLeft: 15, }} />
                        </View>
                    </TouchableNativeFeedback>
                })}
            </View>
        }
    />
};
export const ThemedText = ({ content, style }) => {
    const theme = useTheme();
    return <Text style={{ ...style, color: theme.colors.text }}>{content}</Text>;
};
export const HtmlHeader = ({ value }) => {
    const theme = useTheme();
    value = value.replaceAll(/<br>/g, ' ');

    return <HTMLView
        value={`<header>${value}</header>`}
        stylesheet={theme.dark ? DarkHtmlHeaderTheme : LightHtmlHeaderTheme}
    />;
}
export const HtmlText = React.memo(({ value, onLinkPress }) => {
    const theme = useTheme();
    return <HTMLView
        onLinkPress={onLinkPress}
        value={`<p>${value}</p>`}
        stylesheet={theme.dark ? DarkHtmlTheme : LightHtmlTheme}
    />;
}, (prevProps, nextProps) => prevProps.value === nextProps.value);
export const HeaderButton = ({ child, isActive, onPress }) => {
    const theme = useTheme();
    const { config } = React.useContext(Ctx);

    return <View style={{
        overflow: 'hidden',
        borderRadius: config.borderRadius,
        marginRight: 5,
        backgroundColor: isActive ? 'gray' : theme.colors.primary
    }}>
        <TouchableNativeFeedback onPress={onPress}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingLeft: 15,
                paddingRight: 15,
                paddingTop: 6,
                paddingBottom: 6,
            }}>
                {child}
            </View>
        </TouchableNativeFeedback>


    </View>;
};
export const ListSeparator = () => {
    const theme = useTheme();
    return <View style={{ height: 2, backgroundColor: theme.colors.highlight }} />;
}

export const ModalGallery = ({ visible, onClose, initialIndex, data }) => {
    const { width, height } = useWindowDimensions();

    return <ModalView
        fullscreen={true}
        visible={visible}
        onClose={onClose}
        noBackdrop={true}
        content={
            <View style={{ width, height, backgroundColor: 'rgba(0,0,0,0)' }}>
                <MediaPreview comment={data[initialIndex]} onClose={onClose} />
            </View>
        }
    />;
};
export const MediaPreview = ({ comment, onClose }) => {
    const theme = useTheme();
    React.useContext(Ctx);
    const { width, height } = useWindowDimensions();
    const isImage = isImg(comment.media_ext);
    const full = Repo.media.full(comment);
    const thumb = Repo.media.thumb(comment);
    const [isImageLoading, setIsImageLoading] = React.useState(isImage);
    const [showHeader, setShowHeader] = React.useState(true);


    if (!isImage) {
        return <View style={{ flex: 1, borderWidth: 1, borderColor: 'red', justifyContent: 'center', alignItems: 'center', }}>
            <VideoPlayer
                customStyles={{
                }}
                fullscreen={true}
                disableControlsAutoHide={true}
                hideControlsOnStart={true}
                style={{ width, height }}
                preventsDisplaySleepDuringVideoPlayback={true}
                source={{ uri: full }}
                thumbnail={{ uri: thumb }}
                videoWidth={width}
                autoplay={true}
                repeat={true}
                showDuration={true}
                onError={(e) => console.log(e)}
            />
        </View>;
    }

    return <PanGestureHandler onHandlerStateChange={() => {
        console.log('onHandlerStateChange');
    }}>
        <View style={{ flex: 1, borderWidth: 1, borderColor: 'red' }}>
            {isImageLoading && <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2,
                position: 'absolute',
                width: '100%',
                height: '100%',
            }}>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 3,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    gap: 10,
                }}>
                    <ActivityIndicator size='large' color='white' />
                    <ThemedText content={`Loading ${comment.media_name}.${comment.media_ext}...\nThis might take a while`} />
                </View>
            </View>
            }
            {showHeader && <View style={{
                flex: 1,
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 2,
                width: '100%',
                position: 'absolute',
                flexDirection: 'row',
                padding: 10,
                backgroundColor: theme.colors.background,
            }}>
                <ThemedText content={`${comment.media_name}.${comment.media_ext}  (${filesize(comment.media_size)})`}
                    style={{ fontWeight: 'bold', }} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <HeaderIcon name={'download'} size={30} onPress={() => {
                        // todo
                    }} />
                    <HeaderIcon name={'close'} size={30} onPress={onClose} />
                </View>
            </View>}

            <GestureHandlerRootView style={{ flex: 1 }}>
                <ImageZoom
                    onLoad={() => setIsImageLoading(false)}
                    onSingleTap={() => setShowHeader(!showHeader)}
                    uri={full}
                    width={width}
                    height={height}
                    minScale={0.5}
                    maxScale={3}
                    doubleTapScale={3}
                    isSingleTapEnabled={true}
                    isDoubleTapEnabled={true}
                />
            </GestureHandlerRootView>
        </View>

    </PanGestureHandler>;
};
