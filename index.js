import React, { Component } from 'react';
import { FlatList, RefreshControl, View, Text, Image } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PaginationStateManager from './PaginationStateManager';
import style from './style';

class PaginatableList extends Component {
    static propTypes = {
        onRenderItem            : PropTypes.func,
        onRenderEmptyStatus     : PropTypes.func,
        numColumns              : PropTypes.number,
        extraData               : PropTypes.object, //extraData is used to make sure Flatlist will rerender when the object that passed in changes. Otherwise, Flatlist acts as PureComponent.
        keyExtractor            : PropTypes.func,
        pageNumberKey           : PropTypes.string,
        pageNumberStartFrom     : PropTypes.number,
        pageSizeKey             : PropTypes.string,
        pageSize                : PropTypes.number,
        paginatableSourceUrl    : PropTypes.string, // This is the endpoint url that could take pageSize and pageNumber as query params.
        customizedPaginationStateManager       : PropTypes.instanceOf(PaginationStateManager),
        onLoadMore              : PropTypes.func, //If you need to handle loadMore on your own. For examplem, you might need to query with more parmas than pageNumber and pageSize. 
        onRefresh               : PropTypes.func, //If you need to handle refresh on your own.
        onLoadError             : PropTypes.func,
        headers                 : PropTypes.object, //Headers required for making API call.              
    }

    static defaultProps = {
        numColumns      : 1,
        pageSize        : 5,
    }

    state = {
        pageNumber: 0,
        isRefreshing: false
    }

    renderItem = ({ index, item }) => {
        return (
            <View style={style.defaultCell}>
                <Text style={style.defaultCellText}>{`Item ${index}`}</Text>
                <Text style={style.defaultCellHint}>Use 'onRenderItem' props to overwrite the default cell.</Text>
                <Image style={style.defaultCellLogo} resizeMode={'contain'} source={require('./assets/TTTLogo_white.png')} />
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
        this.onLoadMore({ pageNumber: this.props.pageNumberStartFrom || 0 })
    }

    onLoadMore = ({ pageNumber }) => {
        const { pageNumberKey, pageSizeKey, pageSize, headers } =  this.props
        if (this.props.onLoadMore) {
            this.props.onLoadMore({ headers, pageNumberKey, pageSizeKey, pageNumber, pageSize })
        } else {
            this.props.dispatch(this.paginationStateManager.loadMore({ headers, pageNumberKey, pageSizeKey, pageNumber, pageSize }, this.onCompleteLoadingMore, this.onLoadError))
        }
    }

    onRefresh = () => {
        const { pageNumberKey, pageSizeKey, pageSize, headers } =  this.props
        this.setState({
            pageNumber: 1,
            isRefreshing: true
        }, () => {
            if (this.props.onRefresh) {
                this.props.onRefresh({ onCompleteRefreshing: this.onCompleteRefreshing, headers, pageNumberKey, pageSizeKey, pageSize })
            } else {
                this.props.dispatch(this.paginationStateManager.refresh({ headers, pageNumberKey, pageSizeKey, pageSize }, this.onCompleteRefreshing, this.onLoadError))
            }
        })
    }

    onCompleteLoadingMore = () => {
        if (__DEV__) console.log('Load More Items Completed')
    }

    onCompleteRefreshing = () => {
        this.setState({ isRefreshing: false })
    }

    onLoadError = (error) => {
        if (this.props.onLoadError) {
            this.props.onLoadError(error)
        }
    }

    keyExtractor = (item, index) => item.id;

    renderList = () => {
        return (
            <FlatList
                data={this.props.items || []}
                keyExtractor={this.props.keyExtractor || undefined}
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

    renderEmptyStatus = () => {
        if (this.props.onRenderEmptyStatus) {
            return this.props.onRenderEmptyStatus()
        }
        return (
            <View style={style.defaultEmptyStatusContainer}>
                <Image style={style.defaultEmptyStatusLogo} resizeMode={'contain'} source={require('./assets/TTTLogo_white.png')} />
                <Text style={style.defaultCellText}>There is no items in the list.</Text>
            </View>
        )
    }

    render() {
        if (this.props.items && this.props.items.length > 0) {
            return this.renderList()
        }
        return this.renderEmptyStatus()
    }
}

const mapStateToProps = (state, props) => {
    let reducerName = props.customizedPaginationStateManager.name
    var items = []
    if (props.customizedPaginationStateManager.customizedReducerPath) {
        var parentPath = props.customizedPaginationStateManager.customizedReducerPath.replace(/\s/g,'')
        if (parentPath && parentPath !== '') {
            pathPartials = parentPath.split('.')
            if (pathPartials.length > 0) {
                var targetObj = null
                pathPartials.filter(partial => partial && partial !== '').map((partial, index) => {
                    if (index === 0) {
                        targetObj = state[partial]
                    } else {
                        targetObj = targetObj[partial]
                    }
                })
                if (targetObj) {
                    items = targetObj.items || []
                }
                return { items }
            }
        } else {
            return {items}
        }
        return {items}
    }
    items = state[reducerName] && state[reducerName].items || []
    return {items}
};

const mapDispatchToProps = (dispatch) => ({
    dispatch
});

export { PaginationStateManager }
export default connect(mapStateToProps, mapDispatchToProps)(PaginatableList);
