/* eslint-disable react/react-in-jsx-scope */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { ScrollView, TouchableNativeFeedback } from 'react-native';

import { Ctx } from '../../app';
import { Col, ThemedText } from '../../components';
import { Config } from '../../context/config';
import { State } from '../../context/state';
import { Temp } from '../../context/temp';
import { api } from '../../data/api';

export const ADVANCED_KEY = 'Advanced';

export const Advanced = () => {
    const { state, setState, temp, setTemp, setConfig } = useContext(Ctx);

    return <ScrollView style={{ padding: 20, flex: 1 }}>
        <Col>
            <TouchableNativeFeedback onPress={async () => {
                const s = State.default();
                await State.save(s);
                setState(s);
            }}>
                <Col>
                    <ThemedText content={"clear state"} />
                </Col>
            </TouchableNativeFeedback>
        </Col>
        <Col>
            <TouchableNativeFeedback onPress={async () => {
                setTemp(Temp.default);
            }}>
                <Col>
                    <ThemedText content={"clear temp"} />
                </Col>
            </TouchableNativeFeedback>
        </Col>
        <Col>
            <TouchableNativeFeedback onPress={async () => {
                const c = Config.default();
                await Config.save(c);
                setConfig(c);
            }}>
                <Col>
                    <ThemedText content={"clear conf"} />
                </Col>
            </TouchableNativeFeedback>
        </Col>
        <Col>
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
                <Col>
                    <ThemedText content={"switch api, current: " + state.api.name} />
                </Col>
            </TouchableNativeFeedback>
        </Col>
        <Col>
            <TouchableNativeFeedback onPress={async () => {
                await AsyncStorage.clear();
            }}>
                <Col>
                    <ThemedText content={"clear all cache"} />
                </Col>
            </TouchableNativeFeedback>
        </Col>
    </ScrollView >;
};
