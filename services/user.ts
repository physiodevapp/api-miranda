import { UserInterface, UserJobType, UserStatusType } from '../interfaces/User';
import userDataList from '../data/users.json';
import { APIError } from '../utils/APIError';

export class User implements UserInterface {
  id: string;
  first_name: string;
  last_name: string;
  photo: string;
  start_date: string;
  job_description: string;
  telephone: string;
  status: UserStatusType;
  job: UserJobType;
  password: string;
  email: string;

  constructor(user: UserInterface) {
    this.id = user.id
    this.first_name = user.first_name
    this.last_name = user.last_name
    this.photo = user.photo
    this.start_date = user.start_date
    this.job_description = user.job_description
    this.telephone = user.telephone
    this.status = user.status
    this.job = user.job
    this.password = user.password
    this.email = user.email
  }

  static fetchOne (userId: string) {
    const userList = userDataList as UserInterface[]
    const user = userList.find((user: UserInterface) => user.id = userId)

    if (user)
      return user
    else
      throw new APIError("User not found", 400, true)
  }

  static fetchAll (searchTerm: string): User[] | void {
    const userList = userDataList as User[]

    const filteredUserList = userList.filter((user: User) => user.first_name.includes(searchTerm) || user.last_name.includes(searchTerm))

    if (filteredUserList)
      return filteredUserList
    else if (!userList)
      throw new APIError("There is no users data", 500, false)
  }

  static create(user: User): User | void {
    if (!user)
      throw new APIError("Invalid user schema", 404, false)
    
    return user;
  }

  static delete(userId: string): void {
    if (!userId)
      throw new APIError("User Id doesn't provided", 400, false);
    
    const userList = userDataList as User[]
    const user = userList.find((user: User) => user.id = userId)
    if (!user)
      throw new APIError("User not found", 404, false)

  }

  static update(userId: string, formData: User): User {
    const userList = userDataList as User[]
    let updateUser = userList.find((user: User) => user.id === userId)
    
    if (!updateUser)
      throw new APIError("User doesn't exist", 404, false);

    updateUser = {
      ...updateUser,
      ...formData
    }

    return updateUser
    
  }
}