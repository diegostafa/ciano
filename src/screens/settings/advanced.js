import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@react-navigation/native';
import React, { useContext } from 'react';
import { ScrollView } from 'react-native';
import ReactNativeSegmentedControlTab from 'react-native-segmented-control-tab';

import { Ctx } from '../../app';
import { Col, ModalAlert, Section, ThemedButton, ThemedText, ToggleProp } from '../../components';
import { Config, setConfigAndSave } from '../../context/config';
import { State } from '../../context/state';
import { Temp } from '../../context/temp';
import { api } from '../../data/api';

export const ADVANCED_KEY = 'Advanced';

export const Advanced = () => {
    const { state, setState, setTemp, config, setConfig } = useContext(Ctx);
    const theme = useTheme();
    const [needsConfirmation, setNeedsConfirmation] = React.useState(false);

    return <ScrollView style={{ backgroundColor: theme.colors.card, }}>
        <Col style={{ padding: 10, gap: 10 }}>
            <ModalAlert
                visible={needsConfirmation}
                msg={'Delete app data?'}
                left={'Yes'}
                right={'No'}
                onClose={() => { setNeedsConfirmation(false); }}
                onPressRight={async () => { setNeedsConfirmation(false); }}
                onPressLeft={async () => {
                    setNeedsConfirmation(false);
                    const s = State.default();
                    await State.save(s);
                    setState(s);
                    setTemp(Temp.default);
                    const c = Config.default();
                    await Config.save(c);
                    setConfig(c);
                    await AsyncStorage.clear();
                }}
            />
            <Section title={"Server"}>
                <Col style={{ gap: 10 }}>
                    <ThemedText style={{ textAlign: 'center' }} content={"Switch server"} />
                    <ReactNativeSegmentedControlTab
                        tabsContainerStyle={{ backgroundColor: theme.colors.background }}
                        tabStyle={{ backgroundColor: theme.colors.highlight, borderColor: theme.colors.primary }}
                        tabTextStyle={{ color: theme.colors.text }}
                        activeTabStyle={{ backgroundColor: theme.colors.primary }}
                        activeTabTextStyle={{ color: theme.colors.primaryInverted }}
                        allowFontScaling={false}
                        selectedIndex={state.api.name === api.ciano.name ? 0 : 1}
                        values={['Ciano', '4chan']}
                        onTabPress={async index => {
                            State.save(state);
                            const apis = [
                                api.ciano,
                                api.chan
                            ];
                            setState(await State.restore(apis[index]));
                            setConfigAndSave(setConfig, 'apiName', apis[index].name);
                        }}
                    />
                </Col>

            </Section>
            <Section title={'Performance'}>
                <ToggleProp propName={'loadFaster'} desc={'Load comments incrementally?'} />
            </Section>
            <Section title={'Debug'}>
                <Col style={{ backgroundColor: theme.colors.danger, borderRadius: config.borderRadius, overflow: 'hidden' }}>
                    <ThemedButton onPress={async () => { setNeedsConfirmation(true); }}>
                        <Col style={{ padding: 10, alignItems: 'center' }}>
                            <ThemedText content={'Reset app data'} />
                        </Col>
                    </ThemedButton>
                </Col>
            </Section>
        </Col>
    </ScrollView >;
};
