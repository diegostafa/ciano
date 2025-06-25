/* eslint-disable react/react-in-jsx-scope */
import { useTheme } from '@react-navigation/native';
import { useContext } from 'react';
import { ScrollView } from 'react-native';

import { Ctx } from '../../app';
import { Col, HtmlText, Section, SliderProp, ThemedText, ToggleProp } from '../../components';

export const ACCESSIBILITY_KEY = 'Accessibility';

export const Accessibility = () => {
    const theme = useTheme();
    const { config } = useContext(Ctx);

    return <ScrollView style={{ backgroundColor: theme.colors.card, }}>
        <Col style={{ padding: 10, gap: 10 }}>
            <Section title={'Readability'}>
                <ToggleProp propName={'highContrast'} desc={'Enable high contrast?'} />
                <SliderProp min={0.5} max={2} step={0.25} propName={'uiFontScale'} desc={`UI font scaling: ${config.uiFontScale}x`} />
                <SliderProp min={0.5} max={2} step={0.25} propName={'htmlFontScale'} desc={`Comments font scaling: ${config.htmlFontScale}x`} />
                <ThemedText content={"Preview:"} />
                <Col style={{ padding: 10, borderRadius: config.borderRadius, backgroundColor: theme.colors.highlight }}>
                    <HtmlText value={'<sub>This is a subject</sub>'} raw />
                    <HtmlText value={'<com>This is a comment</com>'} raw />
                </Col>
            </Section>

            <Section title={'Visual noise'}>
                <ToggleProp propName={'disableMovingElements'} desc={'Disable moving elements?'} />
            </Section>
        </Col>
    </ScrollView>;
};
