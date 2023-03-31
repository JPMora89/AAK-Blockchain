import Head from "next/head";
import "../styles/globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import Link from "next/link";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLandmark,
  faPlusCircle,
  faUserCircle,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import Image from 'next/image'

const { chains, provider } = configureChains([chain.goerli], [publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: 'AAK Telescience',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});


function Marketplace({ Component, pageProps }) {
  const styles = {
    parent: {
      zIndex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "90px",
      padding: "0px 128px",
      background: "#fff",
      boxShadow: "0 1px 10px rgb(151 164 175 / 10%)",
    },
  };

  async function connectWallet() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    provider.getSigner();

  }

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <div style={{ height: "100vh" }}>
          <Head>
            <title>AAK Ventures</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>
          <div style={styles.parent}>
            <div>
              <Link href="/">
                <Image
                  src={"/AAKLogo.svg"}
                  style={{ cursor: "pointer" }}
                  width={"100%"}
                  height={"100%"}
                />
              </Link>
            </div>
            <nav>
              <div className="flex">
                <Link href="/create-item">
                  <a className="mr-8 font-bold menu-item">
                    <FontAwesomeIcon icon={faPlusCircle} /> CREATE
                  </a>
                </Link>
                <Link href="/my-assets">
                  <a className="mr-8 font-bold menu-item">
                    <FontAwesomeIcon icon={faUserCircle} /> MY ASSETS
                  </a>
                </Link>
                <Link href="/items-created">
                  <a className="mr-8 font-bold menu-item">
                    <FontAwesomeIcon icon={faWallet} /> ASSETS CREATED
                  </a>
                </Link>
                <Link href="/aak-swap">
                  <a className="mr-8 font-bold menu-item">
                    <FontAwesomeIcon icon={faLandmark} /> AERO SWAP
                  </a>
                </Link>
                <div className="menu-item">
                  <ConnectButton label="Connect Wallet" />
                </div>
              </div>
            </nav>
          </div>

          <Component {...pageProps} />
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default Marketplace;
