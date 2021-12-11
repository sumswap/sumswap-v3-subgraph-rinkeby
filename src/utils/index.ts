/* eslint-disable prefer-const */
import { BigInt, BigDecimal, ethereum } from '@graphprotocol/graph-ts'
import { Transaction } from '../types/schema'
import { ONE_BI, ZERO_BI, ZERO_BD, ONE_BD, N12_BD_P, N12_BD_N,TEN_BI } from './constants'
import { loadTransactionById } from './loaders'

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  return pow(TEN_BI.toBigDecimal(),decimals);
}

// return 0 if denominator is 0 in division
export function safeDiv(amount0: BigDecimal, amount1: BigDecimal): BigDecimal {
  if (amount1.equals(ZERO_BD) || amount1.le(N12_BD_P) && amount1.ge(N12_BD_N)) {
    return ZERO_BD
  } else {
    return amount0.div(amount1)
  }
}

export function bigDecimalExponated(value: BigDecimal, power: BigInt): BigDecimal {
  return pow(value,power);
}

export function pow(n: BigDecimal, p: BigInt): BigDecimal {
  if (p.equals(ZERO_BI) || n.equals(ONE_BD)) {
    return ONE_BD
  }

  if(p.equals(ONE_BI) || n.equals(ZERO_BD)){
    return n;
  }

  if(p.lt(ZERO_BI)){
    return safeDiv(ONE_BD,pow(n,p.neg()));
  }

  let m=ONE_BD;
  while(p.gt(ONE_BI)){
    if(p.bitAnd(ONE_BI).equals(ONE_BI)){
      m=m.times(n);
    }
    n=n.times(n);
    p=p.rightShift(1);
  }
  return m.times(n);
}

export function tokenAmountToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals.equals(ZERO_BI)) {
    return tokenAmount.toBigDecimal()
  }
  return safeDiv(tokenAmount.toBigDecimal(),exponentToBigDecimal(exchangeDecimals))
}

export function priceToDecimal(amount: BigDecimal, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals.equals(ZERO_BI)) {
    return amount
  }
  return safeDiv(amount, exponentToBigDecimal(exchangeDecimals))
}

export function equalToZero(value: BigDecimal): boolean {
  const formattedVal = parseFloat(value.toString())
  const zero = parseFloat(ZERO_BD.toString())
  if (zero == formattedVal) {
    return true
  }
  return false
}

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function bigDecimalExp18(): BigDecimal {
  return BigDecimal.fromString('1000000000000000000')
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals.equals(ZERO_BI)) {
    return tokenAmount.toBigDecimal()
  }
  return safeDiv(tokenAmount.toBigDecimal(),exponentToBigDecimal(exchangeDecimals));
}

export function convertEthToDecimal(eth: BigInt): BigDecimal {
  return safeDiv(eth.toBigDecimal(),exponentToBigDecimal(BigInt.fromI32(18)))
}

export function loadTransaction(event: ethereum.Event): Transaction {
  let transaction = loadTransactionById(event.transaction.hash.toHexString())
  if (transaction === null) {
    transaction = new Transaction(event.transaction.hash.toHexString())
  }
  transaction.blockNumber = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.gasPrice = event.transaction.gasPrice
  transaction.save()
  return transaction as Transaction
}
