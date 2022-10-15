import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import ClipLoader from "react-spinners/ClipLoader";

import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

let rpcEndpoint = null;

if (process.env.NEXT_PUBLIC_WORKSPACE_URL) {
  rpcEndpoint = process.env.NEXT_PUBLIC_WORKSPACE_URL;
}

export default function Home() {
  const styles = {
    nftContent: {
      display: "flex",
      flexDirection: "column-reverse",
      justifyContent: "space-between",
    },
  };

  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
 
    const infuraId = `https://goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`; 
  
    const provider = new ethers.providers.StaticJsonRpcProvider(
      infuraId
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    );
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        console.log("Meta:");
        console.log(meta.data);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          itemId: i.itemId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          type: meta.data.type,
          doc: meta.data.doc,
          terms: meta.data.terms,
          origin: meta.data.origin,
        };
        return item;
      })
    );
    
    setNfts(items);
    setLoadingState("loaded");
    console.log("items", items);
  }
  async function buyNft(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await contract.createMarketSale(
      nftaddress,
      nft.itemId,
      {
        value: price,
      }
    );
    await transaction.wait();
    loadNFTs();
  }

  function setprogressBar() {
    return (
      <div
        className="sweet-loading"
        align="center"
        style={{ marginTop: "200px" }}
      >
        <ClipLoader size={35} />
        <p align="center" className="font-bold" style={{ color: "#3079AB" }}>
          Loading up the market place, please wait...
        </p>
      </div>
    );
  }

  if (loadingState === "not-loaded") return setprogressBar();

  if (loadingState === "loaded" && !nfts.length)
    return (
      <h1 className="px-20 py-10 text-3xl" style={{ color: "#3079AB" }}>
        No items in marketplace
      </h1>
    );
  return (
    <div className="flex justify-center">
      <div className="p-4" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div
              key={i}
              className="border shadow rounded-xl overflow-scroll bg-black text-white"
              style={{ height: "80vh" }}
            >
              <img src={"https://ipfs.io/ipfs/"+nft.image.split("ipfs://")[1]} style={{ height: "211px", width: "100%" }} />
              <div style={styles.nftContent}>
                <a
                  href={`https://www.aaktelescience.com/${nft.origin}`}
                  target="_blank"
                >
                  <div className="p-4 " style={{ marginTop: "40px" }}>
                    <p
                      style={{
                        height: "40px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "250px",
                        whiteSpace: "nowrap",
                      }}
                      className="text-2xl font-semibold"
                    >
                      {nft.name}
                    </p>
                    <div style={{ overflow: "hidden" }}>
                      <p className="text-gray-400">{nft.description}</p>
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <p className="text-gray-400">{nft.type}</p>
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <p className="text-gray-400">{nft.doc?.slice(12)}</p>
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <p className="text-gray-400">{nft.terms?.slice(12)}</p>
                    </div>
                  </div>
                </a>
                <div className="p-4 bg-black" style={{ marginTop: "35px" }}>
                  <p className="text-2xl mb-4 font-bold text-white">
                    {nft.price} Aero
                  </p>
                  <button
                    className="w-full text-white font-bold py-2 px-12 rounded"
                    style={{ backgroundColor: "#3079AB" }}
                    onClick={() => buyNft(nft)}
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
