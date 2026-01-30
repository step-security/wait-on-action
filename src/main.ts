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
