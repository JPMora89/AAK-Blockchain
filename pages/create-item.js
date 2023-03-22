import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";

import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import ClipLoader from "react-spinners/ClipLoader";
import { Web3Storage } from 'web3.storage'
import { NFTStorage } from 'nft.storage'


// Construct with token and endpoint
const client = new NFTStorage({ token: `${process.env.NEXT_PUBLIC_NFT_STORAGE_KEY}` });

import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function CreateItem() {
  const [submitloading, setSubmitLoading] = useState(false);
  const router = useRouter();
  const [pathToAAK, setPathToAAK] = useState("");
  // 👇️ create a ref for the file input
  const inputRef = useRef(null);

  const styles = {
    customFileUpload: {
      display: "inline-block",
      padding: "12px",
      cursor: "pointer",
      backgroundColor: "#3079AB",
      // maxWidth: "84px",
      color: "#fff",
      maxWidth: "160px", textAlign: "center", margin: "12px"
    },
  };

  useEffect(() => {
    let originPath = router.asPath;
    console.log("ogiginPath", originPath);

    // if (originPath.includes("=")) {
    //   originPath = originPath.split("=")[2];
    // }

    if (originPath.includes("=") & !originPath.includes("&")) {
      originPath = `profile/${originPath.split("=")[1]}`;
    } else if (originPath.includes("=") && originPath.includes("&")) {
      originPath = `create_projects/profile/${originPath.split("=")[2]}`;
    }

    setPathToAAK(originPath);
  }, []);

  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
    type: "",
    doc: "",
    terms: "",
    privateAsset: false,
    origin: pathToAAK,
  });

  console.log("pathToAAK", pathToAAK);

  async function onChange(e) {
    const file = e.target.files[0];
    console.log(file);
    const metadata = await client.store({
      name: "Test",
      description: "Test",
      image: file
    });
  }

  const onChangePrivateAsset = () => {
    updateFormInput({ ...formInput, privateAsset: !formInput.privateAsset })
  }
  function getFiles() {

    let files = new Array;
    var inputs = document.querySelectorAll('input[type=file]');
    inputs.forEach(input => {
      //deal with each input
      files.push(input.files[0]);
      //use file
    });

    return files;
  }

  function makeStorageClient() {
    return new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY })
  }

  async function storeFiles(files) {
    const client = makeStorageClient()
    const cid = await client.put(files)
    console.log('stored files with cid:', cid)
    return cid
  }
  async function createMarket() {
    // const files = new Array(doc, terms, file);

    setSubmitLoading(true);
    const { name, description, price, type, doc, terms } = formInput;
    const file = inputRef.current.files[0];

    const files = getFiles();
    console.log(files);
    const cid = await storeFiles(files);
    console.log("CID => ", cid);

    if (!name || !price || !file) {
      alert("Incomplete inputs!")
      return;
    }

    const metadata = await client.store({
      name: name,
      description: description,
      price: price,
      type: type,
      extraFiles: `https://${cid}.ipfs.w3s.link`,
      doc: files[0].name,
      terms: files[1].name,
      image: file
    })

    console.log(metadata);
    const finalCID = metadata.ipnft;

    console.log("Final CID => ", finalCID);

    const url = `https://ipfs.io/ipfs/${finalCID}/metadata.json`;
    await createSale(url);
    setSubmitLoading(false);

    // /* first, upload to IPFS */
    // const data = JSON.stringify({
    //   name,
    //   description,
    //   image: fileUrl,
    //   type,
    //   doc,
    //   terms,
    //   origin: pathToAAK,
    // });
    // try {
    //   console.log(client);
    //   const metadata = await client.store({
    //     name: name,
    //     description: description,
    //     price: price,
    //     type: type,
    //     doc: doc,
    //     terms: terms,
    //     image: file
    //   });
    //   console.log(metadata);
    //   const cid = metadata.ipnft;
    //   console.log("CID", cid);
    //   const url = `https://ipfs.io/ipfs/${cid}/metadata.json`;
    //   console.log(url);
    //   // var file = new File([data], "metadata.json", {type: "application/json"})
    //   // const rootCid = await client.put(file)
    //   // const url = `https://${rootCid}.ipfs.w3s.link`;
    //   // /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
    //   // createSale(url);
    //   setSubmitLoading(false);

    // } catch (error) {
    //   console.log("Error uploading file: ", error);
    // }
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    
    const provider = new ethers.providers.Web3Provider(connection);
    console.log("provider", provider)
    const signer = provider.getSigner();

    /* next, create the item */
    // let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    // let transaction = await contract.createToken(url);
    // let tx = await transaction.wait();
    // let event = tx.events[0];
    // let value = event.args[2];
    // let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    /* then list the item for sale on the marketplace */
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);
    const addr = await signer.getAddress();
    const isApprovedForAll = await nftContract.isApprovedForAll(addr, nftmarketaddress);
    console.log("isApprovedForAll => ", isApprovedForAll);
    if (!isApprovedForAll) {
      const tx = await nftContract.setApprovalForAll(nftmarketaddress, true);
      await tx.wait();
    }
    let listingPrice = await marketContract.getListingPrice();
    listingPrice = listingPrice.toString();

    const transaction = await marketContract.createMarketItem(nftaddress, url, price, formInput.privateAsset, {
      value: listingPrice,
    });
    await transaction.wait();
    router.push("/");
  }

  function setprogressBar() {
    return (
      <div
        className="sweet-loading"
        align="center"
        style={{ marginTop: "200px" }}
      >
        <ClipLoader submitloading={submitloading} size={35} />
        <p align="center" className="font-bold" style={{ color: "#3079AB" }}>
          Transaction in progress, please wait...
        </p>
      </div>
    );
  }

  return (
    <>
      {submitloading ? (
        setprogressBar()
      ) : (
        <>
          <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
              <h1
                className="py-10 text-3xl flex "
                style={{ color: "#3079AB", alignSelf: "flex-start" }}
              >
                Create a New Asset
              </h1>
              <label>
                Asset Name
              </label>
              <input
                className="mt-4 border rounded p-4"
                onChange={(e) =>
                  updateFormInput({ ...formInput, name: e.target.value })
                }
              />

              <label>
                Asset Type
              </label>
              <select
                name="type"
                id="type"
                className="mt-2 border rounded p-4"
                style={{ color: "rgb(145, 145, 145)" }}
                onChange={(e) =>
                  updateFormInput({ ...formInput, type: e.target.value })
                }
              >
                <option value="">Asset Type</option>
                <option value="NDA">NDA</option>
                <option value="Patent">Patent</option>
                <option value="License Agreement">Licence Agreement</option>
              </select>

              <label>Asset Description</label>
              <input
                placeholder="Asset Description"
                className="mt-2 border rounded p-4"
                onChange={(e) =>
                  updateFormInput({ ...formInput, description: e.target.value })
                }
              />

              {/* <input
                placeholder={`${pathToAAK}`}
                className="mt-2 border rounded p-4"
                onChange={(e) =>
                  updateFormInput({ ...formInput, origin: pathToAAK })
                }
              /> */}
              <label>
                Asset Price in Aero
              </label>
              <input
                placeholder="Asset Price in Aero"
                className="mt-2 border rounded p-4"
                onChange={(e) =>
                  updateFormInput({ ...formInput, price: e.target.value })
                }
              />

              <div className="row">
                <label
                  style={{ ...styles.customFileUpload }}
                  className="rounded mt-4 font-bold"
                >
                  <input
                    type="file"
                    name="Contract"
                    className="my-4"
                    onChange={(e) =>
                      updateFormInput({ ...formInput, doc: e.target.value })
                    }
                    style={{ display: "none" }}
                  />
                  Choose Contract
                </label>

                <label
                  style={{ ...styles.customFileUpload }}
                  className="rounded mt-4 font-bold"
                >
                  <input
                    type="file"
                    name="Terms"
                    className="my-6"
                    onChange={(e) =>
                      updateFormInput({ ...formInput, terms: e.target.value })
                    }
                    style={{ display: "none" }}
                  />
                  Choose Terms
                </label>
                <label
                  style={{ ...styles.customFileUpload }}
                  className="rounded mt-4 font-bold"
                >
                  <input
                    type="file"
                    name="Asset"
                    className="my-6"
                    id="image"
                    ref={inputRef}
                    onChange={onChange}
                    style={{ display: "none" }}
                  />
                  Choose Image
                </label>
              </div>
              {fileUrl && (
                <img
                  className="rounded mt-4"
                  width="350"
                  src={fileUrl}
                  style={{ width: "20vh" }}
                />
              )}
              <div>
                <input
                  type="checkbox"
                  name="PrivateAsset"
                  className="my-6"
                  id="private_sale"
                  checked={formInput.privateAsset}
                  onChange={onChangePrivateAsset}
                />
                <span className="ml-5">Private Asset</span>
              </div>
              <button
                onClick={createMarket}
                className="font-bold text-white rounded p-4 shadow-lg"
                style={{ backgroundColor: "#3079AB" }}
              >
                Create Asset
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
