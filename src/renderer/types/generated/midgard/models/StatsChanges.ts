// tslint:disable
/**
 * Midgard Public API
 * The Midgard Public API queries THORChain and any chains linked via the Bifröst and prepares information about the network to be readily available for public users. The API parses transaction event data from THORChain and stores them in a time-series database to make time-dependent queries easy. Midgard does not hold critical information. To interact with BEPSwap and Asgardex, users should query THORChain directly.
 *
 * The version of the OpenAPI document: 0.8.0
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * @export
 * @interface StatsChanges
 */
export interface StatsChanges {
    /**
     * Count of buy swaps
     * @type {number}
     * @memberof StatsChanges
     */
    buyCount?: number;
    /**
     * Sum of \"rune_amount\" of buy swap events
     * @type {string}
     * @memberof StatsChanges
     */
    buyVolume?: string;
    /**
     * Determining end height of current time bucket
     * @type {number}
     * @memberof StatsChanges
     */
    endHeight?: number;
    /**
     * Count of sell swaps
     * @type {number}
     * @memberof StatsChanges
     */
    sellCount?: number;
    /**
     * Sum of \"rune_amount\" of sell swap events
     * @type {string}
     * @memberof StatsChanges
     */
    sellVolume?: string;
    /**
     * Count of stake events
     * @type {number}
     * @memberof StatsChanges
     */
    stakeCount?: number;
    /**
     * Determining start height of current time bucket
     * @type {number}
     * @memberof StatsChanges
     */
    startHeight?: number;
    /**
     * Determining end of current time bucket in unix timestamp
     * @type {number}
     * @memberof StatsChanges
     */
    time?: number;
    /**
     * Total deficit of all pools in the current time bucket
     * @type {string}
     * @memberof StatsChanges
     */
    totalDeficit?: string;
    /**
     * Total reward of all pools in the current time bucket
     * @type {string}
     * @memberof StatsChanges
     */
    totalReward?: string;
    /**
     * Total rune depth of all pools at the end of current time bucket
     * @type {string}
     * @memberof StatsChanges
     */
    totalRuneDepth?: string;
    /**
     * buyVolume + sellVolume
     * @type {string}
     * @memberof StatsChanges
     */
    totalVolume?: string;
    /**
     * Count of withdraw events
     * @type {number}
     * @memberof StatsChanges
     */
    withdrawCount?: number;
}