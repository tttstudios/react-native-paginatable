import { StyleSheet } from 'react-native';

const ttt_lightGrey = '#c0c1c4'
const ttt_darkGrey = '#9f9fa0'

export default StyleSheet.create({
    defaultCell: {
        height: 120, 
        borderBottomColor: ttt_lightGrey, 
        borderBottomWidth: 1, 
        padding: 20
    },
    defaultCellText: {
        color: ttt_darkGrey
    },
    defaultCellHint: {
        color: ttt_darkGrey,
        fontSize: 12
    },
    defaultCellLogo: {
        width: 80, 
        height: 40, 
        tintColor: ttt_lightGrey, 
        alignSelf: 'flex-end', 
        marginTop: 10
    },
    defaultEmptyStatusContainer: {
        flex:1, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    defaultEmptyStatusLogo: { 
        width: '50%', 
        maxHeight: 100, 
        margin: 10, 
        tintColor: ttt_lightGrey
    }
})