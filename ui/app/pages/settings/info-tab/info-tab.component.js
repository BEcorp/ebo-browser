import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

export default class InfoTab extends PureComponent {
  state = {
    version: global.platform.getVersion(),
  }

  static propTypes = {
    tab: PropTypes.string,
    metamask: PropTypes.object,
    setCurrentCurrency: PropTypes.func,
    setRpcTarget: PropTypes.func,
    displayWarning: PropTypes.func,
    revealSeedConfirmation: PropTypes.func,
    warning: PropTypes.string,
    location: PropTypes.object,
    history: PropTypes.object,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  render () {
    const { t } = this.context

    return (
      <div className="settings-page__body">
        <div className="settings-page__content-row">
          <div className="settings-page__content-item settings-page__content-item--without-height">
            <div className="info-tab__logo-wrapper">
              <img
                src="images/logo/metamask-fox.svg"
                className="info-tab__logo"
              />
            </div>
            <div className="info-tab__item">
              <div className="info-tab__version-header">
                { t('metamaskVersion') }
              </div>
              <div className="info-tab__version-number">
                { this.state.version }
              </div>
            </div>
            <div className="info-tab__item">
              <div className="info-tab__about">
                { t('builtInCalifornia') }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
