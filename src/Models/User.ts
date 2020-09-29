//TODO: make typescript interfaces as templates.
export interface User {
  uid: object;
  email: string;
  password: string;
  username: string;
  avatar: object;
  userFollowers: number;
  userFollowing: number;
  postsNumber: number;
  following: object;
  followers: object;
  posts: object;
}
