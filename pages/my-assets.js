import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import ClipLoader from "react-spinners/ClipLoader";
import fileDownloader from 'js-file-download'
import Image from 'next/image'

import { nftmarketaddress, nftaddress } from "../config";

import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";

//get values for endpoints
const elggAccountUrl = `${process.env.NEXT_PUBLIC_ELGG_ACCOUNT_URL}`;
const djangoAccountUrl = process.env.NEXT_PUBLIC_DJANGO_ACCOUNT_URL;
const user = process.env.NEXT_PUBLIC_PROFILE_USER_TYPE_USER;
const researchUser = process.env.NEXT_PROFILE_USER_TYPE_RESEARCHER_USER;
const investorUser = process.env.NEXT_PROFILE_USER_TYPE_INVERSTOR_USER;
const institutionStaffUser = process.env.NEXT_PROFILE_USER_TYPE_INSTITUTION_STAFF_USER;
const serviceProviderUser = process.env.NEXT_PROFILE_USER_TYPE_SERVICE_PROVIDER_USER;
const institution = process.env.NEXT_PROFILE_USER_TYPE_INSTITUTION;
const researchInstitution = process.env.NEXT_PROFILE_USER_TYPE_RESEARCH_INSTITUTION;
const privateInstitution = process.env.NEXT_PROFILE_USER_TYPE_PRIVATE_INSTITUTION;
const publicInstitution = process.env.NEXT_PROFILE_USER_TYPE_PUBLIC_INSTITUTION;
const otherInstitution = process.env.NEXT_PROFILE_USER_TYPE_OTHER_INSTITUTION;
const team = process.env.NEXT_PROFILE_USER_TYPE_TEAM;

export default function MyAssets() {
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

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.connect(signer).fetchMyNFTs();
    console.log("My NFTS Data => ", data);
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        console.log(tokenUri);
        const meta = await axios.get(tokenUri);
        console.log("Meta:");
        console.log(meta.data);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");

        if (i.urlParameters.environment.includes('web.')) {
          routeProjectUrl = djangoAccountUrl + '/aak_projects/' + i.urlParameters.projectSlug;
          routeUserUrl = djangoAccountUrl;
        } else {
          routeProjectUrl = elggAccountUrl + '/create_projects/profile/' + i.urlParameters.projectSlug;
          routeUserUrl = elggAccountUrl + '/profile/' +i.urlParameters.profileUserName;
        }

        if (i.urlParameters.userType.length > 1) {
          switch (i.urlParameters.userType) {
            case user: routeUserUrl += '/profile/' + i.urlParameters.profileUserName;
              break;
            case researchUser: routeUserUrl += '/researchers/' + i.urlParameters.profileUserName;
              break;
            case investorUser: routeUserUrl += '/investors/' + i.urlParameters.profileUserName;
              break;
            case institutionStaffUser: routeUserUrl += '/institution_staff/' + i.urlParameters.profileUserName;
              break;
            case serviceProviderUser: routeUserUrl += '/service_providers/' + i.urlParameters.profileUserName;
              break;
            case institution: routeUserUrl += '/institutions/' + i.urlParameters.projectSlug;
              break;
              case researchInstitution: routeUserUrl += '/research_institutions/profile/' + i.urlParameters.projectSlug;
              break;
            case privateInstitution: routeUserUrl += '/private_institutions/profile/' + i.urlParameters.projectSlug;
              break;
            case publicInstitution: routeUserUrl += '/public_institutions/profile/' + i.urlParameters.projectSlug;
              break;
            case otherInstitution: routeUserUrl += '/other_institutions/profile/' + i.urlParameters.projectSlug;
              break;
            case team: routeUserUrl += '/teams/' + i.urlParameters.projectSlug;
              break;

          }
        }

        let item = {
          price,
          itemId: i.itemId.toNumber(),
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          type: meta.data.type,
          doc: meta.data.doc,
          terms: meta.data.terms,
          extraFilesUrl: meta.data.extraFiles,
          origin: meta.data.origin,
          private: i.isPrivateAsset,
          profileName: i.urlParameters.profileName,
          profileUserName: i.urlParameters.profileUserName,
          projectName: i.urlParameters.projectName,
          projectSlug: i.urlParameters.projectSlug,
          environment: i.urlParameters.environment,
          userType: i.urlParameters.userType,
          routeProjectUrl: routeProjectUrl,
          routeUserUrl: routeUserUrl,
        };
        return item;
      })
    );

    setNfts(items);
    setLoadingState("loaded");
  }

  function setprogressBar() {
    return (
      <div
        className="sweet-loading"
        style={{ marginTop: "200px", textAlign: "center" }}
      >
        <ClipLoader size={35} />
        <p className="font-bold" style={{ color: "#3079AB", textAlign: "center" }}>
          Loading up your assets, please wait...
        </p>
      </div>
    );
  }

  if (loadingState === "not-loaded") return setprogressBar();

  if (loadingState === "loaded" && !nfts.length)
    return (
      <h1 className="py-10 px-20 text-3xl" style={{ color: "#3079AB" }}>
        No assets owned
      </h1>
    );

  return (
    <div className="flex justify-center">
      <div className="p-4">
        <h2 className="text-2xl py-2" style={{ color: "#3079AB" }}>
          MY ASSETS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div
              key={i}
              className="border shadow rounded-xl overflow-hidden bg-black text-white"
            >
              <div  style={{ width: '60%', height: '60%', margin: '-50px 50px', position: 'relative', display: 'block' }}>
              <Image src={"https://ipfs.io/ipfs/" + nft.image.split("ipfs://")[1]} style={{ height: "211px", width: "100%" }} />
          </div>
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

                  <div style={{ display: "flex" }}>
                      <p className="text-gray-400"><b>By: </b></p>&nbsp;&nbsp;&nbsp;&nbsp;
                        <Link href={nft.routeUserUrl} passHref={true}>
                          <p className="text-gray-400" style={{
                          height: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "350px",
                          whiteSpace: "nowrap"
                        }}>{nft.profileName}</p>
                        </Link>
                      
                    </div>
                    <div style={{ display: "flex"}}>
                      
                        <p className="text-gray-400" style={{height:'20px'}}><b>Related To: </b></p>&nbsp;&nbsp;&nbsp;&nbsp;
                        <Link href={nft.routeProjectUrl} passHref={true}>
                          <p className="text-gray-400" style={{
                          height: "60px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "350px",
                          whiteSpace: "nowrap"
                        }}> {nft.projectName}</p>
                        </Link>
                    
                    </div>
                    
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
