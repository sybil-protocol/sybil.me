import React, { Component } from 'react';
import Web3 from "web3";
import ReactLoading from "react-loading";
import ipfsAPI from "ipfs-api";
import toBuffer from "blob-to-buffer";

function getEtherscanAddressUrl(addr, network = 'mainnet') {
  if (network === 'ropsten')  return `https://ropsten.etherscan.io/address/${addr}`;
  return `https://etherscan.io/address/${addr}`;
}

function getEtherscanTxUrl(addr, network = 'mainnet') {
  if (network === 'ropsten')  return `https://ropsten.etherscan.io/tx/${addr}`;
  return `https://etherscan.io/tx/${addr}`;
}

const truncate = addr => {
  return addr.substr(0, 16) + "...";
};

const ExternalLink = ({children, ...rest}) => {
    return <a target='_blank' rel="noopener noreferrer" {...rest}>{children}</a>;
}

const EtherscanTxLink = ({ transaction, truncate, text, network }) => {
    const inner = text || (truncate ? truncate(transaction) : transaction);
    return <ExternalLink href={getEtherscanTxUrl(transaction, network)}>
        {inner}
      </ExternalLink>;
}

const EtherscanAddressLink = ({ address, truncate, text, network }) => {
    const inner = text || (truncate ? truncate(address) : address);
    return <ExternalLink href={getEtherscanAddressUrl(address, network)}>
        {inner}
      </ExternalLink>;
};


class WithPendingTransaction extends Component {
  constructor() {
    super();
    this.state = {
      transaction: null,
      finished: false,
      succeded: false
    };
  }

  componentDidMount() {
    setInterval(this.refreshPending.bind(this), 1000);
  }

  componentWillReceiveProps(props) {
    if (props.transaction === this.props.transaction) return;
    this.setState({ finished: false });
  }

  async refreshPending() {
    if (this.props.transaction && !this.props.finished) {
      const { web3, transaction } = this.props;
      const receipt = await web3.eth.getTransactionReceipt(transaction);
      if (receipt === null) return;
      const succeded = receipt.status === "0x1";
      this.setState({ succeded, finished: true });
      if (this.props.onFinish) this.props.onFinish();
    }
  }

  render() {
    const { succeded, finished } = this.state;
    let { transaction, network, children, successMsg, failMsg, pendingMsg, showLoader } = this.props;
    successMsg = successMsg || "Transaction succeded.";
    failMsg = failMsg || "Transaction failed.";
    showLoader = showLoader === undefined ? true : showLoader;

    if (transaction) {
      if (finished) {
        return <div>
            {children}
            <p className={`status-msg ${succeded ? "success-text" : "fail-text"}`}>
              {succeded ? successMsg : failMsg}
            </p>
          </div>;
      }
      return (
        <span className="pending-tx">
          {pendingMsg !== undefined ? pendingMsg : <span>Pending confirmation (might take a minute):{" "}
          <EtherscanTxLink network={network} transaction={transaction} /></span>}
          {showLoader && <ReactLoading className="loading" type="spin" color="#444" />}
        </span>
      );
    } else {
      return children;
    }
  }
}

class EthereumWrapper extends Component {
  constructor() {
    super();
    this.state = {
      hasWeb3: false,
      network: null
    };
  }

  refreshLatestBlock() {
    const { web3 } = this.state;
    web3.eth.getBlock("latest", (err, block) => {
      this.setState({ blockNumber: block.number });
    });
  }

  async initWeb3(hasWeb3, web3, remoteWeb3) {
    const accounts = await web3.eth.getAccounts();

    const address = accounts[0];

    const netId = await web3.eth.net.getId();
    let network = null;
    switch (netId) {
      case 1:
        network = "mainnet";
        break;
      case 2:
        network = "rinkeby";
        break;
      case 3:
        network = "ropsten";
        break;
      default:
        break;
    }

    const isNetworkSupported = hasWeb3 && this.props.supportedNetworks.includes(network);

    this.setState(
      {
        web3: isNetworkSupported ? web3 : remoteWeb3,
        hasWeb3,
        network: isNetworkSupported ? network : this.props.supportedNetworks[0],
        isNetworkSupported,
        address
      },
      () => {
        this.refreshLatestBlock();
      }
    );
  }

  componentDidMount() {
    const REMOTE_WALLET = `https://${this.props.mainNetwork || 'mainnet'}.infura.io/WMJsUBMh7rbJXx3SgYIP`;

    const hasWeb3 = !!window.web3;
    const remoteWeb3 = new Web3(new Web3.providers.HttpProvider(REMOTE_WALLET));
    const web3 = hasWeb3 ? new Web3(window.web3) : remoteWeb3;

    this.initWeb3(hasWeb3, web3, remoteWeb3);
  }

  render() {
    if (!this.state.web3) return <p>Loading...</p>;
    const childrenWithProp = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, this.state);
    });
    return (
      <div>
        {/*<TopBar
          {...this.state}
          supportedNetworks={this.props.supportedNetworks}
        />*/}

        {childrenWithProp}
      </div>
    );
  }
}

const ipfs = ipfsAPI("ipfs.infura.io", "5001", { protocol: "https" });

const ipfsURL = hash => `https://ipfs.infura.io/ipfs/${hash}`;

const uploadFileToIpfs = (file) => {
  return new Promise((resolve, reject) => {
    toBuffer(file, (err, buf) => {
      ipfs.files.add(buf, (err, resp) => {
        if (err) return reject();
        resolve(resp[0].hash);
      });
    });
  });
}

const uploadStringToIpfs = async (str) => {
  const resp = await ipfs.files.add([new Buffer(str)]);
  return resp[0].hash;
};

const ipfsCat = async (hash) => {
  const decoder = new TextDecoder("utf-8");
  const content = await ipfs.files.cat(hash);
  return decoder.decode(content);
}

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

const isValidEthAddress = (addr) => ETH_ADDRESS_REGEX.test(addr)

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export {
  truncate,
  ExternalLink,
  EthereumWrapper,
  getEtherscanAddressUrl,
  getEtherscanTxUrl,
  EtherscanTxLink,
  EtherscanAddressLink,
  WithPendingTransaction,
  uploadFileToIpfs,
  uploadStringToIpfs,
  ipfsURL,
  ipfsCat,
  isValidEthAddress,
  ZERO_ADDRESS
};
