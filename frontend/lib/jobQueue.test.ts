import { describe, expect, it } from "vitest";
import { runJob } from "./jobQueue";

describe("runJob", () => {
  it("returns a completed status with the task's result on success", async () => {
    const job = await runJob(async () => "hello");
    expect(job).toEqual({ status: "completed", result: "hello" });
  });

  it("returns a failed status with the error message when the task throws", async () => {
    const job = await runJob(async () => {
      throw new Error("boom");
    });
    expect(job.status).toBe("failed");
    expect(job.error).toBe("boom");
    expect(job.result).toBeUndefined();
  });

  it("falls back to a generic error message for non-Error throws", async () => {
    const job = await runJob(async () => {
      throw "not an Error instance";
    });
    expect(job.status).toBe("failed");
    expect(job.error).toBe("Unknown error");
  });
});
