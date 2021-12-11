import { SUM_ADDRESS, DAI_ADDRESS, USDT_ADDRESS, WETH_ADDRESS, USDC_ADDRESS } from './constants';
/* eslint-disable prefer-const */
import { Address, BigInt } from '@graphprotocol/graph-ts'

// Initialize a Token Definition with the attributes
export class StaticTokenDefinition {
  address: Address
  symbol: string
  name: string
  decimals: BigInt

  // Initialize a Token Definition with its attributes
  constructor(address: Address, symbol: string, name: string, decimals: BigInt) {
    this.address = address
    this.symbol = symbol
    this.name = name
    this.decimals = decimals
  }

  // Get all tokens with a static defintion
  static getStaticDefinitions(): Array<StaticTokenDefinition> {
    const WETH = new StaticTokenDefinition(
      Address.fromString(WETH_ADDRESS),
      'WETH',
      'Wrapped Ethereum',
      BigInt.fromI32(18)
    )

    const USDC = new StaticTokenDefinition(
      Address.fromString(USDC_ADDRESS),
      'USDC',
      'USD Coin',
      BigInt.fromI32(6)
    )

    const USDT = new StaticTokenDefinition(
      Address.fromString(USDT_ADDRESS),
      'USDT',
      'USDT',
      BigInt.fromI32(6)
    )

    const DAI = new StaticTokenDefinition(
      Address.fromString(DAI_ADDRESS),
      'DAI',
      'Dai Stablecoin',
      BigInt.fromI32(18)
    )

    const SUM = new StaticTokenDefinition(
      Address.fromString(SUM_ADDRESS),
      'SUM',
      'SUM',
      BigInt.fromI32(18)
    )

    return new Array<StaticTokenDefinition>(WETH,USDC,USDT,DAI,SUM)
  }

  // Helper for hardcoded tokens
  static fromAddress(_tokenAddress: Address): StaticTokenDefinition | null {
    return null;
  }
}
