import { ethers } from "ethers";
import { useEffect, useState, useRef } from "react";
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
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Link from 'next/link';

const options = ['View', 'Buy', 'Remove'];

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

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tags, setTags] = useState([]);
  const [privateNft, setPrivateNft] = useState();
  const [currentSharedAddr, setCurrentSharedAddr] = useState();
  const itemsRef = useRef([]);

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


    var routeProjectUrl = null;
    var routeUserUrl = null;

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");

        console.log('meta: ', meta);
        console.log('item: ',i);

        if (i.urlParameters.environment.includes('web.')) {
          routeProjectUrl = djangoAccountUrl + '/aak_projects/' + i.urlParameters.projectSlug;
          routeUserUrl = djangoAccountUrl;
        } else {
          routeProjectUrl = elggAccountUrl + '/create_projects/profile/' + i.urlParameters.projectSlug;
          routeUserUrl = elggAccountUrl + '/profile/' +i.urlParameters.profileUserName;
        }

        if (i.urlParameters.userType.length > 1) {
          switch (i.urlParameters.userType) {
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
            case researchInstitution: routeUserUrl += '/create_projects/profile/' + projectUrlDecrypt;
              break;
            case privateInstitution: routeUserUrl += '/create_projects/profile/' + projectUrlDecrypt;
              break;
            case publicInstitution: routeUserUrl += '/create_projects/profile/' + projectUrlDecrypt;
              break;
            case otherInstitution: routeUserUrl += '/create_projects/profile/' + projectUrlDecrypt;
              break;
            case team: routeUserUrl += '/teams/' + projectUrlDecrypt;
              break;

          }
        }

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
          profileName: i.urlParameters.profileName,
          profileUserName: i.urlParameters.profileUserName,
          projectName: i.urlParameters.projectName,
          projectSlug: i.urlParameters.projectSlug,
          environment: i.urlParameters.environment,
          userType: i.urlParameters.userType,
          routeProjectUrl: routeProjectUrl,
          routeUserUrl: routeUserUrl
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
    setIsModalOpen(true);
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

    const sharedAddrs = [], permissions = [];
    console.log(tags);

    for (var i = 0; i < tags.length; i++) {
      sharedAddrs.push(tags[i].address);
      permissions.push(tags[i].permission);
    }


    console.log(sharedAddrs);
    console.log(permissions);

    let transaction = await marketContract.setSharedAddress(privateNft.itemId, sharedAddrs, permissions);
    await transaction.wait();
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
        style={{ marginTop: "200px", textAlign: "center" }}
      >
        <ClipLoader size={35} />
        <p className="font-bold" style={{ color: "#3079AB", textAlign: "center" }}>
          Loading up your assets, please wait...
        </p>
      </div>
    );
  }

  function addSharedAddress() {
    var removedTags = tags.filter(function (e) {
      return e.permission === 2
    });

    removedTags.forEach(function (element) {
      console.log(element)
      var index = tags.indexOf(element)
      console.log(index)
      tags.splice(index, 1)
    });

    console.log(tags);

    for (let i = 0; i < tags.length; i++) {
      if (tags[i].address == currentSharedAddr && tags[i].permission != 2) {
        return;
      }
    }

    itemsRef.current = itemsRef.current.slice(0, tags.length + 1);

    setTags([...tags, { "address": currentSharedAddr, "permission": 0, "open": false }]);
  }

  function setTagOpenStatus(tag, status) {
    let newTags = [...tags];
    for (let i = 0; i < newTags.length; i++) {
      if (newTags[i].address == tag) {
        newTags[i].open = status;
      }
    }

    setTags(newTags);
  }

  function getTagOpenStatus(tag) {
    for (let i = 0; i < tags.length; i++) {
      if (tags[i].address == tag) {
        return tags[i].open;
      }
    }
  }


  const handleClick = (selectedIndex) => {
    console.info(`You clicked ${options[selectedIndex]}`);
  };

  const handleMenuItemClick = (event, index, tag) => {
    // if (options[index] == "Remove") {
    //   setTagOpenStatus(tag, false);
    //   for (let i = 0; i < tags.length; i++) {
    //     if (tags[i].address == tag) {
    //       console.log('handleMenuItemClick', tag);
    //       setTags(tags.splice(i, 1));
    //       console.log('handleMenuItemClick', tags);
    //       return;
    //     }
    //   }
    // }

    for (let i = 0; i < tags.length; i++) {
      if (tags[i].address == tag) {
        tags[i].permission = index;
      }
    }
    setTagOpenStatus(tag, false);
  };

  const handleToggle = (tag) => {
    let isOpen = getTagOpenStatus(tag);
    console.log(tag, !isOpen);
    setTagOpenStatus(tag, !isOpen);
  };

  const handleClose = (event, tag) => {
    // if (tag.anchorRef.current && tag.anchorRef.current.contains(event.target)) {
    //   return;
    // }

    setTagOpenStatus(tag.address, false);
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
      <Modal className={"share-main-modal"} overlayClassName={"share-modal-overlay"} isOpen={isModalOpen}>
        <div style={{ width: "550px" }}>
          <h2 className="text-2xl py-2" style={{ color: "#3079AB" }}>
            Share Private Asset
          </h2>
          <div className="row">
            <input className="w-3/4 mt-8 border rounded p-2 mr-2" onChange={(e) => setCurrentSharedAddr(e.target.value)}></input>
            <button className="w-1/5 font-bold text-white rounded p-2 shadow-lg" style={{ backgroundColor: "#3079AB" }} onClick={(e) => addSharedAddress()}>Add</button>
          </div>
          <div className="border rounded mt-2" style={{ maxHeight: "400px", overflowY: "auto" }}>
            {tags.filter((d) => { if (d.permission != 2) { return d } }).map((tag, index) => (
              <div key={index} className="row m-2 shared-address-list">
                <div style={{ display: "inline-flex" }}>
                  <div className="shared-address-item">
                    <p>{tag.address}</p>
                  </div>

                  <ButtonGroup variant="contained" ref={el => itemsRef.current[index] = el} aria-label="split button">
                    <Button style={{width: "100px"}}>{options[tag.permission]}</Button>
                    <Button
                      size="small"
                      aria-controls={tag.open ? 'split-button-menu-' + index : undefined}
                      aria-expanded={tag.open ? 'true' : undefined}
                      aria-label="select merge strategy"
                      aria-haspopup="menu"
                      onClick={(e) => handleToggle(tag.address)}
                    >
                      <ArrowDropDownIcon />
                    </Button>
                  </ButtonGroup>
                  <Popper
                    sx={{
                      zIndex: 1,
                    }}
                    open={tag.open}
                    anchorEl={itemsRef.current[index]}
                    role={undefined}
                    transition
                    disablePortal
                  >
                    {({ TransitionProps, placement }) => (
                      <Grow
                        {...TransitionProps}
                        style={{
                          transformOrigin:
                            placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                      >
                        <Paper>
                          <ClickAwayListener onClickAway={(e) => handleClose(e, tag.address)}>
                            <MenuList id={"split-button-menu" + index} autoFocusItem>
                              {options.map((option, index) => (
                                <MenuItem
                                  key={option}
                                  selected={index === tag.permission}
                                  onClick={(event) => handleMenuItemClick(event, index, tag.address)}
                                >
                                  {option}
                                </MenuItem>
                              ))}
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </div>
              </div>
            ))}
          </div>
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

          <div className="cursor-pointer close-modal-button" onClick={() => setIsModalOpen(false)}>
            <Image
              src={"/close-button.svg"}
              width={24}
              height={24}
            />
          </div>
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
              style={{ height: "75vh" }}
            >

             <div  style={{ width: '60%', height: '60%', margin: '-50px 50px', position: 'relative', display: 'block' }}>
               <Image src={"https://ipfs.io/ipfs/" + nft.image.split("ipfs://")[1]}  alt="sample" layout='fill' objectFit='contain' />
             
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
              </div>
              <div className="p-4"  style={{margin: '-30px 0px'}}>
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
