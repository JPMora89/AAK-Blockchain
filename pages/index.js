import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import ClipLoader from "react-spinners/ClipLoader";
import fileDownloader from "js-file-download";
import Image from "next/image";
import { signERC2612Permit } from "eth-permit";
import { nftaddress, nftmarketaddress, aeroAddress } from "../config";

import Aero from "../artifacts/contracts/v2/Aero.sol/Aero.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { faAmericanSignLanguageInterpreting } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useNetwork } from "wagmi";

let rpcEndpoint = null;

if (process.env.NEXT_PUBLIC_WORKSPACE_URL) {
  rpcEndpoint = process.env.NEXT_PUBLIC_WORKSPACE_URL;
}

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

export default function Home() {
  const { chain } = useNetwork();

  const styles = {
    nftContent: {
      display: "flex",
      flexDirection: "column-reverse",
      justifyContent: "space-between",
    },
  };

  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  const [routeUserUrl, setRouteUserUrl] = useState("/");
  const [routeProjectUrl, setRouteProjectUrl] = useState("/");

  useEffect(() => {
    loadNFTs();
    //getting session storage values
    // if (window.sessionStorage.getItem('routeUserUrl') != null) {
    //   setRouteUserUrl(window.sessionStorage.getItem('routeUserUrl'));
    // }

    // if (window.sessionStorage.getItem('routeProjectUrl') != null) {
    //  setRouteProjectUrl(window.sessionStorage.getItem('routeProjectUrl'));
    //}
  }, []);

  const downloadFile = (fileUrl, fileName, privateAsset) => {
    console.log("File Url => ", fileUrl);
    if (!privateAsset) {
      axios
        .get(fileUrl, {
          responseType: "blob",
        })
        .then((res) => {
          fileDownloader(res.data, fileName);
        });
    } else alert("This is private asset so only owner could download file!");
  };

  async function loadNFTs() {
    console.log(chain.name.toLowerCase());

    const infuraId = `https://${chain.name.toLowerCase()}.infura.io/v3/${
      process.env.NEXT_PUBLIC_INFURA_KEY
    }`;

    const provider = new ethers.providers.StaticJsonRpcProvider(infuraId);
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
        console.log(tokenUri);
        let meta;
        await axios.get(tokenUri).then(function (response) {
          console.log(response);
          meta = response
        }).catch(function (error) {
          console.log(error);
        });
        // console.log("response: ", response);
        console.log("Meta:");
        console.log(meta.data);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");

        //for url
        let item = {
          price,
          itemId: i.itemId.toNumber(),
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          private: i.isPrivateAsset,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          type: meta.data.type,
          doc: meta.data.doc,
          terms: meta.data.terms,
          extraFilesUrl: meta.data.extraFiles,
          origin: meta.data.origin,
          profileName: i.urlParameters.profileName,
          profileUserName: i.urlParameters.profileUserName,
          projectName: i.urlParameters.projectName,
          projectSlug: i.urlParameters.projectSlug,
          environment: i.urlParameters.environment,
          userType: i.urlParameters.userType,
          routeProjectUrl: routeProjectUrl,
          routeUserUrl: routeUserUrl,
        };

        if (i.hasOwnProperty("urlParameters")) {

          if (i.urlParameters.projectName.length > 0 && i.urlParameters.projectSlug.length > 0) {
            if (i.urlParameters.environment.includes("web.")) {
              item.routeProjectUrl = (djangoAccountUrl + "/project-details/" + i.urlParameters.projectSlug);
            } else {
              item.routeProjectUrl = (elggAccountUrl + "/create_projects/profile/" + i.urlParameters.projectSlug);
            }
          }




          if (i.urlParameters.userType.length > 0 && i.urlParameters.profileName.length > 0 && i.urlParameters.profileUserName.length > 0) {
            switch (i.urlParameters.userType) {
              case user:
                item.routeUserUrl = (elggAccountUrl + "/profile/" + i.urlParameters.profileUserName);
                break;
              case researchUser:
                item.routeUserUrl = (djangoAccountUrl + "/researchers/" + i.urlParameters.profileUserName);
                break;
              case investorUser:
                item.routeUserUrl = (djangoAccountUrl + "/investors/" + i.urlParameters.profileUserName);
                break;
              case institutionStaffUser:
                item.routeUserUrl = (djangoAccountUrl + "/institution_staff/" + i.urlParameters.profileUserName);
                break;
              case serviceProviderUser:
                item.routeUserUrl = (djangoAccountUrl + "/service_providers/" + i.urlParameters.profileUserName);
                break;
              case institution:
                item.routeUserUrl = (djangoAccountUrl + "/institution-details/" + i.urlParameters.profileUserName);
                break;
              case researchInstitution:
                item.routeUserUrl = (elggAccountUrl + "/research_institutions/profile/" + i.urlParameters.profileUserName);
                break;
              case privateInstitution:
                item.routeUserUrl = (elggAccountUrl + "/private_institutions/profile/" + i.urlParameters.profileUserName);
                break;
              case publicInstitution:
                item.routeUserUrl = (elggAccountUrl + "/public_institutions/profile/" + i.urlParameters.profileUserName);
                break;
              case otherInstitution:
                item.routeUserUrl = (elggAccountUrl + "/other_institutions/profile/" + i.urlParameters.profileUserName);
                break;
              case team:
                item.routeUserUrl = (djangoAccountUrl + "/teams/" + i.urlParameters.profileUserName);
                break;
              default:
                item.routeUserUrl = (djangoAccountUrl + "/researchers/" + i.urlParameters.profileUserName);
                break;
            }
          }

          // item = {
          //   price,
          //   itemId: i.itemId.toNumber(),
          //   tokenId: i.tokenId.toNumber(),
          //   seller: i.seller,
          //   owner: i.owner,
          //   private: i.isPrivateAsset,
          //   image: meta.data.image,
          //   name: meta.data.name,
          //   description: meta.data.description,
          //   type: meta.data.type,
          //   doc: meta.data.doc,
          //   terms: meta.data.terms,
          //   extraFilesUrl: meta.data.extraFiles,
          //   origin: meta.data.origin,
          //   profileName: i.urlParameters.profileName,
          //   profileUserName: i.urlParameters.profileUserName,
          //   projectName: i.urlParameters.projectName,
          //   projectSlug: i.urlParameters.projectSlug,
          //   environment: i.urlParameters.environment,
          //   userType: i.urlParameters.userType,
          //   routeProjectUrl: routeProjectUrl,
          //   routeUserUrl: routeUserUrl,
          // };

          return item;
        } else {
          item = {
            price,
            itemId: i.itemId.toNumber(),
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            private: i.isPrivateAsset,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
            type: meta.data.type,
            doc: meta.data.doc,
            terms: meta.data.terms,
            extraFilesUrl: meta.data.extraFiles,
            origin: meta.data.origin,
            profileName: "",
            profileUserName: "",
            projectName: "",
            projectSlug: "",
            environment: "",
            userType: "",
            routeProjectUrl: "",
            routeUserUrl: "",
          };
          return item;
        }
      })
    );

    setNfts(items);
    setLoadingState("loaded");
    console.log("items", items);
  }

  const getPermitSignature = async (
    signer,
    token,
    spender,
    value,
    deadline,
    signerAddr,
    tokenAddr
  ) => {
    console.log("getPermitSignature-1");
    const [nonce, name, version, chainId] = await Promise.all([
      token.nonces(signerAddr),
      token.name(),
      "1",
      chain.id,
    ]);

    console.log([nonce, name, version, chainId]);

    return ethers.utils.splitSignature(
      await signer._signTypedData(
        {
          name,
          version,
          chainId,
          verifyingContract: tokenAddr,
        },
        {
          Permit: [
            {
              name: "owner",
              type: "address",
            },
            {
              name: "spender",
              type: "address",
            },
            {
              name: "value",
              type: "uint256",
            },
            {
              name: "nonce",
              type: "uint256",
            },
            {
              name: "deadline",
              type: "uint256",
            },
          ],
        },
        {
          owner: signerAddr,
          spender,
          value,
          nonce,
          deadline,
        }
      )
    );
  };

  async function buyNft(nft) {
    console.log("buy nft-1");
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    console.log("buy nft-2");

    const signerAddress = await signer.getAddress();
    const aeroContract = new ethers.Contract(aeroAddress, Aero.abi, signer);
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const deadline = ethers.constants.MaxUint256;
    console.log("buy nft-3");

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );

    console.log("buy nft-4");

    const { v, r, s } = await getPermitSignature(
      signer,
      aeroContract,
      nftmarketaddress,
      price,
      deadline,
      signerAddress,
      aeroAddress
    );

    console.log("buy nft-5");

    // const tx = await aeroContract.permit(signerAddress, nft.seller, price, deadline, v, r, s);
    // await tx.wait();

    // console.log("Signer Address => ", signerAddress);
    // const allowance = await aeroContract.allowance(signerAddress, nftmarketaddress);
    // if (ethers.utils.formatEther(allowance.toString()) < ethers.utils.formatEther(price.toString())) {
    //   const tx = await aeroContract.approve(nftmarketaddress, price);
    //   await tx.wait();
    // }

    console.log(nft.itemId);
    const transaction = await marketContract.createMarketSale(
      nftaddress,
      nft.itemId,
      deadline,
      v,
      r,
      s
    );
    await transaction.wait();
    await loadNFTs();
  }

  function setprogressBar() {
    return (
      <div
        className="sweet-loading"
        style={{ marginTop: "200px", textAlign: "center" }}
      >
        <ClipLoader size={35} />
        <p
          className="font-bold"
          style={{ color: "#3079AB", textAlign: "center" }}
        >
          Loading up the market place, please wait...
        </p>
      </div>
    );
  }

  if (loadingState === "not-loaded") {
    return setprogressBar();
  }

  if (loadingState === "loaded" && !nfts.length) {
    return (
      <h1 className="px-20 py-10 text-3xl" style={{ color: "#3079AB" }}>
        No items in marketplace
      </h1>
    );
  }
  /*
environment: "https://web.aak-telescience.com"
profileUserName: "abdoohossamm"
projectName: "ASIC Implementation of Energy-Optimized Successive Cancellation Polar Decoders for Internet of Things"
projectSlug: "69"
userType: "/"
   */
  function getUserUrl(nft){
    if (nft.userType === ""){

    }
  }

  return (
    <div className="flex justify-center">
      <div className="p-4" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts
            .filter((nft) => {
              if (nft.private == false) {
                return nft;
              }
            })
            .map((nft, i) => (
              <div
                key={i}
                className="border shadow rounded-xl bg-black text-white"
                style={{ height: "90vh" }}
              >
                <div
                  style={{
                    width: "60%",
                    height: "60%",
                    margin: "-50px 50px",
                    position: "relative",
                    display: "block",
                  }}
                >
                  <Image
                    src={
                      "https://ipfs.io/ipfs/" + nft.image.split("ipfs://")[1]
                    }
                    alt="sample"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div>
                  <a
                    // href={`https://www.aaktelescience.com/${nft.origin}`}
                    target="_blank"
                  >
                    <div className="p-4 " style={{ margin: "-30px 0px" }}>
                      <div className="items-center text-center">
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
                        {nft.private ? (
                          <div className="ml-2">{`(private)`}</div>
                        ) : (
                          ""
                        )}
                      </div>
                      <div style={{ display: "flex" }}>
                        <p className="text-gray-400">
                          <b>By: </b>
                        </p>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Link href={nft.routeUserUrl} passHref={true}>
                          <a target="_blank">
                            <p
                              className="text-gray-400"
                              style={{
                                height: "20px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "250px",
                                whiteSpace: "nowrap",
                                color: "#0070f3",
                                textDecoration: "underline",
                                cursor: "pointer",
                              }}
                            >
                              {nft.profileName}
                            </p>
                          </a>
                        </Link>
                      </div>
                      <div style={{ display: "flex" }}>
                        <p className="text-gray-400" style={{ height: "20px" }}>
                          <b>Project: </b>
                        </p>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Link href={nft.routeProjectUrl} passHref={true}>
                          <a target="_blank">
                            <p
                              className="text-gray-400"
                              style={{
                                height: "20px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "250px",
                                whiteSpace: "nowrap",
                                color: "#0070f3",
                                textDecoration: "underline",
                                cursor: "pointer",
                              }}
                            >
                              {" "}
                              {nft.projectName}
                            </p>
                          </a>
                        </Link>
                      </div>
                      <div>
                        <p
                          className="text-gray-400"
                          style={{
                            height: "68px",
                            overflow: "auto",
                            textOverflow: "ellipsis",
                            maxWidth: "350px",
                            lineHeight: "1.4",
                            marginTop: "10px",
                            marginBottom: "10px",
                            textAlign: "justify",
                            hyphens: "auto",
                            paddingRight: "10px",
                          }}
                        >
                          {nft.description}
                        </p>
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <p className="text-gray-400">{nft.type}</p>
                      </div>
                      {/* <div className="cursor-pointer flex" style={{ overflow: "hidden" }} onClick={(e) => downloadFile(`${nft.extraFilesUrl}/${nft.doc}`, nft.doc, nft.private)}>
                      <p className="text-gray-400 mr-2">Document</p>
                      <Image
                        src={"/download.svg"}
                        alt="Picture of the author"
                        width={20}
                        height={20}
                      />
                    </div>
                    <div className="cursor-pointer flex" style={{ overflow: "hidden" }} onClick={(e) => downloadFile(`${nft.extraFilesUrl}/${nft.terms}`, nft.terms, nft.private)}>
                      <p className="text-gray-400 mr-2">Terms and Conditions</p>
                      <Image
                        src={"/download.svg"}
                        alt="Picture of the author"
                        width={20}
                        height={20}
                      />
                    </div> */}
                    </div>
                  </a>
                  <div className="p-4 bg-black" style={{ margin: "30px 0px" }}>
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
