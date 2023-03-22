import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import ClipLoader from "react-spinners/ClipLoader";
import fileDownloader from 'js-file-download'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { nftmarketaddress, nftaddress } from "../../config";

import Market from "../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";

export default function SharedAsset() {
  const router = useRouter();
  const id = router.query.id;
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);

  const downloadFile = (fileUrl, fileName) => {
    console.log("File Url => ", fileUrl);
    axios.get(fileUrl, {
      responseType: 'blob',
    }).then(res => {
      fileDownloader(res.data, fileName);
    });
  }

  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);

    console.log(window.location);
    let params = window.location.pathname.split('/');
    const data = await marketContract.connect(signer).fetchMarketItemById(ethers.BigNumber.from(params[params.length - 1]));
    console.log("Shared address => ", data.sharedAddrs);
    if (data.sharedAddrs.includes(address) == false) {
      setNfts([]);
      setLoadingState("loaded");
      return;
    }
    
    const tokenUri = await tokenContract.tokenURI(data.tokenId);
    console.log(tokenUri);
    const meta = await axios.get(tokenUri);
    console.log("Meta:");
    console.log(meta.data);
    let price = ethers.utils.formatUnits(data.price.toString(), "ether");
    let item = {
      price,
      itemId: data.itemId.toNumber(),
      tokenId: data.tokenId.toNumber(),
      seller: data.seller,
      owner: data.owner,
      image: meta.data.image,
      name: meta.data.name,
      description: meta.data.description,
      type: meta.data.type,
      doc: meta.data.doc,
      terms: meta.data.terms,
      extraFilesUrl: meta.data.extraFiles,
      origin: meta.data.origin,
      private: data.isPrivateAsset,
    };

    setNfts([item]);
    setLoadingState("loaded");
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
          Loading up your assets, please wait...
        </p>
      </div>
    );
  }

  if (loadingState === "not-loaded") return setprogressBar();

  if (loadingState === "loaded" && !nfts.length)
    return (
      <h1 className="py-10 px-20 text-3xl" style={{ color: "#3079AB" }}>
        This Asset was not shared for you
      </h1>
    );

  return (
    <div className="flex justify-center">
      <div className="p-4">
        <h2 className="text-2xl py-2" style={{ color: "#3079AB" }}>
          SHARED ASSET
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div
              key={i}
              className="border shadow rounded-xl overflow-hidden bg-black text-white"
            >
              <img src={"https://ipfs.io/ipfs/" + nft.image.split("ipfs://")[1]} style={{ height: "211px", width: "100%" }} />

              <div className="p-4">
                {/* <a href={`https://www.aaktelescience.com/profile/${nft.origin}`} target="_blank"> */}
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
                {nft.private ?
                  <div className="ml-2">
                    {`(private)`}
                  </div> : ''}
                <div style={{ overflow: "hidden" }}>
                  <p className="text-gray-400">{nft.description}</p>
                </div>
                <div style={{ overflow: "hidden" }}>
                  <p className="text-gray-400">{nft.type}</p>
                </div>
                <div className="cursor-pointer flex" style={{ overflow: "hidden" }} onClick={(e) => downloadFile(`${nft.extraFilesUrl}/${nft.doc}`, nft.doc)}>
                  <p className="text-gray-400 mr-2">{nft.doc}</p>
                  <Image
                    src={"/download.svg"}
                    alt="Picture of the author"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="cursor-pointer flex" style={{ overflow: "hidden" }} onClick={(e) => downloadFile(`${nft.extraFilesUrl}/${nft.terms}`, nft.terms)}>
                  <p className="text-gray-400 mr-2">{nft.terms}</p>
                  <Image
                    src={"/download.svg"}
                    alt="Picture of the author"
                    width={20}
                    height={20}
                  />
                </div>
              </div>

              <div className="p-4 bg-black">
                <p className="text-2xl mb-4 font-bold text-white">
                  {nft.price} Aero
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div >
  );
}