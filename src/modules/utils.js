// @flow

import { bns, div, eq, gte, mul, toFixed } from 'biggystring'
import type {
  EdgeCurrencyInfo,
  EdgeCurrencyPlugin,
  EdgeCurrencyWallet,
  EdgeDenomination,
  EdgeMetaToken,
  EdgeReceiveAddress,
  EdgeTransaction
} from 'edge-core-js'
import _ from 'lodash'
import { Platform } from 'react-native'

import { FIAT_CODES_SYMBOLS as currencySymbolMap, getSymbolFromCurrency } from '../constants/indexConstants.js'
import borderColors from '../theme/variables/css3Colors'
import type { CustomTokenInfo, ExchangeData, GuiDenomination, GuiWallet } from '../types'

const DIVIDE_PRECISION = 18

export const cutOffText = (str: string, lng: number) => {
  if (str.length >= lng) {
    return str.slice(0, lng) + '...'
  } else {
    return str
  }
}

export const findDenominationSymbol = (denoms: Array<EdgeDenomination>, value: string) => {
  for (const v of denoms) {
    if (v.name === value) {
      return v.symbol
    }
  }
}

export const getWalletDefaultDenomProps = (wallet: Object, settingsState: Object, currencyCode?: string /* for metaTokens */): EdgeDenomination => {
  const allWalletDenoms = wallet.allDenominations
  let walletCurrencyCode
  if (currencyCode) {
    // if metaToken
    walletCurrencyCode = currencyCode
  } else {
    // if not a metaToken
    walletCurrencyCode = wallet.currencyCode
  }
  const currencySettings = settingsState[walletCurrencyCode] // includes 'denomination', currencyName, and currencyCode
  let denomProperties: EdgeDenomination
  if (allWalletDenoms[walletCurrencyCode]) {
    denomProperties = allWalletDenoms[walletCurrencyCode][currencySettings.denomination] // includes name, multiplier, and symbol
  } else {
    // This is likely a custom token which has no denom setup in allWalletDenominations
    denomProperties = currencySettings.denominations[0]
  }
  return denomProperties
}

export const getFiatSymbol = (code: string) => {
  code = code.replace('iso:', '')
  return getSymbolFromCurrency(code)
}

export const devStyle = {
  borderColor: 'red',
  borderWidth: 1,
  backgroundColor: 'yellow'
}

export const logInfo = (msg: string) => {
  console.log('%c ' + msg, 'background: grey; font-weight: bold; display: block;')
}

export const logWarning = (msg: string) => {
  console.log('%c ' + msg, 'background: yellow; font-weight: bold; display: block;')
}

export const logError = (msg: string) => {
  console.log('%c ' + msg, 'background: red; font-weight: bold; display: block;')
}

export const border = (color: ?string) => {
  const borderColor = color || getRandomColor()
  return {
    borderColor: borderColor,
    borderWidth: 0
  }
}

export const inputBottomPadding = () => {
  if (Platform.OS === 'android') {
    return {
      paddingBottom: 0
    }
  }
}

// will take the metaTokens property on the wallet (that comes from currencyInfo), merge with account-level custom tokens added, and only return if enabled (wallet-specific)
// $FlowFixMe
export const mergeTokens = (preferredEdgeMetaTokens: Array<EdgeMetaToken | CustomTokenInfo>, edgeMetaTokens: Array<CustomTokenInfo>) => {
  const tokensEnabled = [...preferredEdgeMetaTokens] // initially set the array to currencyInfo (from plugin), since it takes priority
  for (const x of edgeMetaTokens) {
    // loops through the account-level array
    let found = false // assumes it is not present in the currencyInfo from plugin
    for (const val of tokensEnabled) {
      // loops through currencyInfo array to see if already present
      if (x.currencyCode === val.currencyCode) {
        found = true // if present, then set 'found' to true
      }
    }
    if (!found) tokensEnabled.push(x) // if not already in the currencyInfo, then add to tokensEnabled array
  }
  return tokensEnabled
}

