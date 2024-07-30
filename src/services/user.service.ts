import { UserInterface } from "../interfaces/User.interface";
import { APIError } from "../utils/APIError";
import { User } from "../models/user.model";
import { ObjectId } from "mongodb";

export const getUserById = async (
  userId: string
): Promise<UserInterface | void> => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new APIError("User not found", 400, true);

    return user;
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = error;

    throw new APIError(
      `An error occurred when trying to get the user: ${errorMessage}`,
      500,
      true
    );
  }
};

export const getUserList = async (
  searchTerm: string
): Promise<UserInterface[] | void> => {
  try {
    const searchRegex = new RegExp(searchTerm, "i");
    const userList = await User.find({
      $or: [
        { first_name: { $regex: searchRegex } },
        { last_name: { $regex: searchRegex } },
      ],
    });

    if (!userList) throw new APIError("Contacts not found", 400, true);

    return userList;
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = error;

    throw new APIError(
      `An error occurred when trying to get the users: ${errorMessage}`,
      500,
      true
    );
  }
};

export const createUser = async (
  userData: UserInterface
): Promise<UserInterface | void> => {
  try {
    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = error;

    throw new APIError(
      `An error occurred when trying to create a new user: ${errorMessage}`,
      500,
      true
    );
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const objectId = new ObjectId(userId);
    await User.deleteOne({ _id: objectId });
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = error;

    throw new APIError(
      `An error occurred when trying to get delete the user: ${errorMessage}`,
      500,
      true
    );
  }
};

export const updateUser = async (
  userId: string,
  userData: UserInterface
): Promise<UserInterface | void> => {
  try {
    const updateUser = await User.findById(userId);

    if (!updateUser) throw new APIError("User not found", 404, true);

    Object.assign(updateUser, userData);

    const updatedUser = await updateUser.save();

    return updatedUser;
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) errorMessage = error.message;
    else errorMessage = error;

    throw new APIError(
      `An error occurred when trying to get update the user: ${errorMessage}`,
      500,
      true
    );
  }
};
