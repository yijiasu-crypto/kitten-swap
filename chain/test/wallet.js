// !Attention!  These keys are taken from default ganache mnemonic:
const mnemonic_12 = 'tuna couch claim sorry artist asthma advice update luggage tonight car tree';
const mnemonic_24 = 'yard similar hotel exercise calm cousin forget wisdom swallow fatal afraid what dog panther nose age ramp portion floor scene cruise soul strong rose';

const mnemonic = mnemonic_24;

// We need to have truffle and ganache launched with this mnemonic
// to be able to sign with these keys and for test to work.
// Corresponding addresses (aacounts in test) should be:
const defaultAddresses = [
    '0x90FdB51c13Ce085cE7F9c0dA8683B7327711b064',
    '0xeaCBa4a0B94a7faE0eC4C3E5e303320cB6CAc0AA',
    '0xBd2168238b5cE311B28ABB00BfC119f31E040b86',
    '0x456c710472DAB617fd45264F0971D6be2415ACAB',
    '0x7eFB761519b7fE74be72D303eDe99d81bE7d2813',
    '0x8614b169b22A351BdDb45c150366DEE7Af3B26d6',
    '0xC43383ddB4Cca76d5C0de69c19bCC64cC827fCEC',
    '0x306aa6B89196DBdf917E0d01BC11e86F64A5567d',
    '0xaaca7D818C1623e6C734595017273d50Da8e96fc',
    '0xeE9f52Ba99cfD7f65Ac0a66164eb227db52118A7',
];

// If account addresses provided by ganache in your test are different
// signing will not work!
const defaultTruffleTestKeys = [
    '0x49a2c89120ffdf59157e6a29b7bb3210899915adc9ae758bf1a22b0f33000d05',
    '0xf7675b1798667f97f8f71971e0eb810b0fbdd9369c220503b2832cfc1277c537',
    '0x04adcfd1f251a66901b28e7edf473fb9af07edbb5a0f3a3a8541946341f5d486',
    '0x736511a00b3de118cabdd105b2172469aa61337a947566065c359394e30af24c',
    '0x3c8770ac7cb9a549729b245fc890ab031481f4f820ad9635037ad482a8582cc0',
    '0x2b2d04cd9ba1d3ce3b959d8d22cc4cac6cc1fc8d2106a4d4518309afd137238e',
    '0x5cdb3880debc4805e0023d41d11b075ba5eef2b847fa65edb4d9834b2bc0246f',
    '0xd1b56484d4a2ad0aa7c529f019b83cf4a951164186ed0576f75f35b95c81a34f',
    '0x4cc0a376d58e881c9995c8bad38275648db0e08b7d3edc3ff9ffe19f43b768e7',
    '0x9715bbedb4ac68becee0bb82b49b68384f412dbb8b709f52ea05133865c19c3f',
];

// this will combine default ganache addresses with respective private keys
const getFullAccounts = (addresses) => addresses.map(
    (address, idx) => ({
        address,
        privateKey: defaultTruffleTestKeys[idx],
    })
);

module.exports = { mnemonic, defaultAddresses, defaultTruffleTestKeys, getFullAccounts };
