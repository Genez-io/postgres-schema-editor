export type Props = {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
};

export interface Data {
  edges: RowsOfData[];
  table: [string, RowsOfData[]];
}

export type Edge = {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  animated: boolean;
  label: string;
  type: string;
  style: { strokeWidth: number; stroke: string };
  markerEnd: {
    type: string;
    orient: string;
    width: number;
    height: number;
    color: string;
  };
};

export type DataNode = {
  id: string;
  type: 'table';
  position: { x: number; y: number };
  data: DataNodeData;
};

export interface DataNodeData {
  table: TableTuple;
  edges: Edge[];
}

export type TableTuple = [
  TableKey: string,
  ColumnData: { [ColumnName: string]: ColumnSchema } | RowsOfData[] | RowsOfData
];

// ---------------------------------------------------------------------
// ZUSTAND STORE AND FRONT-END TYPES

// ColumnData is input by user and sent to schemaStore
export type ColumnData = {
  name: string;
  type: SQLDataType;
  isNullable: boolean;
  isPrimary: boolean;
  // Using `string | null` instead of optional `?`
  // because default value can be added, which throws controlled type error
  defaultValue: string | null;
};

export type InnerReference = {
  PrimaryKeyName: string;
  PrimaryKeyTableName: string;
  ReferencesPropertyName: string;
  ReferencesTableName: string;
  IsDestination: boolean;
  constraintName: string;
};

export interface ColumnSchema {
  Name: string;
  Value: string | null;
  TableName: string;
  References: InnerReference[];
  IsPrimaryKey: boolean;
  IsForeignKey: boolean;
  field_name: string;
  data_type: SQLDataType;
  additional_constraints: 'NULL' | 'NOT NULL' | 'PRIMARY' | 'UNIQUE' | '';
}

// these are for data tables ######################
export type RowsOfData = {
  [key: string | number]: string | number | boolean | null;
};

export type DataStore = {
  [TableName: string]: RowsOfData[];
};

export type FlowState = {
  edges: any[];
  setEdges: (eds: any) => void;
  nodes: any[];
  setNodes: (nds: any) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
};

export interface Table {
  [key: string]: ColumnSchema;
}

export interface SchemaObject {
  [key: string]: Table;
}

export type SQLDataType =
  | 'SERIAL'
  | 'SMALLSERIAL'
  | 'BIGSERIAL'
  | 'INT'
  | 'INT2'
  | 'INT4'
  | 'INT8'
  | 'SMALLINT'
  | 'INTEGER'
  | 'BIGINT'
  | 'DECIMAL'
  | 'NUMERIC'
  | 'REAL'
  | 'FLOAT'
  | 'FLOAT4'
  | 'FLOAT8'
  | 'DOUBLE PRECISION'
  | 'MONEY'
  | 'CHARACTER VARYING(8)'
  | 'VARCHAR(255)'
  | 'CHARACTER(8)'
  | 'CHAR(8)'
  | 'TEXT'
  | 'CITEXT'
  | 'HSTORE'
  | 'BYTEA'
  | 'BIT'
  | 'VARBIT'
  | 'BIT VARYING'
  | 'TIMETZ'
  | 'TIMESTAMPTZ'
  | 'TIMESTAMP'
  | 'TIMESTAMP WITHOUT TIME ZONE'
  | 'TIMESTAMP WITH TIME ZONE'
  | 'DATE'
  | 'TIME'
  | 'TIME WITHOUT TIME ZONE'
  | 'TIME WITH TIME ZONE'
  | 'INTERVAL'
  | 'BOOL'
  | 'BOOLEAN'
  | 'ENUM'
  | 'POINT'
  | 'LINE'
  | 'LSEG'
  | 'BOX'
  | 'PATH'
  | 'POLYGON'
  | 'CIRCLE'
  | 'CIDR'
  | 'INET'
  | 'MACADDR'
  | 'TSVECTOR'
  | 'TSQUERY'
  | 'UUID'
  | 'XML'
  | 'JSON'
  | 'JSONB'
  | 'INT4RANGE'
  | 'INT8RANGE'
  | 'NUMRANGE'
  | 'TSRANGE'
  | 'TSTZRANGE'
  | 'DATERANGE'
  | 'GEOMETRY'
  | 'GEOGRAPHY'
  | 'CUBE'
  | 'LTREE';