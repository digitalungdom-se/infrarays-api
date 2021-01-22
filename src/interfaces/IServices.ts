import { UserService, AuthenticationService, ApplicationService, StorageService } from "services";

export interface IServices {
  User: UserService;
  Authentication: AuthenticationService;
  Application: ApplicationService;
  Storage: StorageService;
}
