import { setGlobalOptions } from "firebase-functions";

setGlobalOptions({ maxInstances: 10 });

export { default as deletePastCountdowns } from "./countdown/updateFutureEvents";
