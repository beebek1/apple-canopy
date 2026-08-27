import crypto from "crypto";
import bcrypt from "bcrypt";

const generateCredentials = async () => {
  const username = `AC-${Math.floor(1000 + Math.random() * 9000)}`;
  const password = crypto.randomBytes(8).toString("base64url");

  return {
    username,
    password,
  };
};

export default generateCredentials;
