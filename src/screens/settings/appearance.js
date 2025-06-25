/* eslint-disable react/react-in-jsx-scope */
import { useTheme } from '@react-navigation/native';
import { useContext } from 'react';
import { ScrollView } from 'react-native';

import { Ctx } from '../../app';
import { Col, EnumProp, Row, Section, ThemedText, Toggle, ToggleProp } from '../../components';
import { setConfigAndSave } from '../../context/config';
import { relativeTime } from '../../helpers';

export const APPEARANCE_KEY = 'Appearance';

export const Appearance = () => {
    const theme = useTheme();
    const { config, setConfig } = useContext(Ctx);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTstamp = Math.floor(yesterday.getTime() / 1000);

    return <ScrollView style={{ backgroundColor: theme.colors.card, }}>
        <Col style={{ padding: 10, gap: 10 }}>
            <Section title={'Theme'}>
                <EnumProp
                    propName={'themeMode'}
                    desc={'Set the main app theme'}
                    values={['Light', 'Dark', 'Auto']}
                />
                <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <ThemedText content={'Enable rounded corners?'} />
                    <Toggle
                        isEnabled={config.borderRadius > 0}
                        onToggle={async value => {
                            const borderRadius = value ? 10 : 0;
                            await setConfigAndSave(setConfig, 'borderRadius', borderRadius);
                        }} />
                </Row>
            </Section>

            <Section title={"Date format"}>
                <ToggleProp
                    propName={'relativeTime'}
                    desc={`Use relative dates?\nPreview: ${config.relativeTime ? relativeTime(yesterdayTstamp) : yesterday.toLocaleString()}`}
                />
            </Section>
        </Col>
    </ScrollView >;
};