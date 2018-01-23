// @flow

import React, {Component} from 'react'
import {
  View,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import SafeAreaView from '../../components/SafeAreaView'
import Text from '../../components/FormattedText'
import {sprintf} from 'sprintf-js'
import s from '../../../../locales/strings.js'
import styles from './styles.js'
import {bns} from 'biggystring'
import ExchangeRate from '../../components/ExchangeRate/index.js'
import ExchangedFlipInput from '../../components/FlipInput/ExchangedFlipInput.js'
import type {FlipInputFieldInfo} from '../../components/FlipInput/FlipInput.ui'
import Recipient from '../../components/Recipient/index.js'
import ABSlider from '../../components/Slider/index.js'
import Gradient from '../../components/Gradient/Gradient.ui'

import * as UTILS from '../../../utils.js'

import type {CurrencyConverter, GuiDenomination} from '../../../../types'
import type {AbcParsedUri, AbcTransaction} from 'airbitz-core-types'

const DIVIDE_PRECISION = 18

export type Props = {
  pending: boolean,
  keyboardIsVisible: boolean,
  label: string,
  publicAddress: string,
  primaryDisplayCurrencyCode: string,
  primaryExchangeCurrencyCode: string,
  primaryDisplayDenomination: GuiDenomination,
  primaryExchangeDenomination: GuiDenomination,
  secondaryDisplayCurrencyCode: string,
  secondaryExchangeCurrencyCode: string,
  networkFeeOption: string,
  networkFee: string,
  nativeAmount: string,
  errorMsg: string | null,
  fiatPerCrypto: number,
  currencyCode: string,
  sliderDisabled: boolean,
  currencyConverter: CurrencyConverter
}

export type DispatchProps = {
  updateSpendPending: (boolean) => any,
  signBroadcastAndSave: () => any,
  updateTransactionAmount: (
    primaryNativeAmount: string,
    secondaryExchangeAmount: string
  ) => any,
  resetFees: () => any
}

type State = {
  secondaryDisplayDenomination: any,
  keyboardVisible: boolean
}

export default class SendConfirmation extends Component<Props & DispatchProps, State> {
  constructor (props: Props & DispatchProps) {
    super(props)
    this.state = {
      secondaryDisplayDenomination: { multiplier: '1' },
      keyboardVisible: false
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    if (nextProps['secondaryDisplayCurrencyCode'] !== this.props['secondaryDisplayCurrencyCode']) {
      this.setState({
        secondaryDisplayDenomination: UTILS.getDenomFromIsoCode(
          nextProps['secondaryDisplayCurrencyCode']
        )
      })
    }
    for (const prop in nextProps) {
      if (nextProps[prop] !== this.props[prop]) {
        console.log('renderrender - for prop', prop)
        console.log('renderrender - old prop', this.props[prop])
        console.log('renderrender - new prop', nextProps[prop])
        console.log('renderrender - **************************')
      }
    }
  }

  componentDidMount () {
    this.props.updateTransactionAmount('0', '0')
    this.props.resetFees()
  }

  render () {
    const primaryInfo: FlipInputFieldInfo = {
      displayCurrencyCode: this.props.primaryDisplayCurrencyCode,
      exchangeCurrencyCode: this.props.primaryExchangeCurrencyCode,
      displayDenomination: this.props.primaryDisplayDenomination,
      exchangeDenomination: this.props.primaryExchangeDenomination
    }

    const secondaryInfo: FlipInputFieldInfo = {
      displayCurrencyCode: this.props.secondaryDisplayCurrencyCode,
      exchangeCurrencyCode: this.props.secondaryExchangeCurrencyCode,
      displayDenomination: this.state.secondaryDisplayDenomination,
      exchangeDenomination: this.state.secondaryDisplayDenomination
    }

    const color = 'white'
    let networkFeeSyntax

    if (bns.gt(this.props.networkFee, '0')) {
      const cryptoFeeSymbol = primaryInfo.displayDenomination.symbol
      const cryptoFeeAmount = this.convertPrimaryNativeToDisplay(this.props.networkFee)
      const cryptoFeeString = `${cryptoFeeSymbol} ${cryptoFeeAmount}`
      const fiatFeeSymbol = secondaryInfo.displayDenomination.symbol
      const exchangeConvertor = UTILS.convertNativeToExchange(primaryInfo.exchangeDenomination.multiplier)
      const cryptoFeeExchangeAmount = exchangeConvertor(this.props.networkFee)
      const fiatFeeAmount = this.props.currencyConverter.convertCurrency(this.props.currencyCode, secondaryInfo.exchangeCurrencyCode, cryptoFeeExchangeAmount)
      const fiatFeeAmountString = fiatFeeAmount.toFixed(2)
      const fiatFeeAmountPretty = bns.toFixed(fiatFeeAmountString, 2, 2)
      const fiatFeeString = `${fiatFeeSymbol} ${fiatFeeAmountPretty}`
      networkFeeSyntax = sprintf(s.strings.send_confirmation_fee_line, cryptoFeeString, fiatFeeString)
    } else {
      networkFeeSyntax = ''
    }

    return (
      <SafeAreaView>
        <Gradient style={[styles.view]}>
          <Gradient style={styles.gradient} />
          <ScrollView style={[styles.mainScrollView]} keyboardShouldPersistTaps={'always'}>

            <View style={[styles.exchangeRateContainer, UTILS.border()]}>
              {
                this.props.errorMsg
                  ? <Text style={[styles.error]}>
                    {this.props.errorMsg}
                  </Text>
                  : <ExchangeRate
                    secondaryDisplayAmount={this.props.fiatPerCrypto}
                    primaryInfo={primaryInfo}
                    secondaryInfo={secondaryInfo} />
              }
            </View>

            <View style={[styles.main, UTILS.border('yellow'), {flex: this.state.keyboardVisible ? 0 : 1}]}>
              <ExchangedFlipInput
                primaryInfo={{...primaryInfo, nativeAmount: this.props.nativeAmount}}
                secondaryInfo={secondaryInfo}
                secondaryToPrimaryRatio={this.props.fiatPerCrypto}
                onAmountsChange={this.onAmountsChange}
                color={color} />
              <View style={[styles.feeArea]}>
                <Text style={[styles.feeAreaText]}>{networkFeeSyntax}</Text>
              </View>
              <Recipient label={this.props.label} link={''} publicAddress={this.props.publicAddress} style={styles.recipient} />
            </View>
            <View style={[styles.pendingSymbolArea]}>
              {this.props.pending &&
                <ActivityIndicator style={[{flex: 1, alignSelf: 'center'}, UTILS.border()]} size={'small'} />
              }
            </View>
            <View style={[styles.sliderWrap]}>
              <ABSlider
                parentStyle={styles.sliderStyle}
                onSlidingComplete={this.props.signBroadcastAndSave}
                sliderDisabled={this.props.sliderDisabled} />
            </View>
          </ScrollView>
        </Gradient>
      </SafeAreaView>
    )
  }

  onAmountsChange = ({primaryDisplayAmount, secondaryDisplayAmount}: {primaryDisplayAmount: string, secondaryDisplayAmount: string}) => {
    const primaryNativeToDenominationRatio = this.props.primaryDisplayDenomination.multiplier.toString()
    const secondaryNativeToDenominationRatio = this.state.secondaryDisplayDenomination.multiplier.toString()

    const primaryNativeAmount = UTILS.convertDisplayToNative(primaryNativeToDenominationRatio)(primaryDisplayAmount)
    const secondaryNativeAmount = UTILS.convertDisplayToNative(secondaryNativeToDenominationRatio)(secondaryDisplayAmount)

    const secondaryExchangeAmount = this.convertSecondaryDisplayToSecondaryExchange(secondaryDisplayAmount)
    this.props.updateTransactionAmount(primaryNativeAmount, secondaryExchangeAmount)
  }

  onMaxPress = () => {}

  convertPrimaryNativeToDisplay = (primaryNativeAmount: string): string => {
    if (!primaryNativeAmount) { return '' }
    const primaryNativeToDisplayRatio = this.props.primaryExchangeDenomination.multiplier
    const primaryDisplayAmount = UTILS.convertNativeToDisplay(primaryNativeToDisplayRatio)(primaryNativeAmount)
    return primaryDisplayAmount
  }

  getPrimaryNativeToDisplayRatio = () => this.props.primaryDisplayDenomination.multiplier

  convertSecondaryDisplayToSecondaryExchange = (secondaryDisplayAmount: string): string => {
    const secondaryDisplayToExchangeRatio = this.getSecondaryDisplayToExchangeRatio()
    return bns.div(secondaryDisplayAmount, secondaryDisplayToExchangeRatio, DIVIDE_PRECISION)
  }

  getSecondaryDisplayToExchangeRatio = (): string => {
    const displayMultiplier = this.state.secondaryDisplayDenomination.multiplier
    return bns.div(displayMultiplier, displayMultiplier, DIVIDE_PRECISION)
  }
}
