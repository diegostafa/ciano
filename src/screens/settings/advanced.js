
import AsyncStorage from '@react-native-async-storage/async-storage';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useTheme } from '@react-navigation/native';
import React, { useContext } from 'react';
import { ScrollView } from 'react-native';

import { Ctx } from '../../app';
import { Col, ModalAlert, Section, ThemedButton, ThemedText } from '../../components';
import { Config } from '../../context/config';
import { State } from '../../context/state';
import { Temp } from '../../context/temp';
import { api } from '../../data/api';

export const ADVANCED_KEY = 'Advanced';

export const Advanced = () => {
    const { state, setState, temp, setTemp, config, setConfig } = useContext(Ctx);
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
            <Section title={"Data"}>
                <Col style={{ gap: 10 }}>
                    <ThemedText content={"Switch server"} />
                    <SegmentedControl
                        tabStyle={{ borderRadius: config.borderRadius }}
                        values={['Ciano', '4chan']}
                        selectedIndex={state.api.name === api.ciano.name ? 0 : 1}
                        onChange={async (event) => {
                            const index = event.nativeEvent.selectedSegmentIndex;
                            State.save(state);
                            const newState = index === 0 ? await State.restore(api.ciano) : await State.restore(api.chan);
                            await State.save(newState);
                            setState(newState);
                            setTemp(Temp.switchApi(temp));
                        }}
                        tintColor={theme.colors.primary}
                        backgroundColor={theme.colors.highlight}
                        fontStyle={{ color: theme.colors.text }}
                        activeFontStyle={{ color: theme.colors.primaryInverted }}
                    />
                </Col>

                <Col style={{ backgroundColor: theme.colors.danger, borderRadius: config.borderRadius, overflow: 'hidden' }}>
                    <ThemedButton onPress={async () => { setNeedsConfirmation(true); }}>
                        <Col style={{ padding: 10, alignItems: 'center' }}>
                            <ThemedText content={'Clear app data'} />
                        </Col>
                    </ThemedButton>
                </Col>
            </Section>
        </Col>
    </ScrollView >;
};
