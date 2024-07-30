import { UserInterface } from '../interfaces/User.interface';
import { APIError } from '../utils/APIError';
import { User } from '../models/user.model';
import { ObjectId } from 'mongodb';

export const getUserById = async (userId: string): Promise<UserInterface | void>  => {
  try {
    const user = await User.findById(userId);
    if (!user)
      throw new APIError("User not found", 400, true);
      
    return user;
    
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message)
    else 
      console.error(error)    
  }
}

export const getUserList = async (searchTerm: string): Promise<UserInterface[] | void>  => {
  try {
    const searchRegex = new RegExp(searchTerm, 'i');
    const userList = await User.find({
      $or: [
        { first_name: { $regex: searchRegex } },
        { last_name: { $regex: searchRegex } }
      ]
    });

    if (!userList)
      throw new APIError("Contact not found", 400, true);
      
    return userList
    
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message);
    else 
      console.error(error);    
  }
}

export const createUser = async (userData: object):  Promise<UserInterface | void>  => {
  try {
    const newUser = await User.create(userData);

    return newUser
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message);
    else 
      console.error(error);
  }
}

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const objectId = new ObjectId(userId);
    await User.deleteOne({ _id: objectId });
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message);
    else 
      console.error(error);
  }
}

export const updateUser = async (userId: string, userData: UserInterface): Promise<UserInterface | void> => {
  try {
    const updateUser = await User.findById(userId);

    if (!updateUser)
      throw new APIError('User not found', 404, true);

    Object.assign(updateUser, userData);

    const updatedUser = await updateUser.save();

    return updatedUser;   
  } catch (error) {
    throw new APIError('Failed to update the user', 500, true);
  }
}

// export class User implements UserInterface {
//   id: string;
//   first_name: string;
//   last_name: string;
//   photo: string;
//   start_date: string;
//   job_description: string;
//   telephone: string;
//   status: UserStatusType;
//   job: UserJobType;
//   password: string;
//   email: string;

//   constructor(user: UserInterface) {
//     this.id = user.id
//     this.first_name = user.first_name
//     this.last_name = user.last_name
//     this.photo = user.photo
//     this.start_date = user.start_date
//     this.job_description = user.job_description
//     this.telephone = user.telephone
//     this.status = user.status
//     this.job = user.job
//     this.password = user.password
//     this.email = user.email
//   }

//   static fetchOne (userId: string): User | void {
//     const userList = userDataList as User[]
//     if (!userList)
//       throw new APIError("There is no users data", 500, false);

//     const user = userList.find((user: User) => user.id === userId)
//     if (!user)
//       throw new APIError("User not found", 400, true)
    
//     return user
//   }

//   static fetchAll (searchTerm: string): User[] | void {
//     const userList = userDataList as User[]
    
//     if (!userList)
//       throw new APIError("There is no users data", 500, false)

//     const filteredUserList = userList.filter((user: User) => user.first_name.includes(searchTerm) || user.last_name.includes(searchTerm))

//     return filteredUserList;
//   }

//   static create(user: User): User | void {
//     if (!user)
//       throw new APIError("USer is not provided", 404, false)
    
//     return user;
//   }

//   static delete(userId: string) {
//     if (!userId)
//       throw new APIError("User id isn't provided", 400, false);
    
//     const userList = userDataList as User[]
//     const user = userList.find((user: User) => user.id === userId)
//     if (!user)
//       throw new APIError("User not found", 404, false)

//   }

//   static update(userId: string, formData: User): User {
//     const userList = userDataList as User[]
//     let updateUser = userList.find((user: User) => user.id === userId)
    
//     if (!updateUser)
//       throw new APIError("User doesn't exist", 404, false);

//     updateUser = {
//       ...updateUser,
//       ...formData
//     }

//     return updateUser    
//   }
// }