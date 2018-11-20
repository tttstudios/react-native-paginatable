import Reactotron, { networking } from 'reactotron-react-native'
import { reactotronRedux } from 'reactotron-redux'

Reactotron
    .configure()
    .use(reactotronRedux())
    .useReactNative(networking())
    .connect()

console.tron = Reactotron