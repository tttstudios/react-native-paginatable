import React, { Component } from 'react';
import { FlatList, RefreshControl, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PaginationStateManager from './PaginationStateManager';

const defaultReducerName = 'dynamic'

class PaginatableList extends Component {
    static propTypes = {
        onRenderItem            : PropTypes.func,
        numColumns              : PropTypes.number,
        extraData               : PropTypes.extraData, //extraData is used to make sure Flatlist will rerender when the object that passed in changes. Otherwise, Flatlist acts as PureComponent.
        pageNumberKey           : PropTypes.string,
        pageSizeKey             : PropTypes.string,
        pageSize                : PropTypes.number,

        reducerName             : PropTypes.string,
        /* This prop is used as the key to store the items in this list in redux store. 
            Please make sure differnt reducerName is used when you have multiple PaginatableList components in use. */
        paginatableSourceUrl    : PropTypes.string, // This is the endpoint url that could take pageSize and pageNumber as query params.
        
        customizedPaginationStateManager       : PropTypes.instanceOf(PaginationStateManager),
        /* If customizedPaginationStateManager props is provided. The reducerName and paginatableSourceUrl are not required anymore. */
        injectReducer           : PropTypes.bool, //If injectReducer is true, the component will inject the reducer for you. Otherwise, you either inject the reducer outside of the component or predefined it already in the combineReducers() function.
        onLoadMore              : PropTypes.func, //If you need to handle loadMore on your own. For examplem, you might need to query with more parmas than pageNumber and pageSize. 
        onRefresh               : PropTypes.func, //If you need to handle refresh on your own.              
    }

    static defaultProps = {
        reducerName     : defaultReducerName,
        numColumns      : 1,
        pageNumberKey   : '_page',
        pageSizeKey     : '_limit'
    }

    state = {
        pageNumber: 1,
        isRefreshing: false
    }

    renderItem = ({ index, item }) => {
        return (
            <View style={{ height: 20 }}>
                <Text>{`Item ${index}`}</Text>
            </View>
        )
    }

    componentWillMount() {
        this.configureReducer()
        this.onLoad()
    }

    configureReducer() {
        if (this.props.customizedPaginationStateManager) {
            this.paginationStateManager = this.props.customizedPaginationStateManager
            
            if (this.props.injectReducer) {
                this.paginationStateManager.linkToReduxStore()
            }
        } else {
            this.paginationStateManager = new PaginationStateManager(this.props.reducerName, this.props.paginatableSourceUrl)
            this.paginationStateManager.linkToReduxStore()
        }
    }

    onReachedListEnd = () => {
        this.setState({
            pageNumber: this.state.pageNumber + 1
        }, () => {
            this.onLoadMore({ pageNumber: this.state.pageNumber })
        })
    }

    onLoad = () => {
        this.onLoadMore({ pageNumber: 1 })
    }

    onLoadMore = ({ pageNumber }) => {
        const { pageNumberKey, pageSizeKey, pageSize } =  this.props
        if (this.props.onLoadMore) {
            this.props.onLoadMore({ pageNumberKey, pageSizeKey, pageNumber, pageSize })
        } else {
            this.props.dispatch(this.paginationStateManager.loadMore({ pageNumberKey, pageSizeKey, pageNumber, pageSize }))
        }
    }

    onRefresh = () => {
        const { pageNumberKey, pageSizeKey, pageSize } =  this.props
        this.setState({
            pageNumber: 1,
            isRefreshing: true
        }, () => {
            if (this.props.onRefresh) {
                this.props.onRefresh({ onCompleteRefreshing: this.onCompleteRefreshing, pageNumberKey, pageSizeKey, pageSize })
            } else {
                this.props.dispatch(this.paginationStateManager.refresh({ pageNumberKey, pageSizeKey, pageSize }, this.onCompleteRefreshing))
            }
        })
    }

    onCompleteRefreshing = () => {
        this.setState({ isRefreshing: false })
    }

    render() {
        return (
            <FlatList
                data={this.props.items || []}
                extraData={this.props.extraData || undefined}
                renderItem={this.props.onRenderItem || this.renderItem}
                onEndReached={this.onReachedListEnd}
                onEndReachedThreshold={0.5}
                numColumns={this.props.numColumns}
                refreshControl={
                    <RefreshControl onRefresh={this.onRefresh} refreshing={this.state.isRefreshing}/>
                }
            />
        )
    }
}

const mapStateToProps = (state, props) => {
    let reducerName = props.customizedPaginationStateManager ? props.customizedPaginationStateManager.name : (props.reducerName || defaultReducerName)
    return {
        items: state[reducerName] && state[reducerName].items || []
    }
};

const mapDispatchToProps = (dispatch) => ({
    dispatch
});

export default connect(mapStateToProps, mapDispatchToProps)(PaginatableList);