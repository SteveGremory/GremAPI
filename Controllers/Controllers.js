import bcrypt from "bcrypt";
import AvionDB from "aviondb";
import IPFS from "ipfs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import "body-parser";

var collection;

export const getAvionCollection = async () => {
  if (!collection) {
    const ipfs = await IPFS.create();
    const aviondb = await AvionDB.init("Grem", ipfs);
    collection = await aviondb.initCollection("Users");
    return collection;
  } else {
    return collection;
  }
};

export const SignUpIPFS = async (req, res) => {
  const collection = await getAvionCollection();
  var findIfUserExists = await collection.findOne({
    email: req.body.email,
    username: req.body.username,
  });

  //console.log(findIfUserExists); {JUST FOR VERBOSING}

  if ((await findIfUserExists) != null) {
    return res.status(409).json({
      message: "This email/username is associated with another account. ",
    });
  }
  if ((await findIfUserExists) == null) {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await collection
      .insertOne({
        uid: uuidv4(),
        email: req.body.email,
        password: hashedPassword,
        username: req.body.username,
        avatar: {},
        posts: [],
      })
      .then((result) => {
        res.status(201).json({
          message: "User created!",
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  }
};

export const LogInIPFS = async (req, res) => {
  const collection = await getAvionCollection();
  var findUserByEmail = await collection.findOne({
    email: req.body.email,
  });

  var findPasswordHash = findUserByEmail["password"];

  if ((await findUserByEmail) == null) {
    return res.status(401).json({
      message: "Auth failed",
    });
  }

  if ((await findUserByEmail) != null) {
    bcrypt.compare(req.body.password, findPasswordHash, (err, result) => {
      if (err) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      if (result) {
        const userUID = findUserByEmail["uid"];
        const token = jwt.sign(
          {
            email: findUserByEmail["email"],
            userId: userUID,
          },
          process.env.JWT_KEY,
          {
            expiresIn: "1h",
          }
        );
        return res.status(200).json({
          message: "Auth successful",
          token: token,
          uid: userUID,
        });
      }
      res.status(401).json({
        message: "Auth failed",
      });
    });
  }
};

export const DeleteUser = (req, res) => {
  User.remove({
    _id: req.params.userId,
  })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

export const UploadPost = async (req, res) => {
  const collection = await getAvionCollection();
  const test = await collection.findOneAndUpdate(
    {
      uid: req.body.uid,
    },
    {
      $addToSet: {
        posts: {
          id: req.body.id,
          text: req.body.text,
          image: req.body.image, //logic to get image data
        },
      },
    }
  );
  if (test == null) {
    res.status(500).json({
      message: "Upload Failed...",
    });
  }
  if (test != null) {
    res.status(200).json({
      message: "Upload Successful!",
    });
  }
  console.log(test);
};

export const GetPosts = async (req, res) => {
  const collection = await getAvionCollection();
  const UserPosts = collection.findOne({ uid: req.body.uid });
  console.log(UserPosts["posts"]);
  res.status(201).json({
    message: UserPosts,
  });
};
