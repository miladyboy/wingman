import { requireAuth } from "../requireAuth";
import { verifyToken } from "../../services/authService";
import { Request, Response, NextFunction } from "express";

jest.mock("../../services/authService");

const mockedVerify = verifyToken as jest.Mock;

describe("requireAuth middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
    next = jest.fn();
    mockedVerify.mockReset();
  });

  it("should respond 401 if Authorization header missing", async () => {
    await requireAuth(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should respond 401 if token verification fails", async () => {
    req.headers!.authorization = "Bearer bad";
    mockedVerify.mockImplementation(() => {
      throw new Error("invalid");
    });
    await requireAuth(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should attach auth payload and call next for valid token", async () => {
    const payload = {
      userId: "u1",
      email: "a@b.com",
      roles: ["authenticated"],
    };
    req.headers!.authorization = "Bearer good";
    mockedVerify.mockResolvedValue(payload);
    await requireAuth(req as Request, res as Response, next);
    expect((req as any).auth).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });
});
