import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { deleteAllFiles } from "./files";

const crons = cronJobs();

crons.interval(
  "delete any files marked for deletion",
  { minutes: 1 },
  internal.files.deleteAllFiles,
);

export default crons