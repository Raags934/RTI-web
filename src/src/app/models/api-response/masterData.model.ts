import { Dropdowns } from "../dropdown.model";
import { Franchise } from "../productsList.model";
import { User } from "../user.model";

export interface MasterDataResponse {
  user: User;
  dropdowns: Dropdowns;
  franchises: Franchise[];
}
