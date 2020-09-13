import IPFS from 'ipfs';

export const IPFSupload = async (fileToUpload) => {

    const ipfs = await IPFS.create().catch(Error)

    //example options to pass to IPFS
    const addOptions = {
    pin: true,
    wrapWithDirectory: true,
    };

    const file = {
        path: '/grem/',
        content: fileToUpload
      }

    const result = await ipfs.add(file, addOptions).catch(Error)

    console.info(`https://ipfs.io/ipfs/${result.cid}`)
}