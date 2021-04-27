// !Attention!  These keys are taken from default ganache mnemonic:
const mnemonic = 'tuna couch claim sorry artist asthma advice update luggage tonight car tree';
// We need to have truffle and ganache launched with this mnemonic
// to be able to sign with these keys and for test to work.
// Corresponding addresses (aacounts in test) should be:
const defaultAddresses = [
    '0x0d38dfbe5d20983db4A9Fc3DAfdBafd9C0bE6702',
    '0x9830EF2A1AA499e51c7CE54f8073CA6D459f7f49',
    '0x7aa5E97A4e5Cc4A91FDd52A748830ffE6FECBA6B',
    '0xA18b5936A7CFE4b0F65c3e80039D1B0608cA4f72',
    '0x552E1551a407442B0c994180139725290e1a5150',
    '0xD3B32fD4aB361202f24B52C0425C6ec8f9d975AF',
    '0xA6060F5c80D09442f81a16765488b989E053803a',
    '0xea518b3EAD22FD77710B33e1F223E8fbB1C36af4',
    '0x9a5BC57c03B6448dCb4569696FEAC57a937c3A92',
    '0xCA0668bDd4aa54B16bC0FB8a7f8D71679fe88fdb',
];
// If account addresses provided by ganache in your test are different
// signing will not work!
const defaultTruffleTestKeys = [
    '0x789a762fd020796fe686227a2f679d572ab1b1d560f823eec9783001fa2a7cc2',
    '0xa8bb1eda544e0a2c8e4072da9a44af2113b1fca6abedcb0da319024fa3ed8b98',
    '0x319a669114a33a091e059791a5cabee69c4b47f2ab6d9982fd229bcff07f96c7',
    '0x10f235a38b4d50474dc46e23b28050bdcdc3ff7c6cfa522e8ea53322ae461f56',
    '0xf2900b1f32bcbd0eb4996fe4e8419517a4206080ef37dfc48201b1607e5ea285',
    '0x8a1efbdc4403746eab16dc4bca5635a981ae4217c2c90da9a1af63076b20fcb5',
    '0x34c871fa59e8e0f6310a73f338f6a624a1a527e1684b90485c69bf2406834507',
    '0x0e3c46d11dfba87d5d10d79f71d65bd9ee3379de9924c0a698f4a4e83edc10f7',
    '0xc466073d552defa7cf9af6d1bf6fa966130952f7abf32bef4911f7d0e794fdb1',
    '0x9b9ad94277b34f00fa0abbf74e128391066f780b46942e798b01f33bfb3a37a1',
];

// this will combine default ganache addresses with respective private keys
const getFullAccounts = (addresses) => addresses.map(
    (address, idx) => ({
        address,
        privateKey: defaultTruffleTestKeys[idx],
    })
);

module.exports = { mnemonic, defaultAddresses, defaultTruffleTestKeys, getFullAccounts };
