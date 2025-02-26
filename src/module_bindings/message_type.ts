// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

import {
  // @ts-ignore
  Address,
  // @ts-ignore
  AlgebraicType,
  // @ts-ignore
  AlgebraicValue,
  // @ts-ignore
  BinaryReader,
  // @ts-ignore
  BinaryWriter,
  // @ts-ignore
  CallReducerFlags,
  // @ts-ignore
  DBConnectionBuilder,
  // @ts-ignore
  DBConnectionImpl,
  // @ts-ignore
  DBContext,
  // @ts-ignore
  Event,
  // @ts-ignore
  EventContextInterface,
  // @ts-ignore
  Identity,
  // @ts-ignore
  ProductType,
  // @ts-ignore
  ProductTypeElement,
  // @ts-ignore
  SumType,
  // @ts-ignore
  SumTypeVariant,
  // @ts-ignore
  TableCache,
  // @ts-ignore
  deepEqual,
} from "@clockworklabs/spacetimedb-sdk";
export type Message = {
  sender: Identity,
  sent: bigint,
  text: string,
};

/**
 * A namespace for generated helper functions.
 */
export namespace Message {
  /**
  * A function which returns this type represented as an AlgebraicType.
  * This function is derived from the AlgebraicType used to generate this type.
  */
  export function getTypeScriptAlgebraicType(): AlgebraicType {
    return AlgebraicType.createProductType([
      new ProductTypeElement("sender", AlgebraicType.createIdentityType()),
      new ProductTypeElement("sent", AlgebraicType.createU64Type()),
      new ProductTypeElement("text", AlgebraicType.createStringType()),
    ]);
  }

  export function serialize(writer: BinaryWriter, value: Message): void {
    Message.getTypeScriptAlgebraicType().serialize(writer, value);
  }

  export function deserialize(reader: BinaryReader): Message {
    return Message.getTypeScriptAlgebraicType().deserialize(reader);
  }

}


