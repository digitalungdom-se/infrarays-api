import { UserService, AuthenticationService, ApplicationService, StorageService, AdminService } from "services";

export interface IServices {
  User: UserService;
  Authentication: AuthenticationService;
  Application: ApplicationService;
  Storage: StorageService;
  Admin: AdminService;
}
