import { Argument, packedArgumentsDecode } from "./Arguments";
import { InternalMessage } from "../membuffers/message";
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
