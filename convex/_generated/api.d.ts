/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as appointments from "../appointments.js";
import type * as auth from "../auth.js";
import type * as bookingConfig from "../bookingConfig.js";
import type * as crm from "../crm.js";
import type * as emails from "../emails.js";
import type * as helpers from "../helpers.js";
import type * as orders from "../orders.js";
import type * as portfolioItems from "../portfolioItems.js";
import type * as rateLimit from "../rateLimit.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  appointments: typeof appointments;
  auth: typeof auth;
  bookingConfig: typeof bookingConfig;
  crm: typeof crm;
  emails: typeof emails;
  helpers: typeof helpers;
  orders: typeof orders;
  portfolioItems: typeof portfolioItems;
  rateLimit: typeof rateLimit;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
