/* eslint-disable react/react-in-jsx-scope */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { ScrollView, TouchableNativeFeedback, View } from 'react-native';

import { Ctx } from '../../app';
import { Config } from '../../context/config';
import { State } from '../../context/state';
import { Temp } from '../../context/temp';
import { api } from '../../data/api';
import { ThemedText } from '../../utils';

export const ADVANCED_KEY = 'Advanced';

export const Advanced = () => {
    const { state, setState, temp, setTemp, setConfig } = useContext(Ctx);

    return <ScrollView style={{ padding: 20, flex: 1 }}>
        <View>
            <TouchableNativeFeedback onPress={async () => {
                const s = State.default();
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
                const c = Config.default();
                await Config.save(c);
                setConfig(c);
            }}>
                <View>
                    <ThemedText content={"clear conf"} />
                </View>
            </TouchableNativeFeedback>
        </View>
        <View>
            <TouchableNativeFeedback onPress={async () => {
                State.save(state);

                let newState;
                if (state.api.name === api.chan.name) {
                    newState = await State.restore(api.ciano);
                }
                else {
                    newState = await State.restore(api.chan);
                }
                await State.save(newState);
                setState(newState);
                setTemp(Temp.switchApi(temp));
            }}>
                <View>
                    <ThemedText content={"switch api, current: " + state.api.name} />
                </View>
            </TouchableNativeFeedback>
        </View>
        <View>
            <TouchableNativeFeedback onPress={async () => {
                await AsyncStorage.clear();
            }}>
                <View>
                    <ThemedText content={"clear all cache"} />
                </View>
            </TouchableNativeFeedback>
        </View>
    </ScrollView >;
};