export const mergeTokensRemoveInvisible = (preferredEdgeMetaTokens: Array<EdgeMetaToken>, edgeMetaTokens: Array<CustomTokenInfo>) => {
  const tokensEnabled = [...preferredEdgeMetaTokens] // initially set the array to currencyInfo (from plugin), since it takes priority
  const tokensToAdd = []
  for (const x of edgeMetaTokens) {
    // loops through the account-level array
    if (x.isVisible !== false && _.findIndex(tokensEnabled, walletToken => walletToken.currencyCode === x.currencyCode) === -1) {
      tokensToAdd.push(x)
    }
  }
  return tokensEnabled.concat(tokensToAdd)
}

export const getRandomColor = () => borderColors[Math.floor(Math.random() * borderColors.length)]

// Used to reject non-numeric (expect '.') values in the FlipInput
export const isValidInput = (input: string): boolean =>
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators#Unary_plus_()
  !isNaN(+input) || input === '.'

// Used to limit the decimals of a displayAmount
// TODO every function that calls this function needs to be flowed
export const truncateDecimals = (input: string, precision: number, allowBlank: boolean = false): string => {
  if (input === '') {
    if (allowBlank) {
      input = ''
    } else {
      input = '0'
    }
  }
  if (!input.includes('.')) {
    return input
  }
  const [integers, decimals] = input.split('.')
  return precision > 0 ? `${integers}.${decimals.slice(0, precision)}` : integers
}

/**
 * @deprecated
 * @param input
 * @returns {string}
 */
export const formatNumber = (input: string): string => {
  let out = input.replace(/^0+/, '')
  if (out.startsWith('.')) {
    out = '0' + out
  }
  return out
}

export const decimalOrZero = (input: string, decimalPlaces: number): string => {
  if (gte(input, '1')) {
    // do nothing to numbers greater than one
    return input
  } else {
    const truncatedToDecimals = toFixed(input, decimalPlaces, decimalPlaces)
    if (eq(truncatedToDecimals, '0')) {
      // cut off to number of decimal places equivalent to zero?
      return '0' // then return zero
    } else {
      // if not equivalent to zero
      return truncatedToDecimals.replace(/0+$/, '') // then return the truncation
    }
  }
}

// Used to convert outputs from core into other denominations (exchangeDenomination, displayDenomination)
export const convertNativeToDenomination = (nativeToTargetRatio: string) => (nativeAmount: string): string =>
  div(nativeAmount, nativeToTargetRatio, DIVIDE_PRECISION)

// Alias for convertNativeToDenomination
// Used to convert outputs from core to amounts ready for display
export const convertNativeToDisplay = convertNativeToDenomination
// Alias for convertNativeToDenomination
// Used to convert outputs from core to amounts ready for display
export const convertNativeToExchange = convertNativeToDenomination

// Used to convert amounts from display to core inputs
export const convertDisplayToNative = (nativeToDisplayRatio: string) => (displayAmount: string): string =>
  !displayAmount ? '' : mul(displayAmount, nativeToDisplayRatio)

export const isCryptoParentCurrency = (wallet: GuiWallet, currencyCode: string) => currencyCode === wallet.currencyCode

export const getNewArrayWithoutItem = (array: Array<any>, targetItem: any) => array.filter(item => item !== targetItem)

export const getNewArrayWithItem = (array: Array<any>, item: any) => (!array.includes(item) ? [...array, item] : array)

const restrictedCurrencyCodes = ['BTC']

export function getDenomFromIsoCode (currencyCode: string): GuiDenomination {
  if (restrictedCurrencyCodes.findIndex(item => item === currencyCode) !== -1) {
    return {
      name: '',
      currencyCode: '',
      symbol: '',
      precision: 0,
      multiplier: '0'
    }
  }
  const symbol = getSymbolFromCurrency(currencyCode)
  const denom: GuiDenomination = {
    name: currencyCode,
    currencyCode,
    symbol,
    precision: 2,
    multiplier: '100'
  }
  return denom
}

