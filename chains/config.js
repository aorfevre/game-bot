var helper = require('../admin/helper.js');


var lto = require('../chains/lto.js');
var ftm = require('../chains/ftm.js');

var cosmos = require('../chains/cosmos.js');
var one = require('../chains/one.js');
var tomo = require('../chains/tomo.js');
var xtz = require('../chains/xtz.js');

var avap = require('../chains/avap.js');

global.REQUIREMENTS = {
  LTOWallets: {
    btn_txt: "Add your LTO network wallet address",
    type: "LTOWallets",
    text_question: "1/ Type a LTO Network wallet address \n" +
      "2/ Enjoy!\n " +
      "\n" +
      "<i>You will receive notifications regarding transfers, lease and cancelled lease and mass transfers</i>",
    type_data: "text",
    check: helper.validateLTO,
    allow_dup: true,
    invalid: 'This is not a correct LTO mainnet address',
    explorer: 'https://explorer.lto.network/addresses/',
    name: 'LTO Network',
    balances: lto.getAllBalances

  },
  FTMWallets: {
    btn_txt: "Add your Fantom Opera network wallet address",
    type: "FTMWallets",
    text_question: "1/ Type a Fantom Opera wallet\n" +
      "2/ Enjoy!\n" +
      "\n" +
      "<i>You will receive notifications regarding transfers, delegation and un-delegation</i>",
    type_data: "text",
    check: helper.validateERC20,
    allow_dup: true,
    invalid: 'This is not a correct Fantom Opera address',
    explorer: 'https://explorer.fantom.network/addresses/',
    name: 'Fantom Network',
    balances: ftm.getAllBalances

  },
  ONEWallets: {
    btn_txt: "Add your Harmony network wallet address",
    type: "ONEWallets",
    text_question: "1/ Type a Harmony wallet address\n" +
      "2/ Enjoy!",
    type_data: "text",
    check: helper.validateONE,
    allow_dup: true,
    invalid: 'This is not a correct ONE mainnet address',
    explorer: 'https://explorer.harmony.one/#/address/',
    name: 'Harmony One',
    balances: one.getAllBalances

  },
  XTZWallets: {
    btn_txt: "Add your Tezos wallet address",
    type: "XTZWallets",
    text_question: "1/ Type a Tezos wallet address\n" +
      "2/ Enjoy!",
    type_data: "text",
    check: helper.validateXTZ,
    allow_dup: true,
    invalid: 'This is not a correct XTZ mainnet address',
    explorer: 'https://tzstats.com/',
    name: 'Tezos',
    balances: xtz.getAllBalances

  },
  TOMOWallets: {
    btn_txt: "Add your Tomochain wallet address",
    type: "TOMOWallets",
    text_question: "1/ Type a Tomochain wallet address\n" +
      "2/ Enjoy!",
    type_data: "text",
    check: helper.validateERC20,
    allow_dup: true,
    invalid: 'This is not a correct TOMO mainnet address',
    explorer: 'https://scan.tomochain.com/address/',
    name: 'Tomochain',
    balances: tomo.getAllBalances

  },
  COSMOSWallets: {
    btn_txt: "Add your Cosmos wallet address",
    type: "COSMOSWallets",
    text_question: "1/ Type a Cosmos wallet address\n" +
      "2/ Enjoy!",
    type_data: "text",
    check: helper.validateCOSMOS,
    allow_dup: true,
    invalid: 'This is not a correct ATOM mainnet address',
    explorer: 'https://www.mintscan.io/account/',
    name: 'Cosmos',
    balances: cosmos.getAllBalances

  },
  AVAPWallets: {
    btn_txt: "Add your AVA-P wallet address",
    type: "AVAPWallets",
    text_question: "1/ Type a AVA-P wallet address\n" +
      "2/ Enjoy!",
    type_data: "text",
    check: helper.noCheck,
    allow_dup: true,
    invalid: 'This is not a correct AVA-P mainnet address',
    explorer: 'https://explorer.ava.network/address/',
    name: 'AVA-P',
    balances: avap.getAllBalances

  },
  // AVAXWallets: {
  //   btn_txt: "Add your AVA-X wallet address",
  //   type: "AVAXWallets",
  //   text_question: "1/ Type a AVA-X wallet address\n" +
  //     "2/ Enjoy!",
  //   type_data: "text",
  //   check: helper.noCheck,
  //   allow_dup: true,
  //   invalid: 'This is not a correct AVA-X mainnet address',
  //   explorer: 'https://explorer.ava.network/address/',
  //   name: 'Cosmos',
  //   balances: cosmos.getAllBalances
  //
  // },



}