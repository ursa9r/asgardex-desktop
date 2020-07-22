// tslint:disable
/**
 * Midgard Public API
 * The Midgard Public API queries THORChain and any chains linked via the Bifröst and prepares information about the network to be readily available for public users. The API parses transaction event data from THORChain and stores them in a time-series database to make time-dependent queries easy. Midgard does not hold critical information. To interact with BEPSwap and Asgardex, users should query THORChain directly.
 *
 * The version of the OpenAPI document: 1.0.0-oas3
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * @export
 * @interface StakersAddressData
 */
export interface StakersAddressData {
    /**
     * @type {Array<string>}
     * @memberof StakersAddressData
     */
    poolsArray?: Array<string>;
    /**
     * Total value of earnings (in RUNE) across all pools.
     * @type {string}
     * @memberof StakersAddressData
     */
    totalEarned?: string;
    /**
     * Average of all pool ROIs.
     * @type {string}
     * @memberof StakersAddressData
     */
    totalROI?: string;
    /**
     * Total staked (in RUNE) across all pools.
     * @type {string}
     * @memberof StakersAddressData
     */
    totalStaked?: string;
}