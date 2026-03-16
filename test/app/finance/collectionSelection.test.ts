import { getFinanceCollectionName } from "../../../app/finance/firebaseUtils";

describe("getFinanceCollectionName", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return undefined when VERCEL_ENV is 'production' but no prod variable is set", () => {
    const env = {
      VERCEL_ENV: "production",
    };
    expect(getFinanceCollectionName(env)).toBeUndefined();
  });

  it("should return undefined when VERCEL_GIT_PULL_REQUEST_TARGET is 'main' but no prod variable is set", () => {
    const env = {
      VERCEL_ENV: "preview",
      VERCEL_GIT_PULL_REQUEST_TARGET: "main",
    };
    expect(getFinanceCollectionName(env)).toBeUndefined();
  });

  it("should return undefined when in preview but no dev variable is set", () => {
    const env = {
      VERCEL_ENV: "preview",
      VERCEL_GIT_PULL_REQUEST_TARGET: "develop",
    };
    expect(getFinanceCollectionName(env)).toBeUndefined();
  });

  it("should return undefined by default (local environment) if no variable is set", () => {
    const env = {};
    expect(getFinanceCollectionName(env)).toBeUndefined();
  });

  it("should respect NEXT_PUBLIC_FINANCE_COLLECTION_PROD when in production", () => {
    const env = {
      VERCEL_ENV: "production",
      NEXT_PUBLIC_FINANCE_COLLECTION_PROD: "prod-override",
    };
    expect(getFinanceCollectionName(env)).toBe("prod-override");
  });

  it("should respect NEXT_PUBLIC_FINANCE_COLLECTION_DEV when in preview", () => {
    const env = {
      VERCEL_ENV: "preview",
      VERCEL_GIT_PULL_REQUEST_TARGET: "feature",
      NEXT_PUBLIC_FINANCE_COLLECTION_DEV: "dev-override",
    };
    expect(getFinanceCollectionName(env)).toBe("dev-override");
  });
});
