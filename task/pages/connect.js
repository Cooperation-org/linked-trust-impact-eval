import { useState, useEffect } from "react";
import { useViewerConnection, EthereumAuthProvider } from "@self.id/framework";
import styles from "../styles/Home.module.css";

const Disconnect = ({ onDisconnect, connection }) => {
  return (
    <button
      onClick={() => {
        onDisconnect();
      }}
      className={styles.btn}
    >
      Disconnect ({connection.selfID?.id})
    </button>
  );
};

const ConnectButton = ({ connection, conncetFunc }) => {
  return (
    <button
      disabled={connection.status === "connecting"}
      className={styles.btn}
      onClick={async () => {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        await conncetFunc(
          new EthereumAuthProvider(window.ethereum, accounts[0])
        );
      }}
    >
      Connect
    </button>
  );
};

export default function Connect() {
  const [connection, connect, disconnect] = useViewerConnection();
  const [isConnected, setIsConnected] = useState(false);
  const [isEth, setIsEth] = useState(false);

  useEffect(() => {
    if (connection.status === "connected") {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }

    if ("ethereum" in window) {
      setIsEth(true);
    } else {
      setIsEth(false);
    }
  }, [connection.status]);

  return (
    <main className={styles.main}>
      <div>
        {isConnected && (
          <Disconnect onDisconnect={disconnect} connection={connection} />
        )}
        {isEth && !isConnected && (
          <ConnectButton connection={connection} conncetFunc={connect} />
        )}
        {!isEth && !isConnected && (
          <p>
            An injected Ethereum provider such as{" "}
            <a href="https://metamask.io/">MetaMask</a> is needed to
            authenticate.
          </p>
        )}
      </div>
    </main>
  );
}
