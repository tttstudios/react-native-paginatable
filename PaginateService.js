import axios from 'axios';

export default class PaginateService {
    static getItems({ pageNumberKey, pageSizeKey, pageNumber = 0, pageSize = 5, endpointUrl, ...args}) {
        if (__DEV__ && Object.keys(args).length > 0) console.log(`Extra params used in PaginateService getItems() : ${JSON.stringify(args)}`)
        var params = {
            ...args
        }
        if (pageNumberKey) {
            params[pageNumberKey] = pageNumber
        }
        if (pageSizeKey) {
            params[pageSizeKey] = pageSize
        }

        return axios({
            url: endpointUrl,
            params
        });
    }
}