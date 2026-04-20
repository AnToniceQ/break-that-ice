#!/bin/bash
set -e

npm run test --if-present
npm run test:e2e --if-present