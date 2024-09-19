export type DefaultErr = {
  log: string;
  status: number;
  message: string;
};

export interface RefObj {
  IsDestination: boolean;
  PrimaryKeyName: string;
  PrimaryKeyTableName: string;
  ReferencesPropertyName: string;
  ReferencesTableName: string;
  constraintName: string;
}

export interface TableColumn {
  Field?: string;
  Type?: string;
  Null?: string;
  Key?: string;
  Default?: any;
  Extra?: string;
  References?: RefObj[];
  TableName?: string;
  IsForeignKey?: boolean;
  IsPrimaryKey?: boolean;
  Value?: null;
  additional_constraints?: string | null;
  data_type?: string;
  field_name?: string;
  Name?: string;
  [key: string]: any;
  update_rule?: string;
  delete_rule?: string;
  default_type?: string;
}

export interface TableColumns {
  [columnName: string]: TableColumn;
}

export interface TableSchema {
  [tableName: string]: TableColumns;
}