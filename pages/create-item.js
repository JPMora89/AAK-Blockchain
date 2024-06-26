import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";

import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import ClipLoader from "react-spinners/ClipLoader";
import { Web3Storage } from "web3.storage";
import { NFTStorage } from "nft.storage";
import { Image } from "next/image";
import {
  decryptString,
  encryptString,
} from "../helpers/EncryptionDecryption/cryptoEncryptionDecryption.js";

// Construct with token and endpoint
const client = new NFTStorage({
  token: `${process.env.NEXT_PUBLIC_NFT_STORAGE_KEY}`,
});

import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

//get values for endpoints
const elggAccountUrl = process.env.NEXT_PUBLIC_ELGG_ACCOUNT_URL;
const djangoAccountUrl = process.env.NEXT_PUBLIC_DJANGO_ACCOUNT_URL;
const user = process.env.NEXT_PUBLIC_PROFILE_USER_TYPE_USER;
const researchUser = process.env.NEXT_PUBLIC_PROFILE_USER_TYPE_RESEARCHER_USER;
const investorUser = process.env.NEXT_PUBLIC_PROFILE_USER_TYPE_INVERSTOR_USER;
const institutionStaffUser = process.env.NEXT_PUBLIC_PROFILE_USER_TYPE_INSTITUTION_STAFF_USER;
const serviceProviderUser = process.env.NEXT_PUBLIC_PROFILE_USER_TYPE_SERVICE_PROVIDER_USER;
const institution = process.env.NEXT_PUBLIC_PROFILE_USER_TYPE_INSTITUTION;
const researchInstitution = process.env.NEXT_PUBLIC_PROFILE_USER_TYPE_RESEARCH_INSTITUTION;
const privateInstitution = process.env.NEXT_PUBLIC_PROFILE_USER_TYPE_PRIVATE_INSTITUTION;
const publicInstitution = process.env.NEXT_PUBLIC_PROFILE_USER_TYPE_PUBLIC_INSTITUTION;
const otherInstitution = process.env.NEXT_PUBLIC_PROFILE_USER_TYPE_OTHER_INSTITUTION;
const team = process.env.NEXT_PUBLIC_PROFILE_USER_TYPE_TEAM;
const seperator = process.env.NEXT_PUBLIC_ENCODING_SEPERATOR;

export default function CreateItem() {
  const [submitloading, setSubmitLoading] = useState(false);
  const router = useRouter();
  const [pathToAAK, setPathToAAK] = useState("");
  // 👇️ create a ref for the file input
  const inputRef = useRef(null);

  const [profileNameDecrypt, setProfileNameDecrypt] = useState("/");
  const [profileUserNameDecrypt, setProfileUserNameDecrypt] = useState("/");
  const [projectNameDecrypt, setProjectNameDecrypt] = useState("/");
  const [projectUrlDecrypt, setProjectUrlDecrypt] = useState("/");
  const [profileUserType, setProfileUserType] = useState("/");
  const [profileUserTypeValue, setProfileUserTypeValue] = useState("/");
  const [environment, setEnvironment] = useState("/");
  const [environmentValue, setEnvironmentValue] = useState(djangoAccountUrl);

  let urlParameters = {
      profileName: "",
      profileUserName: "",
      projectName: "",
      projectSlug: "",
      environment: "",
      userType: ""
  }
  const styles = {
    customFileUpload: {
      display: "inline-block",
      padding: "12px",
      cursor: "pointer",
      backgroundColor: "#3079AB",
      // maxWidth: "84px",
      color: "#fff",
      maxWidth: "160px",
      textAlign: "center",
      margin: "12px",
    },
  };

  useEffect(() => {
    let originPath = router.asPath;
    console.log("originPath", originPath);
    if (originPath.includes("?")) {
      let paramString = originPath.split("create-item.html?")[1];

      const paramArray = paramString.split(seperator);
      let queryString = "";
      let queryArray;

      paramArray.forEach(function (value, index) {
        try {
          async function fetchData() {
            const decodeUri = decodeURIComponent(value);
            console.log("decode URI value", decodeUri);
            const valueDecrypt = await decryptString(decodeUri);
            queryString += valueDecrypt;
            if (index == paramArray.length - 1) {
              queryArray = queryString
                .split("&")
                .reduce(function (obj, str, index) {
                  let strParts = str.split("=");
                  if (strParts[0] && strParts[1]) {
                    //<-- Make sure the key & value are not undefined
                    obj[strParts[0].replace(/\s+/g, "")] = strParts[1].trim(); //<-- Get rid of extra spaces at beginning of value strings
                  }
                  return obj;
                }, {});
              console.log(queryArray);

              for (let key in queryArray) {
                if (queryArray.hasOwnProperty(key)) {
                  console.log(
                    "Key is: " + key + " Value is: " + queryArray[key]
                  );
                  if (originPath.includes("?")) {
                    switch (key) {
                      case "new_env":
                        if (queryArray[key] === "0") {
                          setEnvironmentValue(elggAccountUrl);
                        } else if (queryArray[key] === "1") {
                          setEnvironmentValue(djangoAccountUrl);
                        }

                        break;
                      case "profile_name":
                        setProfileNameDecrypt(queryArray[key]);
                        break;

                      case "profile_username":
                        setProfileUserNameDecrypt(queryArray[key]);
                        break;

                      case "profile_user_type":
                        setProfileUserType(queryArray[key]);
                        switch (queryArray[key]) {
                          case "0":
                            setProfileUserTypeValue(user);
                            break;
                          case "1":
                            setProfileUserTypeValue(researchUser);
                            break;
                          case "2":
                            setProfileUserTypeValue(investorUser);
                            break;
                          case "3":
                            setProfileUserTypeValue(institutionStaffUser);
                            break;
                          case "4":
                            setProfileUserTypeValue(serviceProviderUser);
                            break;
                          case "5":
                            setProfileUserTypeValue(institution);
                            break;
                          case "6":
                            setProfileUserTypeValue(researchInstitution);
                            break;
                          case "7":
                            setProfileUserTypeValue(privateInstitution);
                            break;
                          case "8":
                            setProfileUserTypeValue(publicInstitution);
                            break;
                          case "9":
                            setProfileUserTypeValue(otherInstitution);
                            break;
                          case "10":
                            setProfileUserTypeValue(team);
                            break;
                        }
                        break;
                      case "project_name":
                        setProjectNameDecrypt(queryArray[key]);
                        break;

                      case "project_url":
                        setProjectUrlDecrypt(queryArray[key]);
                        break;
                    }
                  }
                }
              }
            }
          }
          fetchData().then().catch(console.error);
        } catch (err) {
          console.log("could not return");
        }
      });
    }
    /* if (originPath.includes("=") & !originPath.includes("&")) {
       originPath = `profile/${originPath.split("=")[1]}`;
     } else if (originPath.includes("=") && originPath.includes("&")) {
       originPath = `create_projects/profile/${originPath.split("=")[2]}`;
     }

     //setPathToAAK(originPath);
     */
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


  async function onChange(e) {
    const file = e.target.files[0];
    console.log(file);
    const metadata = await client.store({
      name: "Test",
      description: "Test",
      image: file,
    });
  }

  const onChangePrivateAsset = () => {
    updateFormInput({ ...formInput, privateAsset: !formInput.privateAsset });
  };
  function getFiles() {
    let files = new Array();
    var inputs = document.querySelectorAll("input[type=file]");
    inputs.forEach((input) => {
      //deal with each input
      files.push(input.files[0]);
      //use file
    });

    return files;
  }

  function makeStorageClient() {
    return new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY });
  }

  async function storeFiles(files) {
    const client = makeStorageClient();
    const cid = await client.put(files);
    console.log("stored files with cid:", cid);
    return cid;
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
      alert("Incomplete inputs!");
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
      image: file,
    });

    console.log(metadata);
    const finalCID = metadata.ipnft;

    console.log("Final CID => ", finalCID);

    const url = `https://ipfs.io/ipfs/${finalCID}/metadata.json`;


    console.log(urlParameters)
    console.log(profileNameDecrypt)
    console.log(environment)
    console.log(environmentValue)
    urlParameters = {
      profileName: profileNameDecrypt,
      profileUserName: profileUserNameDecrypt,
      projectName: projectNameDecrypt,
      projectSlug: projectUrlDecrypt,
      environment: environmentValue,
      userType: profileUserTypeValue,
    };
    console.log(urlParameters)
    await createSale(url);
    setSubmitLoading(false);
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();

    const provider = new ethers.providers.Web3Provider(connection);
    console.log("provider", provider);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    /* then list the item for sale on the marketplace */
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);
    const addr = await signer.getAddress();
    const isApprovedForAll = await nftContract.isApprovedForAll(
      addr,
      nftmarketaddress
    );
    console.log("isApprovedForAll => ", isApprovedForAll);
    if (!isApprovedForAll) {
      const tx = await nftContract.setApprovalForAll(nftmarketaddress, true);
      await tx.wait();
    }
    let listingPrice = await marketContract.getListingPrice();
    listingPrice = listingPrice.toString();

    console.log(
      "profileUserNameDecrypt before making ledger",
      profileUserNameDecrypt
    );
    console.log(
      "profileUserTypeValue before making ledger",
      profileUserTypeValue
    );

    console.log("nftaddress before making ledger", nftaddress);
    console.log("url before making ledger", url);
    console.log("price before making ledger", price);
    console.log(
      "formInput.privateAsset before making ledger",
      formInput.privateAsset
    );
    console.log("urlParameters before making ledger", urlParameters);
    console.log("listingPrice before making ledger", listingPrice);

    const transaction = await marketContract.createMarketItem(
      nftaddress,
      url,
      price,
      formInput.privateAsset,
      urlParameters,
      {
        value: listingPrice,
      }
    );
    console.log("testing --- transaction done");
    await transaction.wait();

    console.log("testing --- transaction done");
    router.push("/");
  }

  function setprogressBar() {
    return (
      <div
        className="sweet-loading"
        style={{ marginTop: "200px", textAlign: "center" }}
      >
        <ClipLoader submitloading={submitloading} size={35} />
        <p
          className="font-bold"
          style={{ color: "#3079AB", textAlign: "center" }}
        >
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
              <label>Asset Name</label>
              <input
                className="mt-4 border rounded p-4"
                onChange={(e) =>
                  updateFormInput({ ...formInput, name: e.target.value })
                }
              />

              <label>Asset Type</label>
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
              <label>Asset Price in Aero</label>
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
                <Image
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
