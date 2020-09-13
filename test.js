import AvionDB from "aviondb";
import IPFS from "ipfs";

const initAvion = async () => {
  const ipfs = await IPFS.create();

  // Creates a db named "DatabaseName" in the ".aviondb" directory in the project root.
  const aviondb = await AvionDB.init("Grem", ipfs);

  // Creates a Collection named "Users"
  const collection = await aviondb.initCollection("Users");
}
initAvion();