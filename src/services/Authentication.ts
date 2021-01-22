import jwt from "jsonwebtoken";

import { Config } from "configs";
import { IReturnToken } from "interfaces";
import { TokenService, UserService, MailService } from "./";

export class AuthenticationService {
  constructor(private readonly Token: TokenService, private readonly User: UserService, private readonly Mail: MailService, private readonly config: typeof Config) {}

  public createToken(id: string): string {
    return jwt.sign({ id }, this.config.secret, { expiresIn: 60 * 15, issuer: "ansok.raysforexcellence.se", audience: "ansok.raysforexcellence.se" });
  }

  public validateToken(token: string): boolean {
    try {
      jwt.verify(token, this.config.secret);
      return true;
    } catch (e) {
      return false;
    }
  }

  public parseToken(token: string): string | null {
    try {
      const decoded = jwt.verify(token, this.config.secret) as any;
      return decoded.id;
    } catch (e) {
      return null;
    }
  }

  public async refreshToken(refreshToken: string): Promise<IReturnToken | null> {
    const userID = await this.Token.getRefreshToken(refreshToken);

    if (!userID) {
      return null;
    }

    const accessToken = this.createToken(userID);

    return { access_token: accessToken, refresh_token: refreshToken, expires: 60 * 15, token_type: "bearer" };
  }

  public async deleteRefreshToken(refreshToken: string): Promise<void> {
    await this.Token.deleteRefreshToken(refreshToken);
  }

  public async sendEmailLoginCode(email: string): Promise<string> {
    const user = (await this.User.getByEmail(email))!;

    const emailLoginCode = await this.Token.createEmailLoginToken(user.id);

    await this.Mail.sendLoginEmail(email, { login_code: emailLoginCode });

    return emailLoginCode;
  }

  public async loginWithEmailCode(email: string, code: string): Promise<IReturnToken | null> {
    const [user, userID] = await Promise.all([this.User.getByEmail(email), this.Token.getEmailLoginToken(code)]);

    if (!user || !userID || user.id !== userID) {
      return null;
    }

    const accessToken = this.createToken(user.id);

    const refreshToken = await this.Token.createRefreshToken(userID);

    return { access_token: accessToken, refresh_token: refreshToken, expires: 60 * 15, token_type: "bearer" };
  }
}
