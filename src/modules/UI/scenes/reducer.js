// @flow

import { combineReducers } from 'redux'

import { requestType } from '../../../reducers/RequestTypeReducer.js'
import type { Action } from '../../ReduxTypes.js'
import ABAlert from '../components/ABAlert/reducer'
import controlPanel from '../components/ControlPanel/reducer.js'
import exchangeRate from '../components/ExchangeRate/reducer.js'
import { helpModal } from '../components/HelpModal/reducer.js'
import sideMenu from '../components/SideMenu/reducer'
import transactionAlert from '../components/TransactionAlert/reducer.js'
import walletListModal from '../components/WalletListModal/reducer'
import dimensions from '../dimensions/reducer'
import * as SCENES_ACTION from './action.js'
import changeMiningFee from './ChangeMiningFee/reducer'
import createWallet from './CreateWallet/reducer'
import editToken from './EditToken/reducer'
import request from './Request/reducer.js'
import scan from './Scan/reducer'
import sendConfirmation from './SendConfirmation/reducer'
import transactionDetails from './TransactionDetails/reducer'
import transactionList from './TransactionList/reducer'
import walletList from './WalletList/reducer'
import { walletTransferListReducer as walletTransferList } from './WalletTransferList/reducer'
import { passwordReminderModalReducer as passwordReminderModal } from '../components/PasswordReminderModal/indexPasswordReminderModal.js'

export const currentScene = (state: string = '', action: Action) => {
  if (!action.data) return state
  switch (action.type) {
    case SCENES_ACTION.UPDATE_CURRENT_SCENE_KEY:
      return action.data.sceneKey
    default:
      return state
  }
}

export const scenes = combineReducers({
  scan,
  sendConfirmation,
  changeMiningFee,
  transactionList,
  transactionDetails,
  controlPanel,
  walletList,
  walletTransferList,
  walletListModal,
  sideMenu,
  createWallet,
  editToken,
  request,
  requestType,
  dimensions,
  helpModal,
  transactionAlert,
  exchangeRate,
  ABAlert,
  currentScene,
  passwordReminderModal
})
