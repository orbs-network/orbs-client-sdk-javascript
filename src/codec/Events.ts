/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { Argument, packedArgumentsDecode } from "./Arguments";
import { InternalMessage } from "membuffers";
import * as Protocol from "../protocol/Protocol";

export interface Event {
  contractName: string;
  eventName: string;
  arguments: Argument[];
}

export function packedEventsDecode(buf: Uint8Array): Event[] {
  const res: Event[] = [];
  const eventsArrayMsg = new InternalMessage(buf, buf.byteLength, Protocol.EventsArray_Scheme, []);
  const iterator = eventsArrayMsg.getMessageArrayIterator(0);
  let index = 0;
  while (iterator.hasNext()) {
    const [eventBuf, eventBufLength] = iterator.nextMessage();
    const eventMsg = new InternalMessage(eventBuf, eventBufLength, Protocol.Event_Scheme, []);
    res.push({
      contractName: eventMsg.getString(0),
      eventName: eventMsg.getString(1),
      arguments: packedArgumentsDecode(eventMsg.rawBufferWithHeaderForField(2, 0)),
    });
    index++;
  }
  return res;
}
