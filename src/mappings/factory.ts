import { FACTORY_ADDRESS, ONE_BI, WHITELIST_TOKENS } from '../utils/constants'
import { PoolCreated } from '../types/Factory/Factory'
import { Pool as PoolTemplate } from '../types/templates'
import { BigInt } from '@graphprotocol/graph-ts'
import { loadFactory, loadPool, loadToken } from '../utils/loaders'

export function handlePoolCreated(event: PoolCreated): void {
  // load factory
  let factory = loadFactory(FACTORY_ADDRESS)
  factory.poolCount = factory.poolCount.plus(ONE_BI)

  let pool = loadPool(event.params.pool.toHexString())
  let token0 = loadToken(event.params.token0.toHexString())
  let token1 = loadToken(event.params.token1.toHexString())
  token0.poolCount=token0.poolCount.plus(ONE_BI);
  token1.poolCount=token1.poolCount.plus(ONE_BI);
  // update white listed pools
  if (WHITELIST_TOKENS.includes(token0.id)) {
    let newPools = token1.whitelistPools
    newPools.push(pool.id)
    token1.whitelistPools = newPools
  }
  if (WHITELIST_TOKENS.includes(token1.id)) {
    let newPools = token0.whitelistPools
    newPools.push(pool.id)
    token0.whitelistPools = newPools
  }

  pool.token0 = token0.id
  pool.token1 = token1.id
  pool.feeTier = BigInt.fromI32(event.params.fee)
  pool.createdAtTimestamp = event.block.timestamp
  pool.createdAtBlockNumber = event.block.number
  pool.save()
  // create the tracked contract based on the template
  PoolTemplate.create(event.params.pool)
  token0.save()
  token1.save()
  factory.save()
}
