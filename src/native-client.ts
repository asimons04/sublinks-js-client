const API_VERSION = "1"

// Import types
import { HeadersObject} from './types/HeadersObject'
import { HttpClientConstructorOptions } from './types/HttpClientConstructorOptions'
import { HTTPVerb } from './types/HTTPVerb'
import { StatusResponse } from './types/StatusResponse'

import fetch from 'cross-fetch';

/**
 * Sublinks HTTP client.  Used internally by the exported SublinksClient
*/
export class SublinksHttp {
    baseURL: string
    headers: HeadersObject
    fetchFunction = fetch

    /**
     * SublinksHttp Client: Native API client for Sublinks.
     * 
     * @param baseURL is a string in the form of 'https://instance.example.com'
     * @param options is an object used to provide additional options to the constructor.
    */

    constructor(baseURL: string, options?:HttpClientConstructorOptions) {
        this.baseURL = `${baseURL}/sublinks-api/v${API_VERSION}`;
        
        if (options?.fetchFunction) this.fetchFunction = options.fetchFunction;
        if (options?.headers)       this.headers = options.headers
    }

    /**
     * Standard fetch wrapper for native API calls. 
     * 
     * @type BodyType is the type definition for the `form` parameter data
     * @type ResponseType is the type definition to expect from the response.
     * 
     * @param method    HTTP verb to use
     * @param endpoint  The relative API endpoint (e.g. /siteinfo -> https://{instance.com}/sublinks-api/v2/siteinfo)
     * @param form      The optional body payload for non-GET requests or key/values for GET query string params
    */
    async call<BodyType extends object, ResponseType> (method: HTTPVerb, endpoint: string, form: BodyType = {} as BodyType): Promise<ResponseType> {
        const url = new URL(this.baseURL);
        url.pathname += `/${endpoint}`;
        
        let response: Response 
        let json: any
        
        try {
            if (method == 'GET') {
                if (form) {
                    let keys = Object.keys(form);
                    keys.forEach((key:string) => {
                        let value:string = (form as any)[key];
                        url.searchParams.set(key, value)
                    })
                }

                response = await this.fetchFunction(url, {
                    method: method,
                    headers: this.headers,
                });
            }
            else {
                response = await this.fetchFunction(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...this.headers,
                    },
                    body: JSON.stringify(form)
                });

            }

            if (response.ok) {
                json = await response.json();
            }
            else {
                throw new Error(response.statusText ?? "Bad API response");
            }
        }

        catch (err) {
            throw new Error(err);
        }

        return json;
    }


    /**
    * Convenience method to set the OAuth 2.0 `Authorization: Bearer {token}` header
    */
    setAuthToken(token: string): void {
        this.setHeader("Authorization", `Bearer ${token}`);
    }

    /**
    * Sets an individual header key to the provided value or removes the key from the headers if a value is not provided.
    */
     setHeader(key:string, value?:string): void {
        if (value) this.headers[key] = value;
        else if (this.headers[key]) delete this.headers[key];
    }
    



}