import { StyleSheet } from 'react-native'

const ttt_blue = '#5B93C3'

export default (styles = StyleSheet.create({
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
	},
	emptyStatusLogo: {
		width: 160,
		height: 80,
		alignSelf: 'flex-end',
		marginTop: 10
	}
}))
