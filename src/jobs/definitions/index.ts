import Agenda from "agenda";
import { AdminCronDefinitions } from "./admin";
import { AnalyticsCronDefinitions } from "./analytics";
import { AuditCronDefinitions } from "./audit";
import { AuthOpsCronDefinitions } from "./auth-ops";
import { CleanupCronDefinitions } from "./cleanup";
import { CommunicationCronDefinitions } from "./communication";
import { OAuthCronDefinitions } from "./oauth";
import { PaymentCronDefinitions } from "./payment";
import { UserCronDefinitions } from "./user";

const definitions = [
  AdminCronDefinitions,
  AnalyticsCronDefinitions,
  AuditCronDefinitions,
  AuthOpsCronDefinitions,
  CleanupCronDefinitions,
  CommunicationCronDefinitions,
  OAuthCronDefinitions,
  PaymentCronDefinitions,
  UserCronDefinitions,
];

export const allDefinitions = (agenda: Agenda) => {
  definitions.forEach((definition) => definition(agenda));
};
