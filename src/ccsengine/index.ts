// import { argv } from 'process';
// import * as fs from 'fs';
// import { readFileSync } from 'fs';
// import IPFS from 'ipfs-core';
// import { create } from 'ipfs-core';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundleForPolkadot } from '@crustio/type-definitions';
import { sendTx, loadKeyringPair, delay } from './utils';
import logger from './log';
import { KeyringPair } from '@polkadot/keyring/types';

// main().catch((e) => {
//     console.log(e);
// });

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function uploadFileToCrust(argv: string[]) {
    /**********************Parameters from CMD*************************/
    // Get seeds of account from cmd
    const seeds = argv[2];
    if (!seeds) {
        logger.error('Please give the seeds of account');
        return;
    }

    // WS address of Crust chain
    const chain_ws_url = argv[3];
    if (!chain_ws_url) {
        logger.error('Please give chain url, for example: ws://localhost:9944');
        return;
    } else {
        logger.info('Chain url is: ' + chain_ws_url);
    }

    // The file will be stored on the Crust
    const fileInfocid = argv[4];
    const fileInfosize = argv[5];
    const fileInfosizenum: number = +fileInfosize;
    if (!chain_ws_url) {
        logger.error('Please give file path');
        return;
    } else {
        logger.info('File path is: ' + fileInfocid);
    }

    /***************************Base instance****************************/
    // // Read file
    // logger.info('Read file: ');
    // const fileContent = await fs.readFileSync(filePath);
    // logger.info('Read file: ' + fileContent);

    // Start local ipfs, ipfs base folder will be $USER/.jsipfs
    // const ipfs = await IPFS.create();
    // const ipfs = await create();
    // logger.info('Start local ipfs: ' + ipfs);

    // Connect to chain
    let api = new ApiPromise({
        provider: new WsProvider(chain_ws_url),
        typesBundle: typesBundleForPolkadot,
    });

    api = await api.isReady;

    // Load on-chain identity
    const krp = loadKeyringPair(seeds);

    /*****************************Main logic******************************/
    // Add file into ipfs
    // const fileInfo = await addFile(ipfs, fileContent);
    logger.info('File info: ' + JSON.stringify(fileInfocid));

    // Waiting for chain synchronization
    while (await isSyncing(api)) {
        logger.info(
            `⛓  Chain is synchronizing, current block number ${(
                await await api.rpc.chain.getHeader()
            ).number.toNumber()}`,
        );
        await delay(6000);
    }

    // Send storage order transaction
    const poRes = await placeOrder(api, krp, fileInfocid, fileInfosizenum, 0);
    if (!poRes) {
        logger.error('Place storage order failed');
        return;
    } else {
        logger.info('Place storage order success');
    }

    // Check file status on chain
    while (true) {
        const orderState = await getOrderState(api, fileInfocid);
        logger.info('Order status: ' + JSON.stringify(orderState));
        await delay(10000);
    }
}

/**
 * Place stroage order
 * @param api chain instance
 * @param fileCID the cid of file
 * @param fileSize the size of file in ipfs
 * @param tip tip for this order
 * @return true/false
 */
async function placeOrder(api: ApiPromise, krp: KeyringPair, fileCID: string, fileSize: number, tip: number) {
    // Determine whether to connect to the chain
    await api.isReadyOrError;
    // Generate transaction
    const pso = api.tx.market.placeStorageOrder(fileCID, fileSize, tip);
    // Send transaction
    const txRes = JSON.parse(JSON.stringify(await sendTx(krp, pso)));
    return JSON.parse(JSON.stringify(txRes));
}

/**
 * Add file into local ipfs node
 * @param ipfs ipfs instance
 * @param fileContent can be any of the following types: ` Uint8Array | Blob | String | Iterable<Uint8Array> | Iterable<number> | AsyncIterable<Uint8Array> | ReadableStream<Uint8Array>`
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// async function addFile(ipfs: IPFS.IPFS, fileContent: any) {
//     // Add file to ipfs
//     const cid = await ipfs.add(fileContent, {
//         progress: (prog) => console.log(`Add received: ${prog}`),
//     });

//     // Get file status from ipfs
//     const fileStat = await ipfs.files.stat('/ipfs/' + cid.path);

//     return {
//         cid: cid.path,
//         size: fileStat.cumulativeSize,
//     };
// }

/**
 * Get on-chain order information about files
 * @param api chain instance
 * @param cid the cid of file
 * @return order state
 */
async function getOrderState(api: ApiPromise, cid: string) {
    await api.isReadyOrError;
    return await api.query.market.files(cid);
}

/**
 * Used to determine whether the chain is synchronizing
 * @param api chain instance
 * @returns true/false
 */
async function isSyncing(api: ApiPromise) {
    const health = await api.rpc.system.health();
    let res = health.isSyncing.isTrue;

    if (!res) {
        const h_before = await api.rpc.chain.getHeader();
        await delay(3000);
        const h_after = await api.rpc.chain.getHeader();
        if (h_before.number.toNumber() + 1 < h_after.number.toNumber()) {
            res = true;
        }
    }

    return res;
}

export default uploadFileToCrust;
