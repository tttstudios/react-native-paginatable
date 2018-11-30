import { StyleSheet } from 'react-native';

const ttt_blue = '#5B93C3'
const ttt_white = '#FFFFFF'
const ttt_grey = '#4D4D4F'

export default styles = StyleSheet.create({
    cellButton: {
        height: 100, 
        borderBottomColor: ttt_blue, 
        borderBottomWidth: 1, 
        padding: 5, 
        paddingHorizontal: 10
    },
    cellLogo: {
        width: 80, 
        height: 40, 
        alignSelf: 'flex-end'
    }
})