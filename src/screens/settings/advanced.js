/* eslint-disable react/react-in-jsx-scope */
import { useContext } from 'react';
import { ScrollView, TouchableNativeFeedback, View } from 'react-native';

import { Ctx } from '../../app';
import { Config } from '../../context/config';
import { State } from '../../context/state';
import { Temp } from '../../context/temp';
import { ThemedText } from '../../utils';

export const ADVANCED_KEY = 'Advanced';

export const Advanced = () => {
    const { temp, config, setState, setTemp, setConfig } = useContext(Ctx);
    return <ScrollView style={{ padding: 20, flex: 1 }}>
        <View>
            <TouchableNativeFeedback onPress={async () => {
                const s = await State.restore();
                await State.save(s);
                setState(s);
            }}>
                <View>
                    <ThemedText content={"clear state"} />
                </View>
            </TouchableNativeFeedback>
        </View>
        <View>
            <TouchableNativeFeedback onPress={async () => {
                setTemp(Temp.default);
            }}>
                <View>
                    <ThemedText content={"clear temp"} />
                </View>
            </TouchableNativeFeedback>
        </View>
        <View>
            <TouchableNativeFeedback onPress={async () => {
                const c = await Config.restore();
                await Config.save(c);
                setConfig(c);
            }}>
                <View>
                    <ThemedText content={"clear conf"} />
                </View>
            </TouchableNativeFeedback>
        </View>
        <ThemedText content={`\n\n${JSON.stringify(temp)}\n\n${JSON.stringify(config)}`} />
    </ScrollView >;
};
