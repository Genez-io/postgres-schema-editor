//
// State Management for db Schema
//

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { ColumnData, ColumnSchema, InnerReference } from '../Types.js';

interface RestrictedNames {
  [name: string]: boolean;
}
export type SchemaStore = {
  [TableName: string]: {
    [ColumnName: string]: ColumnSchema;
  };
};
export type SchemaState = {
  // DATA
  schemaStore: SchemaStore;
  system: 'PostgreSQL';
  history: SchemaStore[];
  historyCounter: number;

  // DATA SETTERS
  setSchemaStore: (schema: SchemaStore) => void;
  addTableSchema: (tableName: string, columnDataArr: ColumnData[]) => void;
  deleteTableSchema: (tableName: string) => void;
  addColumnSchema: (tableName: string, columnDataArr: ColumnData[]) => void;
  deleteColumnSchema: (tableRef: string, columnRef: string) => void;
  _addHistory: (newState: any) => void;
  undoHandler: () => void;
  redoHandler: () => void;
  addForeignKeySchema: (referenceData: InnerReference) => void;
  setSystem: (
    system: 'PostgreSQL'
  ) => void;

  // VALIDATION HELPER METHODS
  _checkNameValidity: (...names: string[]) => void;
  _checkTableValidity: (tableName: string, columnDataArr?: ColumnData[]) => void;
  _checkColumnValidity: (tableName: string, columnDataArr: ColumnData[]) => void;
  _checkColumnNamesAndDupes: (ColumnDataArr: ColumnData[]) => void;
  _countPrimaries: (ColumnDataArr: ColumnData[]) => number;
  _addColumns: (
    newStore: SchemaStore,
    tableName: string,
    columnDataArr: ColumnData[]
  ) => SchemaStore;

  // VALIDATION CONSTANTS
  _restrictedPgNames: RestrictedNames;
};
//StateCreator
// For Zustand to work nicely with TS, just include store interface as a generic for `create()`
// see https://www.npmjs.com/package/zustand#typescript-usage
const useSchemaStore = create<SchemaState>()(
  // subscribeWithSelector middleware allows components (e.g., Flow.tsx) to listen for changes in store
  subscribeWithSelector(
    // devtools middleware allows use of Redux devtool in chrome
    devtools(
      // store function - 'get' parameter is basically a `this` alias when invoked
      (set, get) => ({
        //schemaStore state
        schemaStore: {},
        system: 'PostgreSQL',
        history: [],
        historyCounter: 0,
        setSystem: (system) =>
          set((state:any) => ({ ...state, system }), false, 'setSystem in /schemaStore'),
        setSchemaStore: (schema) =>
          set(
            (state) => ({ ...state, schemaStore: schema }),
            false,
            'setSchemaStore in /schemaStore'
          ),
        _addHistory: (newState) => {
          newState.historyCounter += 1;
          newState.history[newState.historyCounter] = JSON.parse(
            JSON.stringify(newState.schemaStore)
          );
          if (newState.history[newState.historyCounter + 1]) {
            newState.history = newState.history.slice(0, newState.historyCounter + 1);
          }
        },
        addTableSchema: (tableName, columnDataArr) =>
          set(
            (state) => {
              // Check data validity first. If invalid, error is thrown
              get()._checkTableValidity(tableName, columnDataArr);
              const newState = {
                ...state,
                schemaStore: {
                  ...state.schemaStore,
                  [tableName]: {},
                },
              };
              newState.schemaStore = get()._addColumns(
                newState.schemaStore,
                tableName,
                columnDataArr
              );
              get()._addHistory(newState);
              return newState;
            },
            false,
            'addTableSchema in /schemaStore'
          ),
        deleteTableSchema: (tableName) =>
          set(
            (state) => {
              const newState = { ...state };
              delete newState.schemaStore[tableName];
              get()._addHistory(newState);
              return newState;
            },
            false,
            'deleteTableSchema in /schemaStore'
          ),
        addColumnSchema: (tableName, columnDataArr) =>
          set(
            (state) => {
              get()._checkColumnValidity(tableName, columnDataArr);
              // write field_name const
              const newState = { ...state };
              newState.schemaStore = get()._addColumns(
                newState.schemaStore,
                tableName,
                columnDataArr
              );
              get()._addHistory(newState);
              return newState;
            },
            false,
            'addColumnSchema in /schemaStore'
          ),
        addForeignKeySchema(referenceData) {
          set(
            (state) => {
              // TODO: ADD VALIDATION
              const originTable: string = referenceData.ReferencesTableName;
              const originColumn: string = referenceData.ReferencesPropertyName;
              const destinationTable: string = referenceData.PrimaryKeyTableName;
              const destinationColumn: string = referenceData.PrimaryKeyName;
              const newState = {
                ...state,
                schemaStore: {
                  ...state.schemaStore,
                  [originTable]: {
                    ...state.schemaStore[originTable],
                    [originColumn]: {
                      ...state.schemaStore[originTable][originColumn],
                      References: [
                        {
                          ...referenceData,
                          IsDestination: false,
                          PrimaryKeyName: originColumn,
                        },
                      ],
                      IsForeignKey: true,
                    },
                  },
                  [destinationTable]: {
                    ...state.schemaStore[destinationTable],
                    [destinationColumn]: {
                      ...state.schemaStore[destinationTable][destinationColumn],
                      References: [
                        {
                          ...referenceData,
                          IsDestination: true,
                        },
                      ],
                    },
                  },
                },
              };
              get()._addHistory(newState);
              return newState;
            },
            false,
            'addForeignKeySchema in /schemaStore'
          );
        },
        //---------------------------------
        deleteColumnSchema: (tableRef, columnRef) =>
          set(
            (state) => {
              const newState = JSON.parse(JSON.stringify(state));
              delete newState.schemaStore[tableRef][columnRef];
              get()._addHistory(newState);
              return newState;
            },
            false,
            'deleteColumnSchema in /schemaStore'
          ),
        undoHandler: () => {
          set(
            (state) => {
              const newState = { ...state };
              if (newState.historyCounter === 1) newState.historyCounter -= 1;
              if (newState.history.length === 0 || newState.historyCounter === 0) {
                newState.schemaStore = {};
                return newState;
              }
              newState.historyCounter -= 1;
              newState.schemaStore = newState.history[newState.historyCounter];
              return newState;
            },
            false,
            'undoHandler in /schemaStore'
          );
        },
        redoHandler: () => {
          set(
            (state) => {
              const newState = { ...state };
              if (newState.historyCounter >= newState.history.length - 1) return newState;
              newState.historyCounter += 1;
              newState.schemaStore = newState.history[newState.historyCounter];
              return newState;
            },
            false,
            'redoHandler in /schemaStore'
          );
        },
        // TODO: delete setReference after refactoring adding reference functionality
        // setReference: (newRef: any) => set((state: any) => ({ ...state, reference: newRef })),

        // --------------------- Validity Check Helper Functions -------------------------------------
        // validation functions should be run first before adding or editing schema data
        _checkTableValidity(tableName, columnDataArr) {
          // Check table name syntax
          const checkNameValidity = get()._checkNameValidity;
          checkNameValidity(tableName);

          // Check against current state
          if (get().schemaStore.hasOwnProperty(tableName))
            throw new Error(`Schema already contains table named "${tableName}"`);

          // If columnDataArr is being passed as arg, that means the table is being initialized
          if (columnDataArr) {
            const pkCount = get()._countPrimaries(columnDataArr);
            if (pkCount !== 1)
              throw new Error(
                `Table must have one primary key (currently has ${pkCount})`
              );

            // Check name for duplicates
            get()._checkColumnNamesAndDupes(columnDataArr);
          }
        },
        _checkColumnValidity(tableName, columnDataArr) {
          const currentTable = get().schemaStore[tableName];

          for (const column of columnDataArr) {
            // Check for duplicates against current state
            if (currentTable.hasOwnProperty(column.name))
              throw new Error(
                `Table "${tableName}" already contains column named "${column.name}"`
              );
          }

          let existingPks: number = 0;
          for (const colKey in currentTable) {
            if (currentTable[colKey].IsPrimaryKey) existingPks++;
          }
          const newPks = get()._countPrimaries(columnDataArr);
          if (existingPks + newPks !== 1)
            throw new Error(
              `Table must have one primary key (currently has ${existingPks + newPks})`
            );

          // Check data for duplicate names
          get()._checkColumnNamesAndDupes(columnDataArr);
        },
        _countPrimaries(columnDataArr) {
          return columnDataArr.filter((column) => column.isPrimary).length;
        },
        _checkColumnNamesAndDupes(columnDataArr) {
          const nameRegister: { [name: string]: boolean } = {};
          for (const { name } of columnDataArr) {
            // Check column name syntax
            get()._checkNameValidity(name);
            // Add to name register and throw error if duplicate
            if (nameRegister[name])
              throw new Error(
                `Table must not contain duplicate column names (cause: "${name}")`
              );
            else nameRegister[name] = true;
          }
        },
        _checkNameValidity(name) {
          const system = get().system;
          const restrictedNames = get()._restrictedPgNames;
          if (!name || name.length < 1) throw new Error('Names must not be empty');

          if (restrictedNames.hasOwnProperty(name.toUpperCase()))
            throw new Error(
              `Table and column names must not be ${system} syntax (cause: "${name}")`
            );
          if (!name.match(/^[a-zA-Z0-9_]*$/))
            throw new Error(
              `Name must only contain letters, numbers, and underscores (cause: "${name}")`
            );
        },
        _addColumns: (newStore, tableName, columnDataArr) => {
          for (const columnData of columnDataArr) {
            const newCol: ColumnSchema = {
              Name: columnData.name,
              Value: columnData.defaultValue,
              TableName: tableName,
              References: [],
              IsPrimaryKey: columnData.isPrimary,
              IsForeignKey: false,
              field_name: columnData.name.replace(/\s/g, '_'),
              data_type: columnData.type,
              additional_constraints: columnData.isNullable ? 'NULL' : 'NOT NULL',
            };
            // reassigning newStore so subscriptions pick up on the change
            newStore = {
              ...newStore,
              [tableName]: {
                ...newStore[tableName],
                [columnData.name]: newCol,
              },
            };
          }
          return newStore;
        },
        _restrictedPgNames: {
          ALL: true,
          ANALYSE: true,
          ANALYZE: true,
          AND: true,
          ANY: true,
          ARRAY: true,
          AS: true,
          ASC: true,
          ASYMMETRIC: true,
          BOTH: true,
          CASE: true,
          CAST: true,
          CHECK: true,
          COLLATE: true,
          COLUMN: true,
          CONSTRAINT: true,
          CREATE: true,
          CURRENT_CATALOG: true,
          CURRENT_DATE: true,
          CURRENT_ROLE: true,
          CURRENT_TIME: true,
          CURRENT_TIMESTAMP: true,
          CURRENT_USER: true,
          DEFAULT: true,
          DEFERRABLE: true,
          DESC: true,
          DISTINCT: true,
          DO: true,
          ELSE: true,
          END: true,
          EXCEPT: true,
          FALSE: true,
          FETCH: true,
          FOR: true,
          FOREIGN: true,
          FROM: true,
          GRANT: true,
          GROUP: true,
          HAVING: true,
          IN: true,
          INITIALLY: true,
          INTERSECT: true,
          INTO: true,
          LATERAL: true,
          LEADING: true,
          LIMIT: true,
          LOCALTIME: true,
          LOCALTIMESTAMP: true,
          NOT: true,
          NULL: true,
          OFFSET: true,
          ON: true,
          ONLY: true,
          OR: true,
          ORDER: true,
          PLACING: true,
          PRIMARY: true,
          REFERENCES: true,
          RETURNING: true,
          SELECT: true,
          SESSION_USER: true,
          SOME: true,
          SYMMETRIC: true,
          TABLE: true,
          THEN: true,
          TO: true,
          TRAILING: true,
          true: true,
          UNION: true,
          UNIQUE: true,
          USER: true,
          USING: true,
          VARIADIC: true,
          WHEN: true,
          WHERE: true,
          WINDOW: true,
          WITH: true,
        },
      })
    )
  )
);

export default useSchemaStore;
