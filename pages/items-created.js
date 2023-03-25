import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import ClipLoader from "react-spinners/ClipLoader";
import { nftmarketaddress, nftaddress } from "../config";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Image from 'next/image'
import fileDownloader from 'js-file-download'
import Modal from 'react-modal'
import { WithContext as ReactTags } from 'react-tag-input';

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [isOpen, setIsOpen] = useState(false)
  const [tags, setTags] = useState([]);
  const [privateNft, setPrivateNft] = useState();

  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchItemsCreated();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          itemId: i.itemId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          type: meta.data.type,
          doc: meta.data.doc,
          terms: meta.data.terms,
          extraFilesUrl: meta.data.extraFiles,
          private: i.isPrivateAsset,
        };
        return item;
      })
    );
    /* create a filtered array of items that have been sold */
    const soldItems = items.filter((i) => i.sold);
    setSold(soldItems);
    setNfts(items);
    setLoadingState("loaded");
  }

  const downloadFile = (fileUrl, fileName) => {
    axios.get(fileUrl, {
      responseType: 'blob',
    }).then(res => {
      fileDownloader(res.data, fileName);
    });
  }

  function openSharingModal(nft) {
    setPrivateNft(nft);
    setTags([]);
    setIsOpen(true);
  }

  async function shareAssetTo() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );

    const sharedAddrs = [];
    for (var i = 0; i < tags.length; i ++) {
      sharedAddrs.push(tags[i].id);
    }
    console.log(sharedAddrs);
    await marketContract.setSharedAddress(privateNft.itemId, sharedAddrs);
    
    alert("Sharing succes to " + sharedAddrs);
  }

  function copyLinkToClipboard() {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin : '';
    navigator.clipboard.writeText(origin + "/shared-asset/" + privateNft.itemId);
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

  const KeyCodes = {
    comma: 188,
    enter: 13
  };

  const delimiters = [KeyCodes.comma, KeyCodes.enter];

  const handleDelete = i => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddition = tag => {
    tag.text = tag.text.slice(0, 8) + "...";
    setTags([...tags, tag]);
  };

  const handleDrag = (tag, currPos, newPos) => {
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    setTags(newTags);
  };

  const handleTagClick = index => {
    console.log('The tag at index ' + index + ' was clicked');
  };

  if (loadingState === "not-loaded") return setprogressBar();

  if (loadingState === "loaded" && !nfts.length)
    return (
      <h1 className="py-10 px-20 text-3xl" style={{ color: "#3079AB" }}>
        No assets created
      </h1>
    );
  return (
    <div className="flex justify-center">
      <Modal className={"share-main-modal"} overlayClassName={"share-modal-overlay"} isOpen={isOpen}>
        <h2 className="text-2xl py-2" style={{ color: "#3079AB" }}>
          Share Private Asset
        </h2>
        <ReactTags
          tags={tags}
          delimiters={delimiters}
          handleDelete={handleDelete}
          handleAddition={handleAddition}
          handleDrag={handleDrag}
          handleTagClick={handleTagClick}
          inputFieldPosition="bottom"
          placeholder="Please add the new public address"
          autocomplete
        />
        <div className="row" style={{ textAlign: "right" }}>
          <button
            onClick={(e) => copyLinkToClipboard()}
            className="font-bold text-white rounded p-2 shadow-lg"
            style={{ backgroundColor: "#3079AB", marginTop: "12px" }}
          >
            Copy Link
          </button>
          <button
            onClick={(e) => shareAssetTo()}
            className="font-bold text-white rounded p-2 shadow-lg"
            style={{ backgroundColor: "#3079AB", marginTop: "12px", marginLeft: "12px" }}
          >
            Share Asset
          </button>
        </div>

        <div className="cursor-pointer close-modal-button" onClick={() => setIsOpen(false)}>
          <Image
            src={"/close-button.svg"}
            width={24}
            height={24}
          />
        </div>
      </Modal>
      <div className="p-4">
        <h2 className="text-2xl py-2" style={{ color: "#3079AB" }}>
          ASSETS CREATED
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div
              key={i}
              className="border shadow rounded-xl overflow-hidden bg-black text-white"
            >

              <img src={"https://ipfs.io/ipfs/" + nft.image.split("ipfs://")[1]} style={{ height: "211px", width: "100%" }} />
              {
                nft.private ? <div className="cursor-pointer share-icon-button" onClick={(e) => openSharingModal(nft)}>
                  <Image
                    src={"/icons8-share.svg"}
                    alt="Share the asset to specified wallet"
                    width={24}
                    height={24}
                  />
                </div> : ''
              }
              <div className="p-4">
                <div className="flex items-center text-center">
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
                </div>

                <div style={{ overflow: "hidden" }}>
                  <p className="text-gray-400">{nft.description}</p>
                </div>
                <div style={{ overflow: "hidden" }}>
                  <p className="text-gray-400">{nft.type}</p>
                </div>
                <div className="cursor-pointer flex" style={{ overflow: "hidden" }} onClick={(e) => downloadFile(`${nft.extraFilesUrl}/${nft.doc}`, nft.doc)}>
                  <p className="text-gray-400 mr-2">Document</p>
                  <Image
                    src={"/download.svg"}
                    alt="Picture of the author"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="cursor-pointer flex" style={{ overflow: "hidden" }} onClick={(e) => downloadFile(`${nft.extraFilesUrl}/${nft.terms}`, nft.terms)}>
                  <p className="text-gray-400 mr-2">Terms and Conditions</p>
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
    </div>
  );
}
