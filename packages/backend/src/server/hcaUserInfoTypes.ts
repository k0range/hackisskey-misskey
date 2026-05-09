import { string } from "@tensorflow/tfjs-core";

interface BaseUserInfo {
  identity: {
    id: string;
  },
  scopes: string[]
}

interface EmailScopeInfo {
  identity: {
    primary_email: string;
  },
  scopes: ["email"]
}

interface NameScopeInfo {
  identity: {
    first_name: string;
    last_name: string;
  }
}

export type UserInfo = BaseUserInfo & 