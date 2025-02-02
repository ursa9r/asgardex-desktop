import React, { useCallback, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { PoolDetail } from '@xchainjs/xchain-midgard'
import { assetToString } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as P from 'fp-ts/lib/Predicate'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Network } from '../../../shared/api/types'
import { ProtocolLimit, IncentivePendulum } from '../../components/pool'
import { ManageButton } from '../../components/uielements/button'
import { Table } from '../../components/uielements/table'
import { useAppContext } from '../../contexts/AppContext'
import { useMayachainContext } from '../../contexts/MayachainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useMidgardMayaContext } from '../../contexts/MidgardMayaContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { getPoolTableRowsData, RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { MAYA_PRICE_POOL } from '../../helpers/poolHelperMaya'
import { useDex } from '../../hooks/useDex'
import { useIncentivePendulum } from '../../hooks/useIncentivePendulum'
import { usePoolCycle } from '../../hooks/usePoolCycle'
import { usePoolFilter } from '../../hooks/usePoolFilter'
import { usePoolWatchlist } from '../../hooks/usePoolWatchlist'
import { useProtocolLimit } from '../../hooks/useProtocolLimit'
import * as poolsRoutes from '../../routes/pools'
import { DEFAULT_NETWORK } from '../../services/const'
import { MayachainLastblockRD } from '../../services/mayachain/types'
import { PendingPoolsState, DEFAULT_POOL_FILTERS } from '../../services/midgard/types'
import { ThorchainLastblockRD } from '../../services/thorchain/types'
import { PoolTableRowData, PoolTableRowsData } from './Pools.types'
import {
  getBlocksLeftForPendingPoolAsString,
  getBlocksLeftForPendingPoolAsStringMaya,
  isEmptyPool
} from './Pools.utils'
import { filterTableData } from './Pools.utils'
import * as Shared from './PoolsOverview.shared'
import { TableAction, BlockLeftLabel } from './PoolsOverview.styles'
import * as Styled from './PoolsOverview.styles'

export const PendingPools: React.FC = (): JSX.Element => {
  const navigate = useNavigate()
  const intl = useIntl()
  const { dex } = useDex()
  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const {
    service: {
      pools: { pendingPoolsState$, reloadPendingPools, selectedPricePool$ }
    }
  } = useMidgardContext()
  const {
    service: {
      pools: {
        pendingPoolsState$: pendingPoolStateMaya$,
        reloadPendingPools: reloadPendingPoolsMaya,
        selectedPricePool$: selectedPricePoolMaya$
      }
    }
  } = useMidgardMayaContext()

  const { thorchainLastblockState$ } = useThorchainContext()
  const { mayachainLastblockState$ } = useMayachainContext()

  const { setFilter: setPoolFilter, filter: poolFilter } = usePoolFilter('pending')
  const { add: addPoolToWatchlist, remove: removePoolFromWatchlist, list: poolWatchList } = usePoolWatchlist()

  const poolsRD = useObservableState(dex === 'THOR' ? pendingPoolsState$ : pendingPoolStateMaya$, RD.pending)
  const thorchainLastblockRD: ThorchainLastblockRD = useObservableState(thorchainLastblockState$, RD.pending)
  const mayachainLastblockRD: MayachainLastblockRD = useObservableState(mayachainLastblockState$, RD.pending)

  const { reload: reloadLimit, data: limitRD } = useProtocolLimit()
  const { data: incentivePendulumRD } = useIncentivePendulum()

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  // store previous data of pending pools to render these while reloading
  const previousPools = useRef<O.Option<PoolTableRowsData>>(O.none)

  const { poolCycle, reloadPoolCycle } = usePoolCycle()

  const oNewPoolCycle = useMemo(() => FP.pipe(poolCycle, RD.toOption), [poolCycle])

  const refreshHandler = useCallback(() => {
    reloadPendingPools()
    reloadPendingPoolsMaya()
    reloadLimit()
    reloadPoolCycle()
  }, [reloadLimit, reloadPendingPools, reloadPendingPoolsMaya, reloadPoolCycle])

  const selectedPricePool = useObservableState(
    dex === 'THOR' ? selectedPricePool$ : selectedPricePoolMaya$,
    dex === 'THOR' ? RUNE_PRICE_POOL : MAYA_PRICE_POOL
  )

  const renderBtnPoolsColumn = useCallback(
    (_: string, { asset }: PoolTableRowData) => {
      return (
        <TableAction>
          <ManageButton className="min-w-[120px]" asset={asset} isTextView={isDesktopView} />
        </TableAction>
      )
    },
    [isDesktopView]
  )

  const btnPendingPoolsColumn: ColumnType<PoolTableRowData> = useMemo(
    () => ({
      key: 'btn',
      title: Shared.renderRefreshBtnColTitle({
        title: intl.formatMessage({ id: 'common.refresh' }),
        clickHandler: refreshHandler,
        iconOnly: !isDesktopView
      }),
      width: 200,
      render: renderBtnPoolsColumn
    }),
    [intl, refreshHandler, isDesktopView, renderBtnPoolsColumn]
  )

  const renderBlockLeftColumn = useCallback(
    (_: string, record: PoolTableRowData) => {
      const { deepest, asset } = record

      const blocksLeft: string = FP.pipe(
        thorchainLastblockRD,
        RD.map((lastblockItems) => getBlocksLeftForPendingPoolAsString(lastblockItems, asset, oNewPoolCycle)),
        RD.getOrElse(() => '--')
      )
      const blocksLeftMaya: string = FP.pipe(
        mayachainLastblockRD,
        RD.map((lastblockItems) => getBlocksLeftForPendingPoolAsStringMaya(lastblockItems, asset, oNewPoolCycle)),
        RD.getOrElse(() => '--')
      )

      return (
        <TableAction>
          <BlockLeftLabel>{deepest ? (dex === 'THOR' ? blocksLeft : blocksLeftMaya) : '--'}</BlockLeftLabel>
        </TableAction>
      )
    },
    [thorchainLastblockRD, mayachainLastblockRD, dex, oNewPoolCycle]
  )

  const blockLeftColumn: ColumnType<PoolTableRowData> = useMemo(
    () => ({
      key: 'blocks',
      title: intl.formatMessage({ id: 'pools.blocksleft' }),
      align: 'right',
      width: 80,
      render: renderBlockLeftColumn
    }),
    [renderBlockLeftColumn, intl]
  )

  const desktopPoolsColumns: ColumnsType<PoolTableRowData> = useMemo(
    () => [
      Shared.watchColumn(addPoolToWatchlist, removePoolFromWatchlist),
      Shared.poolColumn(intl.formatMessage({ id: 'common.pool' })),
      Shared.assetColumn(intl.formatMessage({ id: 'common.asset' })),
      Shared.priceColumn(intl.formatMessage({ id: 'common.price' }), selectedPricePool.asset),
      Shared.depthColumn(intl.formatMessage({ id: 'common.liquidity' }), selectedPricePool.asset),
      blockLeftColumn,
      btnPendingPoolsColumn
    ],
    [addPoolToWatchlist, removePoolFromWatchlist, intl, selectedPricePool.asset, blockLeftColumn, btnPendingPoolsColumn]
  )

  const mobilePoolsColumns: ColumnsType<PoolTableRowData> = useMemo(
    () => [
      Shared.poolColumnMobile(intl.formatMessage({ id: 'common.pool' })),
      Shared.assetColumn(intl.formatMessage({ id: 'common.asset' })),
      btnPendingPoolsColumn
    ],
    [btnPendingPoolsColumn, intl]
  )

  const renderPoolsTable = useCallback(
    (tableData: PoolTableRowData[], loading = false) => {
      const columns = isDesktopView ? desktopPoolsColumns : mobilePoolsColumns
      const dataSource = FP.pipe(tableData, filterTableData(poolFilter))

      return (
        <>
          <Styled.AssetsFilter setFilter={setPoolFilter} activeFilter={poolFilter} poolFilters={DEFAULT_POOL_FILTERS} />
          <ProtocolLimit limit={limitRD} />
          <IncentivePendulum incentivePendulum={incentivePendulumRD} />
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            rowKey="key"
            onRow={({ asset }: PoolTableRowData) => {
              return {
                onClick: () => {
                  navigate(poolsRoutes.detail.path({ asset: assetToString(asset) }))
                }
              }
            }}
          />
        </>
      )
    },
    [
      isDesktopView,
      desktopPoolsColumns,
      mobilePoolsColumns,
      poolFilter,
      setPoolFilter,
      limitRD,
      incentivePendulumRD,
      navigate
    ]
  )

  return (
    <>
      {RD.fold(
        // initial state
        () => renderPoolsTable([], true),
        // loading state
        () => {
          const pools = O.getOrElse(() => [] as PoolTableRowsData)(previousPools.current)
          return renderPoolsTable(pools, true)
        },
        // render error state
        Shared.renderTableError(intl.formatMessage({ id: 'common.refresh' }), refreshHandler),
        // success state
        ({ poolDetails }: PendingPoolsState): JSX.Element => {
          // filter out empty pools
          const poolDetailsFiltered = A.filter<PoolDetail>(P.not(isEmptyPool))(poolDetails)
          const poolViewData = getPoolTableRowsData({
            poolDetails: poolDetailsFiltered,
            pricePoolData: selectedPricePool.poolData,
            watchlist: poolWatchList,
            network
          })
          previousPools.current = O.some(poolViewData)
          return renderPoolsTable(poolViewData)
        }
      )(poolsRD)}
    </>
  )
}
