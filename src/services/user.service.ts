import { UserInterface } from "../interfaces/User.interface";
import { APIError } from "../utils/APIError";
import { User } from "../models/user.model";
import { ObjectId } from "mongodb";
import { Query } from "mongoose";

export const getUserById = async (
  userId: string
): Promise<UserInterface | void> => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new APIError({message: "User not found", status: 400, safe: true});

    return user;
  } catch (error) {
    
    throw error;
  }
};

export const getUserList = (
  searchTerm: string = ""
): Query<UserInterface[], UserInterface> => {

  const searchRegex = new RegExp(searchTerm, "i");
  return User.find({
    $or: [
      { first_name: { $regex: searchRegex } },
      { last_name: { $regex: searchRegex } },
    ],
  });

  // try {
  //   const searchRegex = new RegExp(searchTerm, "i");
  //   const userList = await User.find({
  //     $or: [
  //       { first_name: { $regex: searchRegex } },
  //       { last_name: { $regex: searchRegex } },
  //     ],
  //   });

  //   if (!userList) throw new APIError({message: "Contacts not found", status: 400, safe: true});

  //   return userList;
  // } catch (error) {
    
  //   throw error;
  // }
};

export const createUser = async (
  userData: UserInterface
): Promise<UserInterface | void> => {
  try {
    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const objectId = new ObjectId(userId);
    await User.deleteOne({ _id: objectId });
  } catch (error) {
    
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  userData: UserInterface
): Promise<UserInterface | void> => {
  try {
    const updateUser = await User.findById(userId);

    if (!updateUser) throw new APIError({message: "User not found", status: 404, safe: true});

    Object.assign(updateUser, userData);

    const updatedUser = await updateUser.save();

    return updatedUser;
  } catch (error) {
    
    throw error;
  }
};
