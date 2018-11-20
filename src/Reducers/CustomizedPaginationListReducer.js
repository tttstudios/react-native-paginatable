import PaginationStateManager from '@Components/PaginatableList/PaginationStateManager';

export default class CustomizedPaginationStateManager extends PaginationStateManager {
    constructor(name, url) {
        super(name, url)
    }

    highlightItem = ({ index, extra }) => {
        console.tron.log('Overwrite Default highlightItem() function. For example, you might need to do network call before dispatch an action.')
        return (dispatch) => {
            dispatch(this.actions.highlightItem(index, extra))
        }
    }; /* If you do not overwrite the default generated highlightItem(), 
    the default highlightItem() method will just dispatch the action directly 
    with the same params that you used while calling highlightItem() for a PaginationStateManager instance. */
}

export const customizedPaginationStateManager = new CustomizedPaginationStateManager('users', 'users')

customizedPaginationStateManager.addActions([
    {
        type: 'highlightItem',
        payload: ['index', 'extra'],
        handler: (state, { index, extra }) => {
            return {
                ...state,
                highlightedItemIndex: index,
                extra: extra
            }   
        }
    }
])

export const reducer = customizedPaginationStateManager.reducer()


