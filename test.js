import axios from 'axios'

async function getThreatData(ipOverHere) {
    const KEY = '2791565e89c908ef6ac6f2bddbeab2614910a35191e4c847baa1dbee'
    let res = await axios.get(`https://api.ipdata.co/${ipOverHere}/threat?api-key=${KEY}`).then().catch(Error);
    let data = res.data;
    return userThreatInfo = data;
}

getThreatData('8.8.8.8')