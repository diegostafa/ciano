import React from "react";
import { Modal, View } from "react-native";

export const Gallery = ({ images }) => {
    const [visible, setVisible] = React.useState(true);

    return <Modal
        visible={visible}
        transparent
        onRequestClose={() => { setVisible(false) }}
        onBackdropPress={() => { setVisible(false) }}>
        <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <View
                style={{
                    maxHeight: '80%',
                    borderColor: 'gray',

                }} />
        </View>
    </Modal >;
};