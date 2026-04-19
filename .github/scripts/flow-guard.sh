#!/bin/sh
set -eu

is_issue_branch() {
  echo "$1" | grep -Eq '^[0-9]+-[a-z0-9._-]+$'
}

case "$BASE_REF" in
  main)
    if [ "$HEAD_REF" != "test" ]; then
      echo "::error::Only pull requests from 'test' may be merged into 'main'."
      exit 1
    fi
    ;;

  test)
    if [ "$HEAD_REF" != "dev" ] && [ "$HEAD_REF" != "main" ]; then
      echo "::error::Only pull requests from 'dev' may be merged into 'test'. Backports from 'main' to 'test' are also allowed."
      exit 1
    fi
    ;;

  dev)
    if [ "$HEAD_REF" = "test" ]; then
      :
    elif is_issue_branch "$HEAD_REF"; then
      :
    else
      echo "::error::Only issue branches '{id}-{name}' or backports from 'test' may be merged into 'dev'."
      exit 1
    fi
    ;;

  *)
    echo "::error::Pull requests into '$BASE_REF' are not allowed. Only 'dev', 'test', and 'main' may be PR targets."
    exit 1
    ;;
esac

echo "Branch PR flow is valid."