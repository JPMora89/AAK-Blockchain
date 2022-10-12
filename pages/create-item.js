import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import ClipLoader from "react-spinners/ClipLoader";
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
    origin: pathToAAK,
  });

  console.log("pathToAAK", pathToAAK);

  async function onChange(e) {
    const file = e.target.files[0];
    console.log(file);
  }
  async function createMarket() {
    // setSubmitLoading(true);
    const { name, description, price, type, doc, terms } = formInput;
    // if (!name || !price || !fileUrl) return;
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
    try {
      // var file = new File([data], "metadata.json", {type: "application/json"})
      // const rootCid = await client.put(file)
      // const url = `https://${rootCid}.ipfs.w3s.link`;
      // /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      // createSale(url);
      console.log("Input Ref:");
      console.log(inputRef.current.files[0]);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.createMarketItem(nftaddress, tokenId, price, {
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
              <input
                placeholder="Asset Name"
                className="mt-4 border rounded p-4"
                onChange={(e) =>
                  updateFormInput({ ...formInput, name: e.target.value })
                }
              />
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

              <input
                type="file"
                name="Contract"
                className="my-4"
                onChange={(e) =>
                  updateFormInput({ ...formInput, doc: e.target.value })
                }
              />

              <input
                placeholder="Asset Terms and Conditions"
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

              <input
                type="file"
                name="Terms"
                className="my-6"
                onChange={(e) =>
                  updateFormInput({ ...formInput, terms: e.target.value })
                }
              />

              <input
                placeholder="Asset Price in Aero"
                className="mt-2 border rounded p-4"
                onChange={(e) =>
                  updateFormInput({ ...formInput, price: e.target.value })
                }
              />
              <label
                style={{ ...styles.customFileUpload, maxWidth: "140px" }}
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
              {fileUrl && (
                <img
                  className="rounded mt-4"
                  width="350"
                  src={fileUrl}
                  style={{ width: "20vh" }}
                />
              )}
              <button
                onClick={createMarket}
                className="font-bold mt-4  text-white rounded p-4 shadow-lg"
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
