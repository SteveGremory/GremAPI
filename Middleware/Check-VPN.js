import axios from "axios";

async function getThreatData(ipOverHere) {
  const KEY = "2791565e89c908ef6ac6f2bddbeab2614910a35191e4c847baa1dbee";
  let res = await axios.get(
    `https://api.ipdata.co/${ipOverHere}/threat?api-key=${KEY}`
  );
  let data = res.data;
  return data;
}

export const checkVPN = async (req, res) => {
  const ipAddr = req.connection.remoteAddress;
  console.log(ipAddr);
  const ipdata = await getThreatData(ipAddr);

  if (ipdata.is_known_abuser == false) {
    console.log("001");
  }
};
