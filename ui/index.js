
import { addHexPrefix } from 'ethereumjs-util'
import { loadLocalStorageData } from './lib/local-storage-helpers'
import { setGasPrice } from './app/store/actions'
import { fetchBasicGasAndTimeEstimates, setCustomGasPrice, setCustomGasLimit } from './app/ducks/gas/gas.duck.js'
import { getRenderableEstimateDataForSmallButtonsFromGWEI, getCustomGasLimit, getFastPriceEstimateInHexWEI } from './app/selectors/custom-gas'
import { getSelectedToken } from './app/pages/send/send.selectors'
import { submittedPendingTransactionsSelector } from './app/selectors/transactions'
import { updateGasAndCalculate } from './app/ducks/confirm-transaction/confirm-transaction.duck'

const render = require('react-dom').render
const h = require('react-hyperscript')
const Root = require('./app/pages')
const actions = require('./app/store/actions')
const configureStore = require('./app/store/store')
const txHelper = require('./lib/tx-helper')
const { fetchLocale } = require('./app/helpers/utils/i18n-helper')
const log = require('loglevel')

module.exports = launchMetamaskUi

log.setLevel(global.METAMASK_DEBUG ? 'debug' : 'warn')

function launchMetamaskUi (opts, cb) {
  var accountManager = opts.accountManager
  actions._setBackgroundConnection(accountManager)
  // check if we are unlocked first
  accountManager.getState(function (err, metamaskState) {
    if (err) return cb(err)
    startApp(metamaskState, accountManager, opts)
      .then((store) => {
        cb(null, store)
      })
  })
}

async function startApp (metamaskState, accountManager, opts) {
  // parse opts
  if (!metamaskState.featureFlags) metamaskState.featureFlags = {}

  const currentLocaleMessages = metamaskState.currentLocale
    ? await fetchLocale(metamaskState.currentLocale)
    : {}
  const enLocaleMessages = await fetchLocale('en')

  const store = configureStore({

    // metamaskState represents the cross-tab state
    metamask: metamaskState,

    // appState represents the current tab's popup state
    appState: {},

    localeMessages: {
      current: currentLocaleMessages,
      en: enLocaleMessages,
    },

    // Which blockchain we are using:
    networkVersion: opts.networkVersion,
  })

  // if unconfirmed txs, start on txConf page
  const unapprovedTxsAll = txHelper(metamaskState.unapprovedTxs, metamaskState.unapprovedMsgs, metamaskState.unapprovedPersonalMsgs, metamaskState.unapprovedTypedMessages, metamaskState.network)
  const numberOfUnapprivedTx = unapprovedTxsAll.length
  if (numberOfUnapprivedTx > 0) {
    store.dispatch(actions.showConfTxPage({
      id: unapprovedTxsAll[numberOfUnapprivedTx - 1].id,
    }))
  }

  accountManager.on('update', function (metamaskState) {
    store.dispatch(actions.updateMetamaskState(metamaskState))
  })

  // global metamask api - used by tooling
  global.metamask = {
    updateCurrentLocale: (code) => {
      store.dispatch(actions.updateCurrentLocale(code))
    },
    setProviderType: (type) => {
      store.dispatch(actions.setProviderType(type))
    },
  }

  global.gasUpdate = async () => {
    await store.dispatch(fetchBasicGasAndTimeEstimates())
    const buttonId = Number.isInteger(loadLocalStorageData('gasButtonId')) ? loadLocalStorageData('gasButtonId') : 1
    const state = store.getState()
    const gasButtonInfo = getRenderableEstimateDataForSmallButtonsFromGWEI(state)
    const gasPrice = gasButtonInfo[buttonId].priceInHexWei
    const { transaction } = state.appState.sidebar.props
    const { gas: currentGasLimit } = getTxParams(state, transaction && transaction.id)
    const gasLimit = getCustomGasLimit(state) || currentGasLimit
    store.dispatch(setGasPrice(addHexPrefix(gasPrice)))
    store.dispatch(setCustomGasPrice(addHexPrefix(gasPrice)))
    store.dispatch(setCustomGasLimit(addHexPrefix(gasLimit.toString(16))))
    store.dispatch(updateGasAndCalculate({ gasLimit, gasPrice }))
  }

  function getTxParams (state, transactionId) {
    const { confirmTransaction: { txData }, metamask: { send } } = state
    const pendingTransactions = submittedPendingTransactionsSelector(state)
    const pendingTransaction = pendingTransactions.find(({ id }) => id === transactionId)
    const { txParams: pendingTxParams } = pendingTransaction || {}
    return txData.txParams || pendingTxParams || {
      from: send.from,
      gas: send.gasLimit || '0x5208',
      gasPrice: send.gasPrice || getFastPriceEstimateInHexWEI(state, true),
      to: send.to,
      value: getSelectedToken(state) ? '0x0' : send.amount,
    }
  }

  // Switch to our Enode
  global.metamask.setProviderType('mainnet')
  store.dispatch(actions.setRpcTarget('https://api.etherblockchain.io/enode/', '', '', 'EBIO prod enode'))

  // Set default gas price or load user selection
  setTimeout(() => global.gasUpdate(), 1000)

  // start app
  render(
    h(Root, {
      // inject initial state
      store: store,
    }
  ), opts.container)

  return store
}
