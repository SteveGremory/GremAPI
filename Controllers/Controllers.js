import bcrypt from "bcrypt";
import AvionDB from "aviondb";
import IPFS from "ipfs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import Post from "../Models/Post.js";
import { v4 as uuidv4 } from "uuid";
import "body-parser";

var collection;

const getAvionCollection = async () => {
  if (!collection) {
    const ipfs = await IPFS.create();
    const aviondb = await AvionDB.init("Grem", ipfs);
    collection = await aviondb.initCollection("Users");
    return collection;
  } else {
    return collection;
  }
};

export const SignupUser = (req, res) => {
  User.find({
    email: req.body.email,
    username: req.body.username,
  })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "This email/username is associated with another account. ",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: uuidv4(),
              username: req.body.username,
              email: req.body.email,
              password: hash,
            });
            user
              .save()
              .then((result) => {
                console.log(result);
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
        });
      }
    });
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
        _id: uuidv4(),
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
        const token = jwt.sign(
          {
            email: findUserByEmail["email"],
            userId: findUserByEmail["uid"],
          },
          process.env.JWT_KEY,
          {
            expiresIn: "1h",
          }
        );
        return res.status(200).json({
          message: "Auth successful",
          token: token,
        });
      }
      res.status(401).json({
        message: "Auth failed",
      });
    });
  }
};
export const LoginUser = (req, res) => {
  User.find({
    email: req.body.email,
  })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h",
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            token: token,
          });
        }
        res.status(401).json({
          message: "Auth failed",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
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
