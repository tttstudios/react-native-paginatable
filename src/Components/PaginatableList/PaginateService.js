import axios from 'axios';
import Config from 'react-native-config';

export default class PaginateService {
    static getItems({ pageNumber = 0, pageSize = 5, endpointUrl, ...args}) {
        if (__DEV__ && Object.keys(args).length > 0) console.tron.log(`Extra params used in PaginateService getItems() : ${JSON.stringify(args)}`)
        return axios({
            baseURL: Config.BASE_API_URL,
            url: endpointUrl,
            params : {
                _page: pageNumber,
                _limit: pageSize,
                ...args
            }
        });
    }
}