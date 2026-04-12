const shouldSkip =
  process.env.NODE_ENV === "production" ||
  process.env.HUSKY === "0" ||
  process.env.CI === "true";

if (shouldSkip) process.exit(0);

import("husky")
  .then((mod) => {
    const husky = mod.default;
    if (typeof husky === "function") husky();
  })
  .catch(() => {
    // No-op: if husky is not installed in this environment, skip silently.
  });
