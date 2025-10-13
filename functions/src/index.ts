import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions";

initializeApp();
setGlobalOptions({ maxInstances: 10 });

export { default as updateFutureEvents } from "./countdown/updateFutureEvents";
