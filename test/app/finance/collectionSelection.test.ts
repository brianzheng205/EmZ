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

  it("should return 'budgets' when VERCEL_ENV is 'production'", () => {
    const env = {
      VERCEL_ENV: "production",
    };
    expect(getFinanceCollectionName(env)).toBe("budgets");
  });

  it("should return 'budgets' when VERCEL_GIT_PULL_REQUEST_TARGET is 'main'", () => {
    const env = {
      VERCEL_ENV: "preview",
      VERCEL_GIT_PULL_REQUEST_TARGET: "main",
    };
    expect(getFinanceCollectionName(env)).toBe("budgets");
  });

  it("should return 'budgets-dev' when in preview but not targeting main", () => {
    const env = {
      VERCEL_ENV: "preview",
      VERCEL_GIT_PULL_REQUEST_TARGET: "develop",
    };
    expect(getFinanceCollectionName(env)).toBe("budgets-dev");
  });

  it("should return 'budgets-dev' by default (local environment)", () => {
    const env = {};
    expect(getFinanceCollectionName(env)).toBe("budgets-dev");
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
