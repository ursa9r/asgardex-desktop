import React, { useMemo, useCallback } from 'react'

import { validBNOrZero } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { getTickerFormat } from '../../../../helpers/stringHelper'
import { PriceDataIndex } from '../../../../services/midgard/types'
import { AssetPair } from '../../../../types/asgardex'
import CoinData from '../../coins/coinData'
import FilterMenu from '../../filterMenu'

const filterFunction = (item: AssetPair, searchTerm: string) => {
  const tokenName = O.toNullable(getTickerFormat(item.asset))
  return tokenName?.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0
}

type Props = {
  asset: string
  assetData: AssetPair[]
  priceIndex?: PriceDataIndex
  unit: string
  searchDisable: string[]
  withSearch: boolean
  onSelect: (value: string) => void
}

const AssetMenu: React.FC<Props> = (props: Props): JSX.Element => {
  const { assetData, asset, priceIndex = {}, unit, withSearch, searchDisable = [], onSelect = () => {} } = props

  const filteredData = useMemo(
    () =>
      assetData.filter((item) => {
        const tokenName = O.toNullable(getTickerFormat(item.asset))
        return tokenName?.toLowerCase() !== asset.toLowerCase()
      }),
    [assetData, asset]
  )

  const cellRenderer = useCallback(
    (data: AssetPair) => {
      const { asset } = data
      const key = asset || 'unknown-key'
      const tokenName = O.toUndefined(getTickerFormat(asset))

      const ticker = O.toNullable(getTickerFormat(asset))?.toUpperCase() ?? ''
      const price = validBNOrZero(priceIndex[ticker])

      const node = <CoinData asset={tokenName} price={price} priceUnit={unit} />
      return { key, node }
    },
    [priceIndex, unit]
  )

  const disableItemFilterHandler = useCallback(
    (item: AssetPair) => {
      const tokenName = O.toNullable(getTickerFormat(item.asset))?.toLowerCase()
      return searchDisable.indexOf(tokenName ?? '') > -1
    },
    [searchDisable]
  )

  return (
    <FilterMenu
      searchEnabled={withSearch}
      filterFunction={filterFunction}
      cellRenderer={cellRenderer}
      disableItemFilter={(a: AssetPair) => disableItemFilterHandler(a)}
      onSelect={onSelect}
      data={filteredData}
    />
  )
}

export default AssetMenu