import { debug, error, getInput, info, setFailed } from '@actions/core';
import axios, { isAxiosError } from 'axios';
import waitOn, { WaitOnOptions } from 'wait-on';

function numberInput(name: string) {
  const value = getInput(name);

  if (value) {
    return parseInt(value);
  }
}

function booleanInput(name: string) {
  return getInput(name).toLowerCase() == 'true';
}

async function validateSubscription(): Promise<void> {
  console.log("===== StepSecurity Debug: Action Runtime Context =====");

  console.log("GITHUB_REPOSITORY:", process.env.GITHUB_REPOSITORY);
  console.log("GITHUB_REPOSITORY_OWNER:", process.env.GITHUB_REPOSITORY_OWNER);
  console.log("GITHUB_SERVER_URL:", process.env.GITHUB_SERVER_URL);
  console.log("GITHUB_API_URL:", process.env.GITHUB_API_URL);
  console.log("GITHUB_RUN_ID:", process.env.GITHUB_RUN_ID);
  console.log("GITHUB_WORKFLOW:", process.env.GITHUB_WORKFLOW);
  console.log("GITHUB_JOB:", process.env.GITHUB_JOB);

  console.log("GITHUB_ACTION:", process.env.GITHUB_ACTION);
  console.log("GITHUB_ACTION_REPOSITORY:", process.env.GITHUB_ACTION_REPOSITORY);
  console.log("GITHUB_ACTION_REF:", process.env.GITHUB_ACTION_REF);
  console.log("GITHUB_ACTION_PATH:", process.env.GITHUB_ACTION_PATH);

  console.log("=====================================================");
  const API_URL = `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/subscription`;

  try {
    await axios.get(API_URL, { timeout: 3000 });
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 403) {
      error('Subscription is not valid. Reach out to support@stepsecurity.io');
      process.exit(1);
    } else {
      info('Timeout or API not reachable. Continuing to next step.');
    }
  }
}

async function main() {
  await validateSubscription();
  const resource = getInput('resource', { required: true }).split(' ');
  const config = getInput('config');
  const delay = numberInput('delay');
  const httpTimeout = numberInput('httpTimeout');
  const interval = numberInput('interval');
  const log = booleanInput('log');
  const reverse = booleanInput('reverse');
  const simultaneous = numberInput('simultaneous');
  const timeout = numberInput('timeout');
  const tcpTimeout = numberInput('tcpTimeout');
  const verbose = booleanInput('verbose');
  const window = numberInput('window');

  let defaults: Partial<WaitOnOptions> = {};
  if (config) {
    defaults = require(config);
  }

  const opts: WaitOnOptions = {
    ...defaults,
    resources: Array.isArray(resource) ? resource : [resource],
    delay,
    httpTimeout,
    interval,
    log,
    reverse,
    simultaneous,
    timeout,
    tcpTimeout,
    verbose,
    window,
  };

  try {
    // Usage with async await
    await waitOn(opts);
    debug('Successfully waited for resources to become accessible');
  } catch (ex) {
    const err = ex instanceof Error ? ex : String(ex);
    setFailed(err);
  }
}

main();
