# ipm package: one-way-sync

## Overview

This repository provides modules for assisting in one-way sync from ClearBlade edge to ClearBlade platform. This approach is useful if you have a single ClearBlade collection used to store sensor or device data from multiple edges. This library will track the connected/disconnected status of the edge to the platform, and while connected will forward any MQTT messages received on the provided topics to the platform via message relay. If the edge is disconnected for any reason, incoming MQTT messages will be stored in a collection. As soon as the edge is reconnected, all messages in the collection will be forwarded to the platform.

From there, you will simply need to create a stream service on your platform in order to do any needed processing and storing of these messages.

This library has been created using the cb-dev-kit, the full source can be found [here](https://github.com/clearblade/one-way-sync).

This is an ipm package, which contains one or more reusable assets within the ipm Community. The 'package.json' in this repo is a ipm spec's package.json, [here](https://docs.clearblade.com/v/3/6-ipm/spec), which is a superset of npm's package.json spec, [here](https://docs.npmjs.com/files/package.json).

[Browse ipm Packages](https://ipm.clearblade.com)

## Setup

-   A [shared cache](https://docs.clearblade.com/v/4/shared_cache/) must be created in order to allow for checking if an edge is connected or disconnected from the platform. The default name is `edgeDataSharedCache` but the name can be configured with the `cacheName` parameter. A TTL of 1 hour is recommended.
-   A [collection](https://docs.clearblade.com/v/4/collections/) must be created in order to store a queue of messages if an edge is disconnected from the platform. The default name is `edge_relay_cache` but the name can be configured with the `cacheName` parameter. This collection will require the below columns:

Column Name | Type
--- | ---
topic | string
payload | string
timestamp | timestamp

## Usage
This library provides an easy interface to send MQTT messages to the platform from the edge, including queing up any messages if the edge is currently disconnected.

## Assets
### Code Libraries

* `edgeConnected` - Library for tracking edge connected state 
* `edgeDisconnected` - Library for tracking edge disconnected state
* `edgeMessageRelay` - Library for sending MQTT messages from provided topics to the platform if edge is connected, or storing them in a collection if disconnected.


### Code Services
* `edgeConnectedServ` - A Code Service that leverages edgeConnected libbrary to update edge connection status
* `edgeDisconnectedServ` - A Code Service that leverages edgeConnected libbrary to update edge connection status
* `edgeMessageRelayService` - A Stream Code Service that initializes the edge message relay with the needed configuration. Once initialized all messages on the provided topics will be forwarded to the platform automatically

### Triggers
* `platformConnectedTrigger` - A trigger on the edgeConnectedServ for the Platform Connected on Edge event
* `platformDisconnectedTrigger` - A trigger on the edgeDisconnectedServ for the Platform Disconnected on Edge event
