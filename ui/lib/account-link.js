module.exports = function (address, network) {
  const net = parseInt(network)
  let link
  switch (net) {
    case 1: // main net
      link = `https://etherblockchain.io/blockchain/accounts/${address}`
      break
    case 2: // morden test net
      link = `https://morden.etherblockchain.io/blockchain/accounts/${address}`
      break
    case 3: // ropsten test net
      link = `https://ropsten.etherblockchain.io/blockchain/accounts/${address}`
      break
    case 4: // rinkeby test net
      link = `https://rinkeby.etherblockchain.io/blockchain/accounts/${address}`
      break
    case 42: // kovan test net
      link = `https://kovan.etherblockchain.io/blockchain/accounts/${address}`
      break
    default:
      link = ''
      break
  }

  return link
}
