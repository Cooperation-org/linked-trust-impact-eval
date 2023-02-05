// import custom components
import Header from "./Header";

import { useState, useEffect } from "react";
import { useViewerConnection, EthereumAuthProvider } from "@self.id/framework";
import styles from "../styles/Approve.module.css";

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
        const selfid = await conncetFunc(
          new EthereumAuthProvider(window.ethereum, accounts[0])
        );

        const session = selfid.client.session; //or connection.selfID.client.session
        const sessionString = session.serialize();
        localStorage.setItem("sessionString", sessionString);
      }}
    >
      Connect
    </button>
  );
};

export default function Layout({ children }) {
  const [connection, connect, disconnect] = useViewerConnection();
  const [isConnected, setIsConnected] = useState(false);
  const [isEth, setIsEth] = useState(false);

  useEffect(() => {
    const sessionString = localStorage.getItem("sessionString");
    if (sessionString && connection.status !== "connected") {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((addresses) => {
          connect(
            new EthereumAuthProvider(window.ethereum, addresses[0]),
            sessionString
          );
        });
    }
  }, []);

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

  // styles the main html tag
  const styles = {
    display: "flex",
    flexDirection: "row",
  };
  return (
    <>
      <Header />
      <main style={styles}>
        <section style={{ width: "1024px" }}>
          <div
            className={styles.paragraf}
            style={{ margin: "5px 0px 0px 165px" }}
          >
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
          {children}
        </section>
      </main>
    </>
  );
}
