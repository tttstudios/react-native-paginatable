#PaginatableList

The PaginatableListView is a wrapper build on top of React Native FlatList that make the list capable of doing pagination on its own.

##Installation
1. `yarn add @twotalltotems/paginatable-list`
2. Add dependencies of `react-redux`, `prop-types`, `axios`, `react-native-config`, and `reduxsauce`.

##Basic Usage

####Initialize PaginationStateManager Instance

In order to use `PaginatableList`, first create a PaginationStateManager instance. The two required pramas are the `key` in redux store that will be used to store list items, and the `endpoint url` respectively.

```
import { PaginationStateManager } from '@twotalltotems/paginatable-list';

const paginationStateManager = new PaginationStateManager('users', 'users');

```
1. The first param `users` is the key that will be used to store list item in the redux store. 
2. The second param `users` is the paginatable endpoint url. In this example, the full api endpoint is `http://localhost:3000/users`, and the `base url`, which is `http://localhost:3000`, is store in `.env` config file. 

####Link Redux Store

```
import { combineReducers, applyMiddleware, compose} from 'redux';
import Reactotron from 'reactotron-react-native'

const getCombinedReducers = () => {
    return combineReducers({
        users : paginationStateManager.reducer(), //'users' should be kept the same as the first param in PaginationStateManager instance created in the last step.
    });
}

const reduxStore = Reactotron.createStore(
	getCombinedReducers(),
	{}, //Initial State of Redux Store
	compose(
		applyMiddleware(ReduxThunk)
	)
)
```
*Notice: The key used in `combineReducers` need to be consistant with the key that is used to initialize `PaginationStateManager` in the last step, which is `users` in this example.*

####Use PaginatableList Component

```
render() {
    return (
        <View style={{ flex:1 }}>
            <PaginatableList
                onRenderItem={this.renderListItem}
                customizedPaginationStateManager={paginationStateManager}
            />
        </View>
    )
}

renderListItem = ({ index, item }) => {
    return (
        <TouchableOpacity>
            <Text>User ID:{item.id}</Text>
            <Text>Email: {item.email}</Text>
        </TouchableOpacity>
    )
}
```
1. `renderListItem` is used to render specific list item. PaginatableList exists as the scrollable container of the list items that will complete the two most common operations, loading more items and pull-to-refresh, for you. With this in mind, you can use this PaginatableList container to holder whatever you prefer. It could be `View`, `TouchableOpacity`, or your customized component.
2. In this example, `renderListItem` params `item` is the object within the array that is stored in redux store. Currently, `PaginationStateManager` is storing whatever the server response. In this example, local server is return an array of objects, and each object contains `id`, `email`, and `password`. Therefore, redux store is storing by default the exact same format of the object.


###Customization

If you need more than loading more items, and pull-to-refresh, continue reading.

For many lists in actual situations, we need more than only the two common operations for the list. Example of the extra operations could be click to like an item, delete an item, or highlight an item. We will exmplain the customization with an highlighting item as example.

####Subclass PaginationStateManager

To customize, first subclassing from `PaginatableListReducer`.

```
import { PaginationStateManager } from '@twotalltotems/paginatable-list';

export default class CustomizedPaginationStateManager extends PaginationStateManager {
    constructor(name, url) {
        super(name, url)
    }
}
```

####Add Extra Action
Initialize instance of CustomizedPaginationStateManager, and add extra action to it.

```
export const customizedPaginationStateManager = new CustomizedPaginationStateManager('customized_users', 'users')

customizedPaginationStateManager.addActions([
    {
        type: 'highlightItem',
        payload: ['index'],
        handler: (state, { index }) => {
            return {
                ...state,
                highlightedItemIndex: index
            }  
        }
    }
])
```

####Dispatch The Extra Action

First, let's make the list item clickable, and make it call `onHighlightItem` when the item is clicked.
```
renderListItem = ({ index, item }) => {
    return (
        <TouchableOpacity 
       		onPress={() => {
                this.onHighlightItem(index) 
            	}}
        >
            	<Text>User ID:{item.id}</Text>
            	<Text>Email: {item.email}</Text>
        </TouchableOpacity>
    )
}

onHighlightItem = (index) => {
    this.props.dispatch(customizedPaginationStateManager.highlightItem({ index: index }))
}
```

```
render() {
    return (
        <UserListComponent
           	paginatableListReducer={customizedPaginationStateManager}
            	onHighlightItem={this.onHighlightItem}
        />
    )
}
   
```

#### Overwrite the Extra Action Handler

Whenever you add extra actions to the subclass instance of `PaginationStateManager`, this lib will generate a default handler for you which will dispatch the action directly for you. However, if you would like to do more before dispatching the action, for example, make an API call, you can overwrite the default handler. 
  
```
import { PaginationStateManager } from '@twotalltotems/paginatable-list';

export default class CustomizedPaginationStateManager extends PaginationStateManager {
    constructor(name, url) {
        super(name, url)
    }

    highlightItem = ({ index, extra }) => {
        console.tron.log('Overwrite Default highlightItem() function. For example, you might need to do network call before dispatch an action.')
        // This is where you could add the API call.
        return (dispatch) => {
            dispatch(this.actions.highlightItem(index, extra))
        }
    }; 
}
```
