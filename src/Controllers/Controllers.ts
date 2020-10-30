import bcrypt from "bcrypt";
import AvionDB from "aviondb";
import IPFS from "ipfs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import "body-parser";

import { createModuleResolutionCache } from "typescript";
//TODO: IMPLEMENT TYPES.
//initialise AvionDB

var collection;
var collectionComments;
var aviondb;
var collectionLikes;
const initIPFSandAvion = async () => {
  if (!aviondb) {
    const ipfs = await IPFS.create();
    aviondb = await AvionDB.init("Grem", ipfs);
    return aviondb;
  } else {
    return aviondb;
  }
};

const getAvionCollection = async () => {
  if (!collection) {
    const aviondb = await initIPFSandAvion();
    collection = await aviondb.initCollection("Users");
    return collection;
  } else {
    return collection;
  }
};
const getAvionCollectionComments = async () => {
  if (!collectionComments) {
    const aviondb = await initIPFSandAvion();
    collectionComments = await aviondb.initCollection("Comments");
    return collectionComments;
  } else {
    return collectionComments;
  }
};
const getAvionCollectionLikes = async () => {
  if (!collectionLikes) {
    const aviondb = await initIPFSandAvion();
    collectionLikes = await aviondb.initCollection("Likes");
    return collectionLikes;
  } else {
    return collectionLikes;
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
        avatar:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQXBI4OyBdatLrVutR2Ku7CXGTVb5MOq5BBQA&usqp=CAU",

        userFollowers: 0,
        userFollowing: 0,
        postsNumber: 0,
        following: [],
        followers: [],
        posts: [
          {
            id: "0",
            text: "Welcome To Grem!",
            image:
              "https://images.pexels.com/photos/4101555/pexels-photo-4101555.jpeg",
            comments: [],
          },
        ],
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
          process.env.JWT_KEY
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
//adds a post to the user's profile; TODO: comments system
export const UploadPost = async (req, res) => {
  const collectionComments = await getAvionCollectionComments();
  const collectionLikes = await getAvionCollectionLikes();
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
  } else {
    const commentInitialUID = uuidv4();
    const likesInitialUID = uuidv4();

    await collectionLikes.insertOne({
      uid: likesInitialUID,
      likesFinal: [],
      likesNumber: 0,
    });
    await collectionComments.insertOne({
      uid: commentInitialUID,
      commentsFinal: [],
      commentsNumber: 0,
      commentLikes: 0,
    });
    const test = await collection.findOneAndUpdate(
      {
        uid: req.body.uid,
      },
      {
        $addToSet: {
          posts: {
            postUID: uuidv4(),
            id: Number(req.body.id),
            timestamp: new Date().getTime(),
            text: req.body.text,
            image: req.body.image,
            comments: commentInitialUID,
            likes: likesInitialUID,
          },
        },
      }
    );
    console.log(test);

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
    const NumberPosts = await collection.findOne({ uid: req.body.uid });
    const count = NumberPosts.posts.length;
    if (count == null || "") {
      console.log("PostsNull");
    } else if (count != null || "") {
      await collection.findOneAndUpdate(
        {
          uid: req.body.uid,
        },
        {
          $set: {
            postsNumber: count,
          },
        }
      );
    }
  }
};
//for finding a user by their uid
export const GetUser = async (req, res) => {
  const collection = await getAvionCollection();
  const UserInfo = await collection.findOne({ uid: req.body.uid });
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
//change a user's profile picture, by sending a user's uid - TODO
export const ChangePFP = async (req, res) => {
  const collection = await getAvionCollection();

  await collection
    .findOneAndUpdate(
      {
        uid: req.body.uid,
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
//find a user by their username.
export const FindByUsername = async (req, res) => {
  const collection = await getAvionCollection();
  var results = await collection.findOne({ username: req.body.username });
  res.status(201).json({
    message: results,
  });
};
//search user, obvio lol
export const SearchUser = async (req, res) => {
  const collection = await getAvionCollection();
  var results = await collection.find({ username: req.body.username });
  res.status(201).json({
    message: results,
  });
};
//TODO: UPDATE USER STATS: https://discordapp.com/channels/616677539812868097/693051173300731914/760412761934790676
export const FollowUser = async (req, res) => {
  //here, first person is the person who clicks on follow and the second person is who is getting followed.
  const collection = await getAvionCollection();
  //find the person and add the follower
  const getFollower = await collection
    .findOne({
      username: req.body.followerUsername,
    })
    .catch((err) => {
      res.status(500).json(err);
    }); //get person 1's details by their UID
  const getFollowing = await collection
    .findOne({
      username: req.body.followingUsername,
    })
    .catch((err) => {
      res.status(500).json(err);
    }); // get person 2's details by their Username
  if (getFollower == "" || null) {
    res.status(500);
  }
  if (getFollowing == "" || null) {
    res.status(500);
  } else if ((getFollower != "" || null) && (getFollowing != "" || null)) {
    await collection
      .findOneAndUpdate(
        { username: req.body.followingUsername },
        { $addToSet: { following: getFollower.uid } }
      )
      .then((result) => {
        res.status(200).json({ message: "Added UID to person" });
      })
      .catch((err) => {
        res.status(500);
      }); //put the follower's name in the second person's account

    await collection
      .findOneAndUpdate(
        { username: req.body.followerUsername },
        {
          $addToSet: { followers: getFollowing.uid },
        }
      )
      .then((result) => {
        res.status(200);
      })
      .catch((err) => {
        res.status(500);
      });

    const countFollower = getFollower.followers.length;
    await collection
      .findOneAndUpdate(
        { uid: getFollower.uid },
        { $set: { userFollowers: countFollower } }
      )
      .catch((err) => {
        console.log(err);
      });
    //<br></br>
    const countFollowing = getFollowing.following.length;
    await collection
      .findOneAndUpdate(
        { uid: getFollowing.uid },
        { $set: { userFollowing: countFollowing } }
      )
      .catch((err) => {
        console.log(err);
      });
    //console.log(getFollower) consle logs the result
    //console.log(getFollowing) console logs the result
  }
};
//TODO: get the posts of the people a user is following. this will be done by their UID as well.
export const GetFollowingPosts = async (req, res) => {
  console.log("TODO");
};
//TODO: get if the user is following the other user or not
export const IsFollowing = async (req, res) => {
  //here, first person is the person who clicks on follow and the second person is who is getting followed.
  const collection = await getAvionCollection();
  //find the person and add the follower
  const getFollower = await collection
    .findOne({
      username: req.body.followerUsername,
    })
    .catch((err) => {
      res.status(500).json(err);
    }); //get person 1's details by their UID
  const getFollowing = await collection
    .findOne({
      username: req.body.followingUsername,
    })
    .catch((err) => {
      res.status(500).json(err);
    }); // get person 2's details by their Username
  const getFollowerQuery = getFollower.followers;
  //console.log(getFollowerQuery); console logs the uid
  if (getFollower == "" || null) {
    res.status(500);
  }
  if (getFollowing == "" || null) {
    res.status(500);
  } else if ((getFollower != "" || null) && (getFollowing != "" || null)) {
    if (getFollowerQuery.includes(getFollowing.uid) == true) {
      res.status(200).json({ message: "true" }); //is following
    } else if (getFollowerQuery.includes(getFollower.uid) == false) {
      res.status(200).json({ message: "false" }); //isn't following
    }
  }
};
//not working yet: TODO
export const UnfollowUser = async (req, res) => {
  //here, first person is the person who clicks on follow and the second person is who is getting followed.
  const collection = await getAvionCollection();
  //find the person and add the follower
  const getFollower = await collection
    .findOne({
      username: req.body.followerUsername,
    })
    .catch((err) => {
      res.status(500).json(err);
    }); //get person 1's details by their UID
  const getFollowing = await collection
    .findOne({
      username: req.body.followingUsername,
    })
    .catch((err) => {
      res.status(500).json(err);
    }); // get person 2's details by their Username
  const personOneArray = getFollower.following;
  const personTwoArray = getFollowing.uid;

  //arr.filter(e => e !== 'B');
  const UpdatedArray = 0; //code here
};
//TODO: get comments with user pfp, name and text for a specified picture
export const GetComments = async (req, res) => {
  const collection = await getAvionCollection();
  const collectionComments = await getAvionCollectionComments();
  const uploaderProfile = await collection.findOne({
    uid: req.body.uid,
  });
  const posts = uploaderProfile.posts;
  const foundValue = posts.filter((obj) => obj.postUID === req.body.postUID);
  const commentUID = foundValue[0].comments;
  if (foundValue != "" || null) {
    const comments = await collectionComments
      .findOne({ uid: commentUID })
      .then((result) => {
        res.status(201).json({ message: result });
      });
  } else {
    res.status(500).json({ message: "an error has occoured." });
  }
};
//TODO
export const LikePost = async (req, res) => {
  const collection = await getAvionCollection();
  const collectionLikes = await getAvionCollectionLikes();
  const uploaderProfile = await collection.findOne({
    username: req.body.usernamePostOwner,
  });
  const posts = uploaderProfile.posts;
  const foundValue = posts.filter((obj) => obj.postUID === req.body.postUID);
  const likesUID = foundValue[0].likes;
  const addLike = await collectionLikes
    .findOneAndUpdate(
      { uid: likesUID },
      {
        $addToSet: {
          likesFinal: req.body.posterUID,
        },
      }
    )
    .then((result) => {
      res.status(201).json({ message: "Liked!" });
    })
    .catch((err) => {
      res.status(500).json({ message: "an error has occoured." });
    });
  const NumberLikes = await collectionLikes.findOne({ uid: likesUID });

  const count = NumberLikes.likesFinal.length;
  await collectionComments
    .findOneAndUpdate(
      {
        uid: likesUID,
      },
      {
        $set: {
          likesNumber: count,
        },
      }
    )
    .then((result) => {})
    .catch((err) => {
      console.log(err);
    });
};

export const GetLikes = async (req, res) => {
  //get the UIDs of the peeps who have liked.
  const collection = await getAvionCollection();
  const collectionLikes = await getAvionCollectionLikes();
  const uploaderProfile = await collection.findOne({
    username: req.body.usernamePostOwner,
  });
  const posts = uploaderProfile.posts;
  const foundValue = posts.filter((obj) => obj.postUID === req.body.postUID);
  const likesUID = foundValue[0].likes;
  if (foundValue != "" || null) {
    const likes = await collectionLikes
      .findOne({ uid: likesUID })
      .then((result) => {
        res.status(201).json({ message: result });
      });
  } else {
    res.status(500).json({ message: "an error has occoured." });
  }
};

export const PostComment = async (req, res) => {
  //get the comment and the UID of the peep who posted the bloody thing,
  const collection = await getAvionCollection();
  const collectionComments = await getAvionCollectionComments();
  const uploaderProfile = await collection.findOne({
    username: req.body.usernamePostOwner,
  });
  const commenterInfo = await collection.findOne({ uid: req.body.posterUID });
  console.log(commenterInfo);
  const posts = uploaderProfile.posts;
  const foundValue = posts.filter((obj) => obj.postUID === req.body.postUID);
  const commentsUID = foundValue[0].comments;
  const addComment = await collectionComments
    .findOneAndUpdate(
      {
        uid: commentsUID,
      },
      {
        $addToSet: {
          commentsFinal: {
            uid: commenterInfo.uid,
            comment: req.body.comment,
            avatar: commenterInfo.avatar,
            username: commenterInfo.username,
          },
        },
      }
    )
    .then((result) => {
      res.status(200).json({ message: "Comment Added!" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "failed to post comment." });
    });
  const NumberComments = await collectionComments.findOne({ uid: commentsUID });

  const count = NumberComments.commentsFinal.length;
  await collectionComments
    .findOneAndUpdate(
      {
        uid: commentsUID,
      },
      {
        $set: {
          commentsNumber: count,
        },
      }
    )
    .then((result) => {})
    .catch((err) => {
      console.log(err);
    });
};
