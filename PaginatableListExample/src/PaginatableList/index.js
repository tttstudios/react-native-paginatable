import React, { Component } from 'react';
import { FlatList, RefreshControl, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PaginationStateManager from './PaginationStateManager';

class PaginatableList extends Component {
    static propTypes = {
        onRenderItem            : PropTypes.func,
        numColumns              : PropTypes.number,
        extraData               : PropTypes.extraData, //extraData is used to make sure Flatlist will rerender when the object that passed in changes. Otherwise, Flatlist acts as PureComponent.
        pageNumberKey           : PropTypes.string,
        pageSizeKey             : PropTypes.string,
        pageSize                : PropTypes.number,
        paginatableSourceUrl    : PropTypes.string, // This is the endpoint url that could take pageSize and pageNumber as query params.
        customizedPaginationStateManager       : PropTypes.instanceOf(PaginationStateManager),
        onLoadMore              : PropTypes.func, //If you need to handle loadMore on your own. For examplem, you might need to query with more parmas than pageNumber and pageSize. 
        onRefresh               : PropTypes.func, //If you need to handle refresh on your own.              
    }

    static defaultProps = {
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
    let reducerName = props.customizedPaginationStateManager.name
    return {
        items: state[reducerName] && state[reducerName].items || []
    }
};

const mapDispatchToProps = (dispatch) => ({
    dispatch
});

export { PaginationStateManager }
export default connect(mapStateToProps, mapDispatchToProps)(PaginatableList);
