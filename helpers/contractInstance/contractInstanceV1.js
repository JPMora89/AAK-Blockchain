import fs from 'fs'
import path from 'path'
import { ethers } from 'ethers'
// import dotenv from 'dotenv'
import axios from "axios";
import { nftmarketaddress, nftaddress, aeroAddress } from '../../config'
require("dotenv").config({ path: path.resolve(__dirname, '.env') })
// dotenv.config()

var routeProjectUrl = null;
var routeUserUrl = null;
let rpcEndpoint = null;

if (process.env.NEXT_PUBLIC_WORKSPACE_URL) {
  rpcEndpoint = process.env.NEXT_PUBLIC_WORKSPACE_URL;
}

const elggAccountUrl = `${process.env.NEXT_PUBLIC_ELGG_ACCOUNT_URL}`;
const djangoAccountUrl = process.env.NEXT_PUBLIC_DJANGO_ACCOUNT_URL;
const user = process.env.NEXT_PROFILE_USER_TYPE_USER;
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

export const infuraId = `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`

export const provider = new ethers.providers.StaticJsonRpcProvider(infuraId)
const signer = new ethers.Wallet(process.env.NEXT_PRIVATE_KEY, provider)

const getTheMarketAbi = () => {
  try {
    console.log("Trying...");
    const dir = path.resolve(
      './',
      './artifacts/contracts/NFTMarket.sol/NFTMarket.json'
    )
    const file = fs.readFileSync(dir, 'utf8')
    const json = JSON.parse(file)
    const abi = json.abi
    return abi
  } catch (e) {
    console.log(`e`, e)
  }
}
const aeroContractAbi = () => {
  try {
    const dir = path.resolve(
      './',
      './artifacts/contracts/v2/Aero.sol/Aero.json'
    )
    const file = fs.readFileSync(dir, 'utf8')
    const json = JSON.parse(file)
    const abi = json.abi
    return abi
  } catch (e) {
    console.log(`e`, e)
  }
}
const nftContractAbi = () => {
  try {
    const dir = path.resolve(
      './',
      './artifacts/contracts/NFT.sol/NFT.json'
    )
    const file = fs.readFileSync(dir, 'utf8')
    const json = JSON.parse(file)
    const abi = json.abi
    return abi
  } catch (e) {
    console.log(`e`, e)
  }
}

export const nftmarketInstance = new ethers.Contract(
  nftmarketaddress,
  getTheMarketAbi(),
  signer
)
export const aeroInstance = new ethers.Contract(
  aeroAddress,
  aeroContractAbi(),
  signer
)
export const nftInstance = new ethers.Contract(
  nftaddress,
  nftContractAbi(),
  signer
)

export let asset_item = async (data) => {
  const tokenUri = await nftInstance.tokenURI(data.tokenId);
  const meta = await axios.get(tokenUri);
  let price = ethers.utils.formatUnits(data.price.toString(), "ether");

  //for url
  let item;

  if (data.hasOwnProperty('urlParameters')) {

    if (data.urlParameters.environment.includes('web.')) {
      routeProjectUrl = djangoAccountUrl + '/aak_projects/' + data.urlParameters.projectSlug;
      routeUserUrl = djangoAccountUrl;
    } else {
      routeProjectUrl = elggAccountUrl + '/create_projects/profile/' + data.urlParameters.projectSlug;
      routeUserUrl = elggAccountUrl + '/profile/' + data.urlParameters.profileUserName;
    }

    if (data.urlParameters.userType.length > 1) {
      switch (data.urlParameters.userType) {
        case user: routeUserUrl += '/profile/' + profileUsernameDecrypt
          break;
        case researchUser: routeUserUrl += '/researchers/' + profileUsernameDecrypt;
          break;
        case investorUser: routeUserUrl += '/investors/' + profileUsernameDecrypt;
          break;
        case institutionStaffUser: routeUserUrl += '/institution_staff/' + profileUsernameDecrypt;
          break;
        case serviceProviderUser: routeUserUrl += '/service_providers/' + profileUsernameDecrypt;
          break;
        case institution: routeUserUrl += '/institutions/' + projectUrlDecrypt;
          break;
        case researchInstitution: routeUserUrl += '/research_institutions/profile/' + data.urlParameters.projectSlug;
          break;
        case privateInstitution: routeUserUrl += '/private_institutions/profile/' + data.urlParameters.projectSlug;
          break;
        case publicInstitution: routeUserUrl += '/public_institutions/profile/' + data.urlParameters.projectSlug;
          break;
        case otherInstitution: routeUserUrl += '/other_institutions/profile/' + data.urlParameters.projectSlug;
          break;
        case team: routeUserUrl += '/teams/' + projectUrlDecrypt;
          break;
      }
    }
    
    item = {
      price,
      itemId: data.itemId.toNumber(),
      tokenId: data.tokenId.toNumber(),
      seller: data.seller,
      owner: data.owner,
      private: data.isPrivateAsset,
      image: meta.data.image,
      name: meta.data.name,
      description: meta.data.description,
      type: meta.data.type,
      doc: meta.data.doc,
      terms: meta.data.terms,
      extraFilesUrl: meta.data.extraFiles,
      origin: meta.data.origin,
      profileName: data.urlParameters.profileName,
      profileUserName: data.urlParameters.profileUserName,
      projectName: data.urlParameters.projectName,
      projectSlug: data.urlParameters.projectSlug,
      environment: data.urlParameters.environment,
      userType: data.urlParameters.userType,
      routeProjectUrl: routeProjectUrl,
      routeUserUrl: routeUserUrl
    };
  }
  else {
    item = {
      price,
      itemId: data.itemId.toNumber(),
      tokenId: data.tokenId.toNumber(),
      seller: data.seller,
      owner: data.owner,
      private: data.isPrivateAsset,
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
      routeUserUrl: ""
    };
  }

  return item;
}
