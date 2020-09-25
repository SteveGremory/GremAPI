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
        avatar: {
          uri:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQXBI4OyBdatLrVutR2Ku7CXGTVb5MOq5BBQA&usqp=CAU",
        },
        userFollowers: 0,
        userFollowing: 0,
        following: [],
        followers: [],
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

  if ((await findUserByEmail) == null) {
    return res.status(401).json({
      message: "Auth failed",
    });
  }
  if ((await findUserByEmail) != null) {
    var findPasswordHash = findUserByEmail["password"];
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
      return res.status(401).json({
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
  if (req.body.id == undefined || "") {
    res.status(500).json({
      message: "Upload failed!",
    });
  }
  if (req.body.text == undefined || "") {
    res.status(500).json({
      message: "Upload failed!",
    });
  }
  if (req.body.image == undefined) {
    res.status(500).json({
      message: "Upload failed!",
    });
  } else {
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
  }
};

export const GetUser = async (req, res) => {
  const collection = await getAvionCollection();
  const UserInfo = await collection.findOne({ uid: req.body.uid });
  console.log(UserInfo);
  res.status(201).json({
    message: UserInfo,
  });
};

export const GetUID = async (req, res) => {
  const collection = await getAvionCollection();
  const userUID = await collection.findOne({ email: req.body.email });
  res.status(201).json({
    message: userUID["uid"],
  });
};

export const ChangePFP = async (req, res) => {
  const collection = await getAvionCollection();
  const userInfo = await collection.findOne({ email: req.body.email });
  const userUID = userInfo["uid"];
  if (req.body.avatar == "" || null) {
    res.status(403).json({
      message: "A New Avatar is required.",
    });
  }
  await collection
    .findOneAndUpdate(
      {
        uid: userUID,
      },
      {
        $set: {
          avatar: req.body.avatar,
        },
      }
    )
    .then((result) => {
      res.status(201).json({
        message: "Profile Picture Updated!",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: err,
      });
    });
};

export const FindByUsername = async (req, res) => {
  const collection = await getAvionCollection();
  var results = await collection.find({ username: req.body.username });
  res.status(201).json({
    message: results,
  });
  console.log(results);
};