export function getAllDenomsOfIsoCurrencies (): Array<GuiDenomination> {
  // Convert map to an array
  const denomArray = []

  for (const currencyCode in currencySymbolMap) {
    if (currencySymbolMap.hasOwnProperty(currencyCode)) {
      const item = getDenomFromIsoCode(currencyCode)
      if (item.name.length) {
        denomArray.push(item)
      }
    }
  }
  return denomArray
}

export const getSupportedFiats = (): Array<{ label: string, value: string }> => {
  const currencySymbolsFromCurrencyCode = currencySymbolMap
  const entries = Object.entries(currencySymbolsFromCurrencyCode)
  const objectFromArrayPair = entry => {
    const entry1 = typeof entry[1] === 'string' ? entry[1] : ''

    return {
      label: `${entry[0]} - ${entry1}`,
      value: entry[0]
    }
  }

  const supportedFiats = entries.map(objectFromArrayPair)
  return supportedFiats
}

/**
 * Adds the `iso:` prefix to a currency code, if it's missing.
 * @param {*} currencyCode A currency code we believe to be a fiat value.
 */
export function fixFiatCurrencyCode (currencyCode: string) {
  // These are included in the currency-symbol-map library,
  // and therefore might sneak into contexts where we expect fiat codes:
  if (currencyCode === 'BTC' || currencyCode === 'ETH') return currencyCode

  return /^iso:/.test(currencyCode) ? currencyCode : 'iso:' + currencyCode
}

export const isCompleteExchangeData = (exchangeData: ExchangeData) =>
  !!exchangeData.primaryDisplayAmount &&
  !!exchangeData.primaryDisplayName &&
  !!exchangeData.secondaryDisplayAmount &&
  !!exchangeData.secondaryDisplaySymbol &&
  !!exchangeData.secondaryCurrencyCode

export const unspacedLowercase = (input: string) => {
  const newInput = input.replace(' ', '').toLowerCase()
  return newInput
}

export const getCurrencyInfo = (plugins: Array<EdgeCurrencyPlugin>, currencyCode: string): EdgeCurrencyInfo | void => {
  for (const plugin of plugins) {
    const info = plugin.currencyInfo
    for (const denomination of info.denominations) {
      if (denomination.name === currencyCode) {
        return info
      }
    }

    for (const token of info.metaTokens) {
      for (const denomination of token.denominations) {
        if (denomination.name === currencyCode) {
          return info
        }
      }
    }
  }

  return void 0
}

export const denominationToDecimalPlaces = (denomination: string): string => {
  const numberOfDecimalPlaces = (denomination.match(/0/g) || []).length
  const decimalPlaces = numberOfDecimalPlaces.toString()
  return decimalPlaces
}

export const decimalPlacesToDenomination = (decimalPlaces: string): string => {
  const numberOfDecimalPlaces: number = parseInt(decimalPlaces)
  const denomination: string = '1' + '0'.repeat(numberOfDecimalPlaces)

  // will return, '1' at the very least
  return denomination
}

export const isReceivedTransaction = (edgeTransaction: EdgeTransaction): boolean => gte(edgeTransaction.nativeAmount, '0')
export const isSentTransaction = (edgeTransaction: EdgeTransaction): boolean => !isReceivedTransaction(edgeTransaction)

export const getTimeMeasurement = (inMinutes: number): string => {
  switch (true) {
    case inMinutes < 1:
      return 'seconds'

    case inMinutes < 60:
      return 'minutes'

    case inMinutes < 1440:
      return 'hours'

    case inMinutes <= 84960:
      return 'days'

    default:
      return ''
  }
}

