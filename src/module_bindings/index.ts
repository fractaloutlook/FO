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

// Import and reexport all reducer arg types
import { AddUpdate } from "./add_update_reducer.ts";
export { AddUpdate };
import { Connect } from "./connect_reducer.ts";
export { Connect };
import { Init } from "./init_reducer.ts";
export { Init };
import { UpdateStatus } from "./update_status_reducer.ts";
export { UpdateStatus };

// Import and reexport all table handle types
import { AdminTableHandle } from "./admin_table.ts";
export { AdminTableHandle };
import { CurrentStatusTableHandle } from "./current_status_table.ts";
export { CurrentStatusTableHandle };
import { UpdateLogTableHandle } from "./update_log_table.ts";
export { UpdateLogTableHandle };

// Import and reexport all types
import { Admin } from "./admin_type.ts";
export { Admin };
import { CurrentStatus } from "./current_status_type.ts";
export { CurrentStatus };
import { UpdateLog } from "./update_log_type.ts";
export { UpdateLog };

const REMOTE_MODULE = {
  tables: {
    admin: {
      tableName: "admin",
      rowType: Admin.getTypeScriptAlgebraicType(),
      primaryKey: "identity",
    },
    current_status: {
      tableName: "current_status",
      rowType: CurrentStatus.getTypeScriptAlgebraicType(),
      primaryKey: "id",
    },
    update_log: {
      tableName: "update_log",
      rowType: UpdateLog.getTypeScriptAlgebraicType(),
      primaryKey: "update_id",
    },
  },
  reducers: {
    add_update: {
      reducerName: "add_update",
      argsType: AddUpdate.getTypeScriptAlgebraicType(),
    },
    connect: {
      reducerName: "connect",
      argsType: Connect.getTypeScriptAlgebraicType(),
    },
    init: {
      reducerName: "init",
      argsType: Init.getTypeScriptAlgebraicType(),
    },
    update_status: {
      reducerName: "update_status",
      argsType: UpdateStatus.getTypeScriptAlgebraicType(),
    },
  },
  // Constructors which are used by the DBConnectionImpl to
  // extract type information from the generated RemoteModule.
  eventContextConstructor: (imp: DBConnectionImpl, event: Event<Reducer>) => {
    return {
      ...(imp as DBConnection),
      event
    }
  },
  dbViewConstructor: (imp: DBConnectionImpl) => {
    return new RemoteTables(imp);
  },
  reducersConstructor: (imp: DBConnectionImpl, setReducerFlags: SetReducerFlags) => {
    return new RemoteReducers(imp, setReducerFlags);
  },
  setReducerFlagsConstructor: () => {
    return new SetReducerFlags();
  }
}

// A type representing all the possible variants of a reducer.
export type Reducer = never
| { name: "AddUpdate", args: AddUpdate }
| { name: "Connect", args: Connect }
| { name: "Init", args: Init }
| { name: "UpdateStatus", args: UpdateStatus }
;

export class RemoteReducers {
  constructor(private connection: DBConnectionImpl, private setCallReducerFlags: SetReducerFlags) {}

  addUpdate(message: string) {
    const __args = { message };
    let __writer = new BinaryWriter(1024);
    AddUpdate.getTypeScriptAlgebraicType().serialize(__writer, __args);
    let __argsBuffer = __writer.getBuffer();
    this.connection.callReducer("add_update", __argsBuffer, this.setCallReducerFlags.addUpdateFlags);
  }

  onAddUpdate(callback: (ctx: EventContext, message: string) => void) {
    this.connection.onReducer("add_update", callback);
  }

  removeOnAddUpdate(callback: (ctx: EventContext, message: string) => void) {
    this.connection.offReducer("add_update", callback);
  }

  connect() {
    this.connection.callReducer("connect", new Uint8Array(0), this.setCallReducerFlags.connectFlags);
  }

  onConnect(callback: (ctx: EventContext) => void) {
    this.connection.onReducer("connect", callback);
  }

  removeOnConnect(callback: (ctx: EventContext) => void) {
    this.connection.offReducer("connect", callback);
  }

  init() {
    this.connection.callReducer("init", new Uint8Array(0), this.setCallReducerFlags.initFlags);
  }

  onInit(callback: (ctx: EventContext) => void) {
    this.connection.onReducer("init", callback);
  }

  removeOnInit(callback: (ctx: EventContext) => void) {
    this.connection.offReducer("init", callback);
  }

  updateStatus(newStatus: string) {
    const __args = { newStatus };
    let __writer = new BinaryWriter(1024);
    UpdateStatus.getTypeScriptAlgebraicType().serialize(__writer, __args);
    let __argsBuffer = __writer.getBuffer();
    this.connection.callReducer("update_status", __argsBuffer, this.setCallReducerFlags.updateStatusFlags);
  }

  onUpdateStatus(callback: (ctx: EventContext, newStatus: string) => void) {
    this.connection.onReducer("update_status", callback);
  }

  removeOnUpdateStatus(callback: (ctx: EventContext, newStatus: string) => void) {
    this.connection.offReducer("update_status", callback);
  }

}

export class SetReducerFlags {
  addUpdateFlags: CallReducerFlags = 'FullUpdate';
  addUpdate(flags: CallReducerFlags) {
    this.addUpdateFlags = flags;
  }

  connectFlags: CallReducerFlags = 'FullUpdate';
  connect(flags: CallReducerFlags) {
    this.connectFlags = flags;
  }

  initFlags: CallReducerFlags = 'FullUpdate';
  init(flags: CallReducerFlags) {
    this.initFlags = flags;
  }

  updateStatusFlags: CallReducerFlags = 'FullUpdate';
  updateStatus(flags: CallReducerFlags) {
    this.updateStatusFlags = flags;
  }

}

export class RemoteTables {
  constructor(private connection: DBConnectionImpl) {}

  get admin(): AdminTableHandle {
    return new AdminTableHandle(this.connection.clientCache.getOrCreateTable<Admin>(REMOTE_MODULE.tables.admin));
  }

  get currentStatus(): CurrentStatusTableHandle {
    return new CurrentStatusTableHandle(this.connection.clientCache.getOrCreateTable<CurrentStatus>(REMOTE_MODULE.tables.current_status));
  }

  get updateLog(): UpdateLogTableHandle {
    return new UpdateLogTableHandle(this.connection.clientCache.getOrCreateTable<UpdateLog>(REMOTE_MODULE.tables.update_log));
  }
}

export class DBConnection extends DBConnectionImpl<RemoteTables, RemoteReducers, SetReducerFlags>  {
  static builder = (): DBConnectionBuilder<DBConnection>  => {
    return new DBConnectionBuilder<DBConnection>(REMOTE_MODULE, (imp: DBConnectionImpl) => imp as DBConnection);
  }
}

export type EventContext = EventContextInterface<RemoteTables, RemoteReducers, SetReducerFlags, Reducer>;
