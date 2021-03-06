import { urlencodeFormData } from '../modules/utils.js';
import config from './config.js';
import bus from './bus.js';

export class AjaxModule {
    static _fetch({
        url = '/',
        method = 'GET',
        body = null,
        headers = [['Content-Type', 'application/json;charset=UTF-8']],
    } = {}) {

        bus.emit('show-loader');
        if (url.includes('api')) {
            url = config.backendUrl + url;
        }

        return fetch(url, {
            method, // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            credentials: 'include',
            headers: headers, // "Content-Type": "application/x-www-form-urlencoded",
            body, // body data type must match "Content-Type" header
        })
            .then(response => {
                return new Promise((resolve, reject) => {
                    if (response.status === 200) {
                        response.json().then(data => resolve(data));
                    } else {
                        response.json().then(data => reject({'status': response.status, 'data': data}));
                    }
                });
            })
            .finally(() => bus.emit('hide-loader'));
    }

    static post({
        url,
        body,
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    } = {}) {
        return this._fetch({
            url,
            method: 'POST',
            body: urlencodeFormData(body),
            headers
        });
    }

    static patch({
        url,
        body,
        headers = []
    } = {}) {
        return this._fetch({
            url,
            method: 'PATCH',
            body,
            headers
        });
    }

    static get({url, headers} = {}) {
        return this._fetch({
            url,
            method: 'GET',
            headers
        });
    }

    static delete({url, headers} = {}) {
        return this._fetch({
            url,
            method: 'DELETE',
            headers
        });
    }
}
