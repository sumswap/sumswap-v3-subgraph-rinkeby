import { ONE_BD, WETH_ADDRESS } from './constants';
import { Address, log} from '@graphprotocol/graph-ts';
import { Factory, Bundle, Token, Pool, Tick, Position, PositionSnapshot, Transaction, Mint, Burn, Swap, Collect, SumswapDayData, PoolDayData, PoolHourData, TickHourData, TickDayData, TokenDayData, TokenHourData } from '../types/schema'
import { getEthPriceInUSD } from './pricing';
import { fetchTokenSymbol, fetchTokenName, fetchTokenTotalSupply, fetchTokenDecimals } from './token';

export function loadFactory(id: string): Factory {
    let factory = Factory.load(id);
    if (!factory) {
        log.debug('Factory not exist id:' + id, [])
        factory = new Factory(id);
        factory.save();
    }
    return factory;
}
export function loadBundle(id: string): Bundle {
    let bundle = Bundle.load(id);
    if (!bundle) {
        log.debug('Bundle not exist id:' + id, [])
        bundle = new Bundle(id);
        bundle.ethPriceUSD=getEthPriceInUSD();
        bundle.save()
    }
    return bundle;
}
export function loadToken(id: string): Token {
    let token = Token.load(id);
    if (!token) {
        log.debug('Token not exist id:' + id, [])
        token = new Token(id);
        const address = Address.fromString(id);
        token.symbol = fetchTokenSymbol(address)
        token.name = fetchTokenName(address)
        token.totalSupply = fetchTokenTotalSupply(address)
        token.decimals = fetchTokenDecimals(address)
        if(id===WETH_ADDRESS){
            token.derivedETH=ONE_BD;
        }
        token.save();
    }
    return token;
}
export function loadPool(id: string): Pool {
    let pool = Pool.load(id);
    if (!pool) {
        log.debug('Pool not exist id:' + id, [])
        pool = new Pool(id);
        pool.save();
    }
    return pool;
}
export function loadTick(id: string):Tick|null { return Tick.load(id); }
export function loadPosition(id: string):Position|null { return Position.load(id); }
export function loadPositionSnapshot(id: string):PositionSnapshot|null { return PositionSnapshot.load(id); }
export function loadTransactionById(id: string):Transaction|null { return Transaction.load(id); }
export function loadMint(id: string):Mint|null { return Mint.load(id); }
export function loadBurn(id: string):Burn|null { return Burn.load(id); }
export function loadSwap(id: string):Swap|null { return Swap.load(id); }
export function loadCollect(id: string):Collect|null { return Collect.load(id); }
export function loadSumswapDayData(id: string):SumswapDayData|null { return SumswapDayData.load(id); }
export function loadPoolDayData(id: string):PoolDayData|null { return PoolDayData.load(id); }
export function loadPoolHourData(id: string):PoolHourData|null { return PoolHourData.load(id); }
export function loadTickHourData(id: string):TickHourData|null { return TickHourData.load(id); }
export function loadTickDayData(id: string):TickDayData|null { return TickDayData.load(id); }
export function loadTokenDayData(id: string):TokenDayData|null { return TokenDayData.load(id); }
export function loadTokenHourData(id: string):TokenHourData|null { return TokenHourData.load(id); }