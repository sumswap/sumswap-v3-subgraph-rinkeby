import { EACAggregatorProxy } from '../types/Factory/EACAggregatorProxy';
import { DAI_ADDRESS, ETH_USD_PRICE_ADDRESS, MINIMUM_ETH_LOCKED, N12_BD_P, ONE_BD, Q192_BD, USDC_ADDRESS, USDC_WETH_POOL, USDT_ADDRESS, WETH_ADDRESS, WHITELIST_TOKENS, ZERO_BD, ZERO_BI } from './constants'
import { Bundle, Token } from '../types/schema'
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { exponentToBigDecimal, safeDiv } from './index'
import { loadBundle, loadPool, loadToken } from './loaders'

export function sqrtPriceX96ToTokenPrices(sqrtPriceX96: BigInt, token0: Token, token1: Token): BigDecimal[] {
  let num = sqrtPriceX96.times(sqrtPriceX96).toBigDecimal()
  let price1 = safeDiv(num.times(exponentToBigDecimal(token0.decimals)),exponentToBigDecimal(token1.decimals).times(Q192_BD));
  let price0 = safeDiv(ONE_BD, price1)
  return [price0, price1]
}

// weird blocks https://explorer.offchainlabs.com/tx/0x1c295207effcdaa54baa7436068c57448ff8ace855b8d6f3f9c424b4b7603960

export function getBundleEthPriceUSD(bundle:Bundle):BigDecimal {
     if(bundle.ethPriceUSD.ge(N12_BD_P)){
       return bundle.ethPriceUSD;
     }
     bundle.ethPriceUSD=getEthPriceInUSD();
     bundle.save();
     return bundle.ethPriceUSD;
}

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let usdcPool = loadPool(USDC_WETH_POOL) // usdc is token1
  // need to only count ETH as having valid USD price if lots of ETH in pool
  if (usdcPool !== null && usdcPool.totalValueLockedToken0.gt(MINIMUM_ETH_LOCKED) && usdcPool.token1Price.ge(N12_BD_P)) {
    return usdcPool.token1Price
  } else {
    return getEthPriceInUSDFromOracle();
  }
}

export function getEthPriceInUSDFromOracle():BigDecimal{
    const contract=EACAggregatorProxy.bind(Address.fromString(ETH_USD_PRICE_ADDRESS));
    const decimalsResult=contract.try_decimals();
    const decimals=decimalsResult.reverted ? BigInt.fromI32(8) : BigInt.fromI32(decimalsResult.value);
    const priceResult=contract.try_latestAnswer();
    if(!priceResult.reverted){
      return safeDiv(priceResult.value.toBigDecimal(),exponentToBigDecimal(decimals));
    }
    return ZERO_BD;
}

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token, ethPriceUSD:BigDecimal): BigDecimal {
  if (token.id == WETH_ADDRESS) {
    return ONE_BD
  }

  let whiteList = token.whitelistPools
  // for now just take USD from pool with greatest TVL
  // need to update this to actually detect best rate based on liquidity distribution
  let largestLiquidityETH = ZERO_BD
  let priceSoFar = ZERO_BD
  for (let i = 0; i < whiteList.length; ++i) {
    let poolAddress = whiteList[i]
    let pool = loadPool(poolAddress)
    if (pool.liquidity.gt(ZERO_BI)) {
      if (pool.token0 == token.id) {
        // whitelist token is token1
        let token1 = loadToken(pool.token1)
        // get the derived ETH in pool
        let ethLocked = pool.totalValueLockedToken1.times(token1.derivedETH)
        if (ethLocked.gt(largestLiquidityETH) && ethLocked.gt(MINIMUM_ETH_LOCKED)) {
          largestLiquidityETH = ethLocked
          // token1 per our token * Eth per token1
          priceSoFar = pool.token1Price.times(token1.derivedETH as BigDecimal)
        }
      }
      if (pool.token1 == token.id) {
        let token0 = loadToken(pool.token0)
        // get the derived ETH in pool
        let ethLocked = pool.totalValueLockedToken0.times(token0.derivedETH)
        if (ethLocked.gt(largestLiquidityETH) && ethLocked.gt(MINIMUM_ETH_LOCKED)) {
          largestLiquidityETH = ethLocked
          // token0 per our token * ETH per token0
          priceSoFar = pool.token0Price.times(token0.derivedETH as BigDecimal)
        }
      }
    }
  }

  if(priceSoFar.lt(N12_BD_P)){
    if(token.id == USDC_ADDRESS){
      return safeDiv(ONE_BD,ethPriceUSD);
    }
  
    if(token.id == USDT_ADDRESS){
      return safeDiv(ONE_BD,ethPriceUSD);
    }
  
    if(token.id == DAI_ADDRESS){
      return safeDiv(ONE_BD,ethPriceUSD);
    }
  }
  
  return priceSoFar // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedAmountUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let bundle = loadBundle('1')
  let price0USD = token0.derivedETH.times(getBundleEthPriceUSD(bundle))
  let price1USD = token1.derivedETH.times(getBundleEthPriceUSD(bundle))

  // both are whitelist tokens, return sum of both amounts
  if (WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount0.times(price0USD).plus(tokenAmount1.times(price1USD))
  }

  // take double value of the whitelisted token amount
  if (WHITELIST_TOKENS.includes(token0.id) && !WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount0.times(price0USD).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount1.times(price1USD).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked amount is 0
  return ZERO_BD
}
