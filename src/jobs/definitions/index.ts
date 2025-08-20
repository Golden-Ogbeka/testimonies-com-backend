import Agenda from "agenda";
import { AdminCronDefinitions } from "./admin";
import { UserCronDefinitions } from "./user";

const definitions = [AdminCronDefinitions, UserCronDefinitions];

export const allDefinitions = (agenda: Agenda) => {
  definitions.forEach((definition) => definition(agenda));
};
