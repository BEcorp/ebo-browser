const h = require('react-hyperscript')
const connect = require('react-redux').connect
const actions = require('../../../store/actions')
const AccountModalContainer = require('./account-modal-container')
const { getSelectedIdentity, getRpcPrefsForCurrentProvider } = require('../../../selectors/selectors')
const genAccountLink = require('../../../../lib/account-link.js')
const QrView = require('../../ui/qr-code')
const EditableLabel = require('../../ui/editable-label')
const Tooltip = require('../../ui/tooltip-v2.js').default

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import copyToClipboard from 'copy-to-clipboard'
import Button from '../../ui/button'

class AccountDetailsModal extends Component {
  state = {
    copied: false,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  render () {
    const {
      selectedIdentity,
      network,
      showExportPrivateKeyModal,
      setAccountLabel,
      keyrings,
      rpcPrefs,
    } = this.props
    const { name, address } = selectedIdentity

    const keyring = keyrings.find((kr) => {
      return kr.accounts.includes(address)
    })

    let exportPrivateKeyFeatureEnabled = true
    // This feature is disabled for hardware wallets
    if (keyring && keyring.type.search('Hardware') !== -1) {
      exportPrivateKeyFeatureEnabled = false
    }

    return h(AccountModalContainer, {}, [
        h(EditableLabel, {
          className: 'account-modal__name',
          defaultValue: name,
          onSubmit: label => setAccountLabel(address, label),
        }),

        h(QrView, {
          Qr: {
            data: address,
            network: network,
          },
        }),

        h('div.account-modal-divider'),

        exportPrivateKeyFeatureEnabled ? h(Tooltip, {
          position: 'bottom',
          title: this.state.copied ? this.context.t('copiedExclamation') : this.context.t('copyToClipboard'),
        }, [
          h(Button, {
            type: 'secondary',
            className: 'account-modal__button',
            onClick: () => {
              this.setState({ copied: true })
              setTimeout(() => this.setState({ copied: false }), 3000)
              copyToClipboard(address)
            },
          }, this.context.t('exportPrivateKey')),
        ]) : null,

        h(Button, {
          type: 'secondary',
          className: 'account-modal__button',
          onClick: () => global.platform.openWindow({ url: genAccountLink(address, network) }),
        }, this.context.t('etherblockchainView')),

    ])
  }
}


function mapStateToProps (state) {
  return {
    network: state.metamask.network,
    selectedIdentity: getSelectedIdentity(state),
    keyrings: state.metamask.keyrings,
    rpcPrefs: getRpcPrefsForCurrentProvider(state),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    // Is this supposed to be used somewhere?
    showQrView: (selected, identity) => dispatch(actions.showQrView(selected, identity)),
    showExportPrivateKeyModal: () => {
      dispatch(actions.showModal({ name: 'EXPORT_PRIVATE_KEY' }))
    },
    hideModal: () => dispatch(actions.hideModal()),
    setAccountLabel: (address, label) => dispatch(actions.setAccountLabel(address, label)),
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(AccountDetailsModal)
