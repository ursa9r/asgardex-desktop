import * as RD from '@devexperts/remote-data-ts'
import { baseAmount, assetFromString } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../shared/mock/assets'
import { AssetsWithBalanceRD } from '../services/wallet/types'
import { getAssetAmountByAsset, getBnbAmountFromBalances, getAssetWBByAsset } from './walletHelper'

describe('walletHelper', () => {
  const RUNE_WB = { amount: baseAmount('12300000000'), asset: ASSETS_TESTNET.RUNE, frozenAmount: O.none }
  const BNB = O.fromNullable(assetFromString('BNB.BNB'))
  const BOLT_WB = { amount: baseAmount('23400000000'), asset: ASSETS_TESTNET.BOLT, frozenAmount: O.none }
  const BNB_WB = { amount: baseAmount('45600000000'), asset: ASSETS_TESTNET.BNB, frozenAmount: O.none }

  describe('amountByAsset', () => {
    it('returns amount of RUNE', () => {
      const result = getAssetAmountByAsset([RUNE_WB, BOLT_WB, BNB_WB], ASSETS_TESTNET.RUNE)
      expect(result.amount().toNumber()).toEqual(123)
    })
    it('returns 0 for an unknown asset', () => {
      const result = getAssetAmountByAsset([RUNE_WB, BNB_WB], ASSETS_TESTNET.FTM)
      expect(result.amount().toNumber()).toEqual(0)
    })
    it('returns 0 for an empty list of assets', () => {
      const result = getAssetAmountByAsset([], ASSETS_TESTNET.FTM)
      expect(result.amount().toNumber()).toEqual(0)
    })
  })

  describe('getAssetWBByAsset', () => {
    it('returns amount of BNB', () => {
      const assetsRD: AssetsWithBalanceRD = RD.success([RUNE_WB, BOLT_WB, BNB_WB])
      const result = O.toNullable(getAssetWBByAsset(assetsRD, BNB))
      expect(result?.asset.symbol).toEqual('BNB')
      expect(result?.amount.amount().toString()).toEqual('45600000000')
    })
    it('returns none if BNB is not available', () => {
      const assetsRD: AssetsWithBalanceRD = RD.success([RUNE_WB, BOLT_WB])
      const result = getAssetWBByAsset(assetsRD, BNB)
      expect(result).toBeNone()
    })
  })

  describe('getBnbAmountFromBalances', () => {
    it('returns amount of BNB', () => {
      const result = getBnbAmountFromBalances([RUNE_WB, BOLT_WB, BNB_WB])
      expect(
        FP.pipe(
          result,
          // Check transformation of `AssetAmount` to `BaseAmount`
          O.map((a) => a.amount().isEqualTo('456')),
          O.getOrElse(() => false)
        )
      ).toBeTruthy()
    })
    it('returns none if no BNB is available', () => {
      const result = getBnbAmountFromBalances([RUNE_WB, BOLT_WB])
      expect(result).toBeNone()
    })
  })
})