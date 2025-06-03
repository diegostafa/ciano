/* eslint-disable react/react-in-jsx-scope */
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useContext } from 'react';
import { ScrollView } from 'react-native';

import { Ctx } from '../../app';
import { Config } from '../../context/config';
import { BooleanConfig, Col, Row, ThemedText } from '../../utils';

export const APPEARANCE_KEY = 'Appearance';

export const Appearance = () => {
    const { config, setConfig } = useContext(Ctx);
    return <ScrollView>
        <Col>
            <ThemedText content={"Theme"} />
            <Row>
                <ThemedText content={"Set the main app theme"} />
                <ThemedText content={"Dark"} />
                <SegmentedControl
                    values={['Light', 'Dark', 'System']}
                    selectedIndex={config.themeMode}
                    onChange={async (event) => {
                        setConfig({ ...config, themeMode: event.nativeEvent.selectedSegmentIndex });
                        await Config.set("themeMode", event.nativeEvent.selectedSegmentIndex);
                    }}
                />
            </Row>
        </Col>

        <BooleanConfig
            title={"Date format"}
            description={"Use relative dates (e.g. 2 hours ago) instead of absolute dates (e.g. 14:00 )"}
            isEnabled={config.relativeTime}
            onToggle={async value => {
                setConfig({ ...config, relativeTime: value });
                await Config.set("relativeTime", value);
            }} />

        <BooleanConfig
            title={"Borders"}
            description={"Use rounded corners?"}
            isEnabled={config.borderRadius > 0}
            onToggle={async value => {
                const borderRadius = value ? 10 : 0;
                setConfig({ ...config, borderRadius });
                await Config.set("borderRadius", borderRadius);
            }} />
    </ScrollView>;
};