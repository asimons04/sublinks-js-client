"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SublinksHttp = void 0;
const API_VERSION = "1";
const cross_fetch_1 = require("cross-fetch");
/** Sublinks HTTP client.  Used internally by SublinksClient or can be imported directly */
class SublinksHttp {
    /**
     * SublinksHttp Client: Native API client for Sublinks.
     *
     * @param baseURL is a string in the form of 'https://instance.example.com'
     * @param options is an object used to provide additional options to the constructor.
    */
    constructor(baseURL, options) {
        this.fetchFunction = cross_fetch_1.fetch;
        this.baseURL = `${baseURL}/sublinks-api/v${API_VERSION}`;
        if (options === null || options === void 0 ? void 0 : options.fetchFunction)
            this.fetchFunction = options.fetchFunction;
        if (options === null || options === void 0 ? void 0 : options.headers)
            this.headers = options.headers;
    }
    /** Standard fetch wrapper for native API calls.
     *
     * FormDataType is the type definition for the `form` parameter data
     * ResponseType is the type definition to expect from the response.
     *
     * @param method    HTTP method to use for the call
     * @param endpoint  The relative API endpoint (e.g. /siteinfo -> https://{instance.com}/sublinks-api/v2/siteinfo)
     * @param form      The optional body payload for non-GET requests or key/values for GET query string params
    */
    call(method, endpoint, form = {}) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const url = new URL(this.baseURL);
            url.pathname += `/${endpoint}`;
            let response;
            let json;
            try {
                if (method == 'GET') {
                    if (form) {
                        let keys = Object.keys(form);
                        keys.forEach((key) => {
                            let value = form[key];
                            url.searchParams.set(key, value);
                        });
                    }
                    response = yield this.fetchFunction(url, {
                        method: method,
                        headers: this.headers,
                    });
                }
                else {
                    response = yield this.fetchFunction(url, {
                        method: method,
                        headers: Object.assign({ 'Content-Type': 'application/json' }, this.headers),
                        body: JSON.stringify(form)
                    });
                }
                if (response.ok) {
                    json = yield response.json();
                }
                else {
                    throw new Error((_a = response.statusText) !== null && _a !== void 0 ? _a : "Bad API response");
                }
            }
            catch (err) {
                throw new Error(err);
            }
            return json;
        });
    }
    /** Example method using the `call` wrapper to call the (non-existent) version endpoint */
    apiVersion() {
        return this.call("GET", '/version');
    }
    /** Convenience method to set the OAuth 2.0 `Authorization: Bearer {token}` header */
    setAuthToken(token) {
        this.setHeader("Authorization", `Bearer ${token}`);
    }
    /** Sets an individual header key to the provided value or removes the key from the headers if a value is not provided. */
    setHeader(key, value) {
        if (value)
            this.headers[key] = value;
        else if (this.headers[key])
            delete this.headers[key];
    }
}
exports.SublinksHttp = SublinksHttp;