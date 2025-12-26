# Appwrite Polling Test

This directory contains a minimal test suite to investigate Appwrite's getExecution polling behavior.

## Problem

When calling `createExecution()` with `async=true`, the execution returns immediately with an `$id`. However, when polling with `getExecution()`, the `responseBody` field is **always empty** even though the response headers show `content-length` with actual data.

## Structure

- `server/` - Minimal Appwrite function that returns test data
- `client/` - Node.js client that tests polling via getExecution

## Usage

### Deploy the server function

1. Navigate to `server/`
2. Deploy to Appwrite using the Appwrite CLI

### Run the client test

1. Navigate to `client/`
2. Set your Appwrite configuration in `test.ts`
3. Run `npx ts-node test.ts`

## Expected vs Actual

**Expected:** `getExecution()` should return the full `responseBody` once status is `completed`

**Actual:** `responseBody` is always `""` (empty string), but `responseHeaders` shows correct `content-length`
