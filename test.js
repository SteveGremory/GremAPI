import AvionDB from "aviondb";
import IPFS from "ipfs";
import { v4 as uuidv4 } from "uuid";

const initAvion = async () => {
  const ipfs = await IPFS.create();

  // Creates a db named "DatabaseName" in the ".aviondb" directory in the project root.
  const aviondb = await AvionDB.init("Grem", ipfs);

  // Creates a Collection named "Users"
  const collection = await aviondb.initCollection("Users");

  const email = "req.body.email";
  const password = "password";
  const username = "username";

  var findIfUserExists = await collection.findOne({
    email: email,
  });

  if (findIfUserExists == null) {
    return res.status(409).json({
      message: "This email/username is associated with another account. ",
    });
  } else {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({
          error: err,
        });
      } else {
        await collection.insertOne({
        _id: uuidv4(),
        email: email,
        password: hash,
        username: username,
        avatar: {},
        posts: [],
      }).then((result) => {
        console.log(result);
        res.status(201).json({
          message: "User created!",
        });
      }).catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
      
      }
    });
  }
};
initAvion();
