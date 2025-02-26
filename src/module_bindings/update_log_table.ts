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
import { UpdateLog } from "./update_log_type";
// @ts-ignore
import { EventContext, Reducer, RemoteReducers, RemoteTables } from ".";

/**
 * Table handle for the table `update_log`.
 *
 * Obtain a handle from the [`updateLog`] property on [`RemoteTables`],
 * like `ctx.db.updateLog`.
 *
 * Users are encouraged not to explicitly reference this type,
 * but to directly chain method calls,
 * like `ctx.db.updateLog.on_insert(...)`.
 */
export class UpdateLogTableHandle {
  tableCache: TableCache<UpdateLog>;

  constructor(tableCache: TableCache<UpdateLog>) {
    this.tableCache = tableCache;
  }

  count(): number {
    return this.tableCache.count();
  }

  iter(): Iterable<UpdateLog> {
    return this.tableCache.iter();
  }

  onInsert = (cb: (ctx: EventContext, row: UpdateLog) => void) => {
    return this.tableCache.onInsert(cb);
  }

  removeOnInsert = (cb: (ctx: EventContext, row: UpdateLog) => void) => {
    return this.tableCache.removeOnInsert(cb);
  }

  onDelete = (cb: (ctx: EventContext, row: UpdateLog) => void) => {
    return this.tableCache.onDelete(cb);
  }

  removeOnDelete = (cb: (ctx: EventContext, row: UpdateLog) => void) => {
    return this.tableCache.removeOnDelete(cb);
  }
}
