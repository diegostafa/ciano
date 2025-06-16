/* eslint-disable react/display-name */
import { Marquee } from '@animatereactnative/marquee';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import { useTheme } from '@react-navigation/native';
import { filesize } from 'filesize';
import React, { useContext, useRef } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Switch, Text, TouchableNativeFeedback, TouchableWithoutFeedback, useColorScheme, useWindowDimensions, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HTMLView from 'react-native-htmlview';
import Snackbar from 'react-native-snackbar';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';

import { Ctx } from './app';
import { Repo } from './data/repo';
import { capitalize, downloadMedia, getImageAsset, isGif, isImage, isVideo } from './helpers';
import { DarkHtmlTheme, LightHtmlTheme } from './theme';

export const ThemedIcon = ({ name, size, accent }) => {
    const theme = useTheme();
    return <Icon name={name} size={size || 28} color={accent ? theme.colors.primary : theme.colors.text} />;
};
export const HeaderIcon = ({ name, onPress, size }) => {
    return <Col style={{
        overflow: 'hidden',
        borderRadius: '50%',
    }}>
        <TouchableNativeFeedback onPress={onPress}>
            <Col style={{ padding: 10 }}>
                <ThemedIcon name={name} size={size || 26} />
            </Col>
        </TouchableNativeFeedback>
    </Col>;
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
            <Col style={{
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                height: size,
                width: size,
            }}>
                {child || <ThemedIcon name={'add'} />}
            </Col>
        </TouchableNativeFeedback>
    </View>;
};
export const ModalView = ({ content, visible, onClose, fullscreen, noBackdrop, animation }) => {
    const { width, height } = useWindowDimensions();
    const isVertical = width < height;
    const theme = useTheme();
    const { config } = React.useContext(Ctx);

    return <Modal
        animationType={animation || 'fade'}
        transparent
        visible={visible}
        onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={noBackdrop ? null : onClose}>
            <Col
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                <Col style={{
                    borderWidth: fullscreen ? 0 : 1,
                    borderColor: theme.colors.highlight,
                    width: fullscreen ? '100%' : isVertical ? '90%' : '50%',
                    maxHeight: fullscreen ? '100%' : isVertical ? '80%' : '90%',
                    borderRadius: config.borderRadius,
                    backgroundColor: theme.colors.card,
                    justifyContent: 'space-evenly',
                    overflow: 'hidden'
                }}>
                    {content}
                </Col>
            </Col>
        </TouchableWithoutFeedback>
    </Modal >;
};
export const ModalAlert = ({ msg, visible, left, right, onClose, onPressLeft, onPressRight, noBackdrop }) => {
    const btnStyle = { padding: 10, flex: 1, alignItems: 'center' };
    const theme = useTheme();

    return <ModalView
        noBackdrop={noBackdrop}
        visible={visible}
        onClose={onClose}
        content={
            <Col>
                <Col style={{ padding: 15 }} >
                    <ThemedText content={msg} />
                </Col>

                <Row style={{ justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                    {left && <TouchableNativeFeedback onPress={onPressLeft}>
                        <Col style={btnStyle}>
                            <ThemedText content={left} />
                        </Col>
                    </TouchableNativeFeedback>}

                    {left && right && <Col style={{ width: 1, backgroundColor: theme.colors.border }} />}

                    {right && <TouchableNativeFeedback onPress={onPressRight}>
                        <Col style={btnStyle}>
                            <ThemedText content={right} />
                        </Col>
                    </TouchableNativeFeedback>}

                </Row>
            </Col>
        }
    />
}
export const ModalMenu = ({ visible, onClose, items }) => {
    const theme = useTheme();
    const btnStyle = { padding: 15 };
    const textStyle = { marginLeft: 15 };
    const activeTextStyle = { ...textStyle, color: theme.colors.primary };

    return <ModalView
        visible={visible}
        onClose={onClose}
        content={
            <ScrollView>
                {items.map(([value, icon, action, isActive]) => {
                    return <TouchableNativeFeedback key={value} onPress={action}>
                        <Row style={btnStyle}>
                            {icon && <ThemedIcon name={icon} size={20} />}
                            <ThemedText content={capitalize(value)} style={isActive ? activeTextStyle : textStyle} />
                        </Row>
                    </TouchableNativeFeedback>
                })}
            </ScrollView>
        }
    />
};
export const ThemedText = ({ content, style, line }) => {
    const theme = useTheme();
    const { config } = useContext(Ctx);
    let fontSize = 14;
    if (style && 'fontSize' in style) {
        fontSize = style.fontSize * config.uiFontScale;
    }
    return <Text ellipsizeMode='tail' numberOfLines={1} style={{ ...style, color: theme.colors.text, fontSize }}>{content}</Text>;
};
export const HtmlText = React.memo(({ value, onLinkPress, raw }) => {
    const theme = useTheme();
    const { config } = useContext(Ctx);
    return <HTMLView
        onLinkPress={onLinkPress || undefined}
        value={raw ? value : `<p>${value}</p>`}
        stylesheet={theme.dark ? DarkHtmlTheme(config) : LightHtmlTheme(config)}
    />;
}, (prevProps, nextProps) => prevProps.value === nextProps.value);
export const HeaderButton = ({ child, enabled, onPress }) => {
    const theme = useTheme();
    const { config } = React.useContext(Ctx);

    return <Col style={{
        overflow: 'hidden',
        borderRadius: config.borderRadius,
        marginRight: 5,
        backgroundColor: enabled ? theme.colors.primary : 'gray',
    }}>
        <TouchableNativeFeedback onPress={onPress}>
            <Col style={{
                justifyContent: 'space-between',
                paddingLeft: 15,
                paddingRight: 15,
                paddingTop: 6,
                paddingBottom: 6,
            }}>
                {child}
            </Col>
        </TouchableNativeFeedback>
    </Col>;
};
export const ListSeparator = () => {
    const theme = useTheme();
    return <Col style={{ height: 2, backgroundColor: theme.colors.highlight }} />;
}
export const ModalMediaPreview = () => {
    const { width, height } = useWindowDimensions();
    const { temp, setTemp } = React.useContext(Ctx);

    React.useEffect(() => {
        if (temp.mediaDownloadSuccess !== null) {
            Snackbar.show({
                text: 'Media downloaded successfully',
                duration: Snackbar.LENGTH_SHORT,
            });
        }
    }, [temp.mediaDownloadSuccess]);

    return <ModalView
        fullscreen
        visible={temp.selectedMediaComment !== null}
        onClose={() => { setTemp({ ...temp, selectedMediaComment: null }); }}
        noBackdrop
        animation={'slide'}
        content={
            <Col style={{ width, height, backgroundColor: 'rgba(0,0,0,0)' }}>
                <MediaPreview
                    comment={temp.selectedMediaComment}
                    onClose={() => { setTemp({ ...temp, selectedMediaComment: null }); }}
                />
            </Col>
        }
    />;
};
const MediaPreview = ({ comment, onClose }) => {
    const theme = useTheme();
    const { state, temp, setTemp, config } = React.useContext(Ctx);
    const { width, height } = useWindowDimensions();
    const smallest = Math.min(width, height);
    const [isLoading, setIsLoading] = React.useState(true);
    const [showHeader, setShowHeader] = React.useState(true);
    const is_image = isImage(comment.media_ext);
    const is_gif = isGif(comment.media_ext);
    const is_video = isVideo(comment.media_ext);
    const full = Repo(state.api).media.full(comment);
    const thumb = Repo(state.api).media.thumb(comment);
    const videoref = useRef(null);

    return <Col style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ModalAlert
            visible={temp.mediaDownloadError !== null}
            msg={'The file could not be downloaded'}
            left={'OK'}
            onPressLeft={() => { setTemp({ ...temp, mediaDownloadError: null }); }}
        />

        {showHeader &&
            <Row style={{
                top: 0,
                flex: 1,
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 4,
                width: '100%',
                position: 'absolute',
                padding: 10,
                backgroundColor: theme.colors.overlayBg,
            }}>
                <Marquee
                    speed={config.disableMovingElements ? 0 : 0.3}
                    spacing={width - 150}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}>
                    <ThemedText
                        style={{ fontWeight: 'bold', }}
                        content={`${comment.file_name}.${comment.media_ext}  (${filesize(comment.media_size)})`}
                    />
                </Marquee>

                <Row style={{ gap: 10 }}>
                    <HeaderIcon name={'download'} onPress={async () => {
                        await downloadMedia(setTemp, state, comment);
                    }} />
                    <HeaderIcon name={'close'} onPress={onClose} />
                </Row>
            </Row>
        }

        {is_image &&
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ImageZoom
                    onLoad={() => setIsLoading(false)}
                    onSingleTap={() => setShowHeader(!showHeader)}
                    uri={full}
                    width={smallest}
                    height={smallest}
                    minScale={0.5}
                    maxScale={3}
                    doubleTapScale={3}
                    isSingleTapEnabled
                    isDoubleTapEnabled
                />
            </GestureHandlerRootView>}

        {is_gif &&
            <Pressable onPress={() => setShowHeader(!showHeader)}>
                <FastImage
                    source={{ uri: full }}
                    onLoad={() => setIsLoading(false)}
                    style={{ width: smallest, height: smallest }}
                />
            </Pressable>}

        {is_video &&
            <Video
                ref={videoref}
                enterPictureInPictureOnLeave={false}
                controls
                muted={config.muteVideos}
                repeat={config.loopVideos}
                controlsStyles={{
                    hideSettingButton: false,
                    hideNotificationBarOnFullScreenMode: true,
                    hideNavigationBarOnFullScreenMode: true,
                }}
                source={{ uri: full }}
                style={{ width: width, height: height }}
                onLoad={() => { setIsLoading(false); }}
            />}


        {isLoading && <Col style={{
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2,
            position: 'absolute',
            width: '100%',
            height: '100%',
            gap: 10,
        }}>
            <ImageZoom
                uri={thumb}
                width={smallest}
                height={smallest}
                minScale={0.5}
                maxScale={3}
                doubleTapScale={3}
                isSingleTapEnabled
                isDoubleTapEnabled
            />
            <Col style={{
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2,
                position: 'absolute',
                width: '100%',
                height: '100%',
            }}>
                <Row style={{
                    maxWidth: '80%',
                    backgroundColor: theme.colors.background,
                    borderRadius: config.borderRadius,
                    padding: 15,
                    gap: 10,
                }}>
                    <ActivityIndicator size='large' color='white' />
                    <ThemedText content={`Loading...\nThis might take a while`} />
                </Row>
            </Col>
        </Col >}
    </Col>;
};
export const ModalLocalMediaPreview = () => {
    const { width, height } = useWindowDimensions();
    const { temp, setTemp } = React.useContext(Ctx);

    return <ModalView
        fullscreen
        visible={temp.selectedLocalMedia !== null}
        onClose={() => { setTemp({ ...temp, selectedLocalMedia: null }); }}
        noBackdrop
        animation={'slide'}
        content={
            <Col style={{ width, height, backgroundColor: 'rgba(0,0,0,0)' }}>
                <LocalMediaPreview
                    media={temp.selectedLocalMedia}
                    onClose={() => { setTemp({ ...temp, selectedLocalMedia: null }); }}
                />
            </Col>
        }
    />;
};
const LocalMediaPreview = ({ media, onClose }) => {
    const theme = useTheme();
    const { config } = React.useContext(Ctx);
    const { width, height } = useWindowDimensions();
    const smallest = Math.min(width, height);
    const [isLoading, setIsLoading] = React.useState(true);
    const [showHeader, setShowHeader] = React.useState(true);

    const ext = media.mime.split('/').pop();
    const name = media.path.split('/').pop();
    const size = media.size;

    const is_image = isImage(ext);
    const is_gif = isGif(ext);
    const is_video = isVideo(ext);
    const videoref = useRef(null);


    return <Col style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {showHeader &&
            <Row style={{
                top: 0,
                flex: 1,
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 4,
                width: '100%',
                position: 'absolute',
                padding: 10,
                backgroundColor: theme.colors.overlayBg,
            }}>

                <Marquee
                    speed={config.disableMovingElements ? 0 : 0.3}
                    spacing={width - 150}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}>
                    <ThemedText
                        style={{ fontWeight: 'bold', }}
                        content={`${name} (${filesize(size)})`}
                    />
                </Marquee>

                <Row style={{ gap: 10 }}>
                    <HeaderIcon name={'close'} onPress={onClose} />
                </Row>
            </Row>}

        {is_image &&
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ImageZoom
                    onLoad={() => setIsLoading(false)}
                    onSingleTap={() => setShowHeader(!showHeader)}
                    uri={media.path}
                    width={smallest}
                    height={smallest}
                    minScale={0.5}
                    maxScale={3}
                    doubleTapScale={3}
                    isSingleTapEnabled
                    isDoubleTapEnabled
                />
            </GestureHandlerRootView>}

        {is_gif &&
            <Pressable onPress={() => setShowHeader(!showHeader)}>
                <FastImage
                    source={{ uri: media.path }}
                    onLoad={() => setIsLoading(false)}
                    style={{ width: smallest, height: smallest }}
                />
            </Pressable>}

        {is_video &&
            <Video
                ref={videoref}
                enterPictureInPictureOnLeave={false}
                controls
                muted={config.muteVideos}
                repeat={config.loopVideos}
                controlsStyles={{
                    hideSettingButton: false,
                    hideNotificationBarOnFullScreenMode: true,
                    hideNavigationBarOnFullScreenMode: true,
                }}
                source={{ uri: media.path }}
                style={{ width: width, height: height }}
                onLoad={() => { setIsLoading(false); }}
            />}


        {isLoading && <Col style={{
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2,
            position: 'absolute',
            width: '100%',
            height: '100%',
            gap: 10,
        }}>
            <Col style={{
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2,
                position: 'absolute',
                width: '100%',
                height: '100%',
            }}>
                <Row style={{
                    maxWidth: '80%',
                    backgroundColor: theme.colors.background,
                    borderRadius: config.borderRadius,
                    padding: 15,
                    gap: 10,
                }}>
                    <ActivityIndicator size='large' color='white' />
                    <ThemedText content={`Loading...\nThis might take a while`} />
                </Row>
            </Col>
        </Col >}
    </Col>;
};
export const BooleanConfig = ({ title, description, isEnabled, onToggle }) => {
    return <Row style={{ padding: 10 }}>
        <Col>
            <ThemedText content={title} style={{ fontWeight: 'bold' }} />
            <ThemedText content={description} />
        </Col>
        <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={onToggle}
            value={isEnabled}
        />
    </Row>;
};
export const Row = ({ children, style, ...rest }) => {
    return <View style={[{ flexDirection: 'row' }, style]} {...rest}>
        {children}
    </View>;
};
export const Col = ({ children, style, ...rest }) => {
    return <View style={[{ flexDirection: 'column' }, style]} {...rest}>
        {children}
    </View>;
};

export const ThemedAsset = ({ name, width, height, desc }) => {
    const theme = useColorScheme();
    return <Image
        style={{ width, height }}
        source={getImageAsset(theme, name)} />;
};
