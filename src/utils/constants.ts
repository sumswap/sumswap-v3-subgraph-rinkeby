/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { Factory as FactoryContract } from '../types/Factory/Factory'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0xAb49739554E4B167F1B05F2AafeF84714AB65325'
export const NPM_ADDRESS='0x50Cb530B9c29FC6bD02984d2291f5cF165Be8D65';
export const ETH_USD_PRICE_ADDRESS='0x639fe6ab55c921f74e7fac1ee960c0b6293ba612'

export const SUM_ADDRESS='0xaBe7742FA4C6d535F42499DD0571CE5b65b693fA'
export const WETH_ADDRESS='0x30A166F77d46CB0D0D9674EEa885D6B4802c0E7b'
export const DAI_ADDRESS='0x0cf754d0C8A4937F3AA742c67BDabD6db183A173'
export const USDT_ADDRESS='0x9bC4f24b80D4B8f3F74d5A0FDeCF30D8438549a9'
export const USDC_ADDRESS='0x5e8eec579e5bbb924e7500b6fc52a69111a35f19'

export const USDC_WETH_POOL = '0xCB7Dc7731fa31B323c875A60e585Db0477c2A1F1'

export const WHITELIST_TOKENS: string[] = [
    WETH_ADDRESS,
    USDC_ADDRESS,
    USDT_ADDRESS,
    DAI_ADDRESS,
    SUM_ADDRESS,
  ]

export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)
export const ONE_BI_N = BigInt.fromI32(-1)
export const TEN_BI = BigInt.fromI32(10)

export const ZERO_BD = BigDecimal.fromString('0')
export const Q192_BI = BigInt.fromString('6277101735386680763835789423207666416102355444464034512896');
export const Q192_BD = Q192_BI.toBigDecimal();

export const N12_BD_P = BigDecimal.fromString('0.000000000001');
export const N12_BD_N = BigDecimal.fromString('-0.000000000001');


export const ONE_BD = BigDecimal.fromString('1')
export const ONE_BD_N = BigDecimal.fromString('-1');

export const BI_18 = BigInt.fromI32(18)
export const MINIMUM_ETH_LOCKED = BigDecimal.fromString('4')


export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS))
