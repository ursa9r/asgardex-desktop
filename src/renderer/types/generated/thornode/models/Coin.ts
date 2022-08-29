// tslint:disable
/**
 * Thornode API
 * Thornode REST API.
 *
 * The version of the OpenAPI document: 1.89.0
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * @export
 * @interface Coin
 */
export interface Coin {
    /**
     * @type {string}
     * @memberof Coin
     */
    asset: string;
    /**
     * @type {string}
     * @memberof Coin
     */
    amount: string;
    /**
     * @type {number}
     * @memberof Coin
     */
    decimals?: number;
}