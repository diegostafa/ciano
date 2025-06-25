/* eslint-disable react/react-in-jsx-scope */


import { useTheme } from '@react-navigation/native';
import { ScrollView } from 'react-native';

import { Col, Section, ToggleProp } from '../../components';

export const BEHAVIOUR_KEY = 'Behaviour';

export const Behaviour = () => {
    const theme = useTheme();

    return <ScrollView style={{ backgroundColor: theme.colors.card, }}>
        <Col style={{ padding: 10, gap: 10 }}>
            <Section title={'Threads and comments'}>
                <ToggleProp propName={'showCatalogThumbnails'} desc={'Show thumbnails?'} />
                <ToggleProp propName={'showNames'} desc={'Show names of posters?'} />
                <ToggleProp propName={'showOptionalFields'} desc={'Show optional fields in forms?'} />
                <ToggleProp propName={'autoWatchThreads'} desc={'Automatically watch threads you comment on?'} />
                <ToggleProp propName={'autoWatchThreadsCreated'} desc={'Automatically watch threads you create?'} />
            </Section>

            <Section title={'Media'}>
                <ToggleProp propName={'muteVideos'} desc={'Start videos muted?'} />
                <ToggleProp propName={'loopVideos'} desc={'Loop videos when they end?'} />
            </Section>
        </Col>
    </ScrollView>;
};

