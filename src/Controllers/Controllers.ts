import bcrypt from "bcrypt";
import AvionDB from "aviondb";
import IPFS from "ipfs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import "body-parser";

var collection;
//initialises AvionDB
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
//Has the signup logic
export const SignUpIPFS = async (req, res) => {
  const collection = await getAvionCollection();
  const findIfUserExistsEmail = await collection.findOne({
    email: req.body.email,
  });
  const findIfUserExistsUsername = await collection.findOne({
    username: req.body.username,
  });
  console.log(findIfUserExistsEmail);
  console.log(findIfUserExistsUsername);

  //console.log(findIfUserExists); {JUST FOR VERBOSING}

  if (findIfUserExistsEmail != null) {
    return res.status(409).json({
      message: "This email/username is associated with another account. ",
    });
  }
  if (findIfUserExistsUsername != null) {
    return res.status(409).json({
      message: "This email/username is associated with another account. ",
    });
  } else if (
    findIfUserExistsEmail == null &&
    findIfUserExistsUsername == null
  ) {
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
        postsNumber: 0,
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
//has the login logic
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
//adds a post to the user's profile; TODO: post id updates after every post.
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
//for finding a user by their uid
export const GetUser = async (req, res) => {
  const collection = await getAvionCollection();
  const UserInfo = await collection.findOne({ uid: req.body.uid });
  console.log(UserInfo);
  res.status(201).json({
    message: UserInfo,
  });
};
//find a user by email and send back their uid
export const GetUID = async (req, res) => {
  const collection = await getAvionCollection();
  const userUID = await collection.findOne({ email: req.body.email });
  res.status(201).json({
    message: userUID["uid"],
  });
};
//change a user's profile picture, by sending a user's uid
export const ChangePFP = async (req, res) => {
  const collection = await getAvionCollection();

  await collection
    .findOneAndUpdate(
      {
        uid: req.body.uid,
      },
      {
        $set: {
          avatar: { uri: req.body.avatar },
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
//find a user by their username.
export const FindByUsername = async (req, res) => {
  const collection = await getAvionCollection();
  var results = await collection.find({ username: req.body.username });
  res.status(201).json({
    message: results,
  });
  console.log(results);
};
//TODO: Follow Another User
export const FollowUser = async (req, res) => {
  const collection = await getAvionCollection();
  //find the person and add the follower
  const getFollower = await collection.findOne({ uid: req.body.followerUID });
  console.log(getFollower);
  const following = await collection.findOneAndUpdate(
    { username: req.body.followingUsername },
    { $addToSet: { followers: getFollower } }
  );
  const follower = await collection.findOneAndUpdate(
    { uid: req.body.followerUID },
    { $addToSet: {} }
  );
};
//TODO: get the posts of the people a user is following. this will be done by their UID as well.
export const GetFollowingPosts = async (req, res) => {
  console.log("TODO");
};