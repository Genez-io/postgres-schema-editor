export default function DataTypeOptions() {
  const dataTypeArr: string[] = [
    'bigint',
    'bigserial',
    'bit',
    'bit varying',
    'boolean',
    'bool',
    'box',
    'bytea',
    'char',
    'character',
    'character varying',
    'cidr',
    'circle',
    'date',
    'decimal',
    'double precision',
    'float4',
    'float8',
    'inet',
    'int',
    'int2',
    'int4',
    'int8',
    'integer',
    'interval',
    'json',
    'jsonb',
    'line',
    'lseg',
    'macaddr',
    'macaddr8',
    'money',
    'numeric',
    'path',
    'pg_lsn',
    'pg_snapshot',
    'point',
    'polygon',
    'real',
    'serial',
    'serial2',
    'serial4',
    'smallint',
    'smallserial',
    'text',
    'time',
    'timetz',
    'timestamp',
    'timestamptz',
    'tsquery',
    'tsvector',
    'txid_snapshot',
    'uuid',
    'xml',
  ]

  const optionsArr = dataTypeArr.map((dataType) => (
    // populate the options for data type
    // `selected` attribute will default select the type that matches props.type
    <option key={dataType} value={dataType}>
      {dataType}
    </option>
  ));
  return <>{optionsArr}</>;
}
