import { analyze } from "../analyzeController";

describe("analyze controller - authentication", () => {
  it("returns 401 if user is not authenticated", async () => {
    const req = {
      headers: { authorization: undefined },
      auth: undefined,
    } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await analyze(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringMatching(/unauthorized/i) })
    );
  });
});
