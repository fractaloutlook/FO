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
export type User = {
  identity: Identity,
  name: string | undefined,
  online: boolean,
};

/**
 * A namespace for generated helper functions.
 */
export namespace User {
  /**
  * A function which returns this type represented as an AlgebraicType.
  * This function is derived from the AlgebraicType used to generate this type.
  */
  export function getTypeScriptAlgebraicType(): AlgebraicType {
    return AlgebraicType.createProductType([
      new ProductTypeElement("identity", AlgebraicType.createIdentityType()),
      new ProductTypeElement("name", AlgebraicType.createOptionType(AlgebraicType.createStringType())),
      new ProductTypeElement("online", AlgebraicType.createBoolType()),
    ]);
  }

  export function serialize(writer: BinaryWriter, value: User): void {
    User.getTypeScriptAlgebraicType().serialize(writer, value);
  }

  export function deserialize(reader: BinaryReader): User {
    return User.getTypeScriptAlgebraicType().deserialize(reader);
  }

}