export const getTimeWithMeasurement = (inMinutes: number): { measurement: string, value: number } => {
  const measurement = getTimeMeasurement(inMinutes)

  const measurements = {
    seconds (minutes) {
      const val = Math.round(minutes * 60)
      return val
    },
    minutes (minutes) {
      return minutes
    },
    hours (minutes) {
      return minutes / 60
    },
    days (minutes) {
      return minutes / 24 / 60
    }
  }
  const strategy = measurements[measurement]

  if (!strategy) {
    console.error(`No strategy for particular measurement: ${measurement}`)
    return { measurement: '', value: Infinity }
  }
  return {
    measurement,
    value: strategy(inMinutes)
  }
}
export const getTimeInMinutes = (params: { measurement: string, value: number }): number => {
  const { measurement, value } = params
  const measurementStrategies = {
    seconds (v) {
      const val = Math.round(v / 60 * 100) / 100
      return val
    },
    minutes (v) {
      return v
    },
    hours (v) {
      return v * 60
    },
    days (v) {
      return v * 24 * 60
    }
  }
  const strategy = measurementStrategies[measurement]

  if (!strategy) {
    console.error(`No strategy for particular measurement: ${measurement}`)
    return Infinity
  }
  return strategy(value)
}

export const convertAbcToGuiDenomination = (edgeDenomination: EdgeDenomination): GuiDenomination => {
  const guiDenomination: GuiDenomination = {
    name: edgeDenomination.name,
    currencyCode: edgeDenomination.name,
    symbol: edgeDenomination.symbol ? edgeDenomination.symbol : '',
    multiplier: edgeDenomination.multiplier,
    precision: 0
  }
  return guiDenomination
}

export type PrecisionAdjustParams = {
  exchangeSecondaryToPrimaryRatio: number,
  secondaryExchangeMultiplier: string,
  primaryExchangeMultiplier: string
}

export function precisionAdjust (params: PrecisionAdjustParams): number {
  const order = Math.floor(Math.log(params.exchangeSecondaryToPrimaryRatio) / Math.LN10 + 0.000000001) // because float math sucks like that
  const exchangeRateOrderOfMagnitude = Math.pow(10, order)

  // Get the exchange rate in pennies
  const exchangeRateString = bns.mul(exchangeRateOrderOfMagnitude.toString(), params.secondaryExchangeMultiplier)

  const precisionAdjust = bns.div(exchangeRateString, params.primaryExchangeMultiplier, DIVIDE_PRECISION)

  if (bns.lt(precisionAdjust, '1')) {
    const fPrecisionAdject = parseFloat(precisionAdjust)
    let order = 2 + Math.floor(Math.log(fPrecisionAdject) / Math.LN10 - 0.000000001) // because float math sucks like that
    order = Math.abs(order)
    if (order > 0) {
      return order
    }
  }
  return 0
}

export const noOp = (optionalArgument: any = null) => {
  return optionalArgument
}

export const getReceiveAddresses = (currencyWallets: { [id: string]: EdgeCurrencyWallet }): Promise<{ [id: string]: EdgeReceiveAddress }> => {
  const ids = Object.keys(currencyWallets)
  const promises = ids.map(id => {
    return currencyWallets[id].getReceiveAddress()
  })
  return Promise.all(promises).then(receiveAddresses => {
    return ids.reduce((result, id, index) => {
      return {
        ...result,
        [id]: receiveAddresses[index]
      }
    }, {})
  })
}

export const MILLISECONDS_PER_DAY = 86400000
export const daysBetween = (DateInMillisecondsA: number, dateInMillisecondsB: number) => {
  const millisecondsBetween = dateInMillisecondsB - DateInMillisecondsA
  const daysBetween = millisecondsBetween / MILLISECONDS_PER_DAY
  return daysBetween
}

export function snooze (ms: number): Promise<void> {
  return new Promise((resolve: any) => setTimeout(resolve, ms))
}

export const isEdgeLogin = (data: string) => {
  const EDGE_LOGIN_REG_EXP = /^airbitz:\/\/edge\//

  return EDGE_LOGIN_REG_EXP.test(data)
}
