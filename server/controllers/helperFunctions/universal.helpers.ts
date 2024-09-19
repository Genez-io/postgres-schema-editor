import { RequestHandler, Request, Response, NextFunction } from 'express';
import pg from 'pg'
const { Pool } = pg
const pools:any = {};

// HELPER FUNCTIONS FOR THE HELPER FUNCTIONS

interface NewColumn {
  name: string;
  type: string;
  isNullable: boolean;
  isPrimary: boolean;
  defaultValue: any;
}

class Pool2 extends Pool{
  constructor(d: any) {
    super(d);
  }
  override async query(query: any, values?: any): Promise<any> {
    // Add any additional logic here if needed
    console.log("query: ", query);
    if (values)
      console.log("values: ", values);

    const q = await super.query(query, values);
    if (q.rows)
      return q.rows;
    return q;
  }
}

//---------------CONNECT TO THE DATABASE-----------------------------------------------------------------------------------------
export const dbConnect = async (req: Request) => {
  const authToken = req.headers.authorization?.split(' ')[1];
  if (!authToken) {
    throw new Error('No authorization token provided');
  }

  const dbId = req.headers['db-id'] as string;

  if (!dbId) {
    throw new Error('No database name provided');
  }

  if (!pools[authToken]) {
    pools[authToken] = {};
  }

  if (pools[authToken][dbId]) {
    return pools[authToken][dbId];
  }

  const requestUrl = 'https://'+process.env.API_URL+'/databases/' + dbId;
  const requestHeaders = {
    'Authorization': 'Bearer ' + authToken,
    'Accept-Version': 'genezio-webapp/0.3.0'
  };

  const response:any = await fetch(requestUrl, {headers: requestHeaders});

  if (!response.ok) {
    // Handle HTTP errors
    console.error(requestUrl, requestHeaders);
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
 
  const data = await response.json();

  pools[authToken][dbId] = new Pool2({
    connectionString: data.connectionUrl,
    ssl: true,
  });

  return pools[authToken][dbId];

};

export const query: RequestHandler = async (
  req: Request,
  _res: Response,
  next
) => {
  const dbDataSource = await dbConnect(req);
  const { query } = req.body;

  const result = await dbDataSource.query(query);
  return result;
}

export const tableSchema = async (req: Request, tName: string) => {
  const dbDataSource = await dbConnect(req);
  
  // Run the query to fetch column names
  const result = await dbDataSource.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = $1", 
    [tName]
  );
  
  // Extract and return only the column names as an array
  const columnNames = result.map((row: { column_name: string }) => row.column_name);
  
  return columnNames;
};
//-------------------------------------DATA TABLE ROWS----------------------------------------------------------------------------------------
//-------------------ADD NEW ROW-----------------------------------------------------------------------------------------

export const addNewDbRow: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const dbDataSource = await dbConnect(req);
  const { newRow, tableName } = req.body;

  try {

    const keys: string = Object.keys(newRow)
      .map((key) => `"${key}"`)
      .join(', ');

    const values = Object.values(newRow);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO "${tableName}" (${keys}) VALUES (${placeholders})`;

    const dbAddedRow = await dbDataSource.query(query, values);

    console.log('dbAddedRow in helper: ', dbAddedRow);
    return;
  } catch (err: unknown) {
    console.log('Error occurred in the addNewDbRow middleware: ', err);
    return next(err);
  }
};

//-----------------UPDATE ROW--------------------------------------------------------------------------------------------------
export const updateRow: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const dbDataSource = await dbConnect(req);
  const { newRow, tableName, primaryKey } = req.body;

  try {
    const updateKeys = Object.keys(newRow);
    const updateValues = Object.values(newRow);

    // Create the SET clause using parameterized query placeholders
    const setClause = updateKeys
      .map((key, index) => `"${key}" = $${index + 1}`)
      .join(', ');

    // Add values for the parameterized query
    const values = [...updateValues];

    let query = `UPDATE "${tableName}" SET ${setClause}`;

    if (primaryKey) {
      const primaryKeyName = Object.keys(primaryKey)[0];
      const primaryKeyValue = Object.values(primaryKey)[0];

      // Add primary key value as the next parameter for the query
      values.push(primaryKeyValue);

      query += ` WHERE "${primaryKeyName}" = $${values.length}`;
    }

    const dbUpdatedRow = await dbDataSource.query(query, values);

    return dbUpdatedRow;
  } catch (err: unknown) {
    console.log('Error occurred in the updateRow middleware: ', err);
    return next(err);
  }
};

//----------------DELETE ROW----------------------------------------------------------------------------------------------------

export const deleteRow: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const dbDataSource = await dbConnect(req);
  const { value, tableName } = req.body;

  try {
    // Prepare key-value pairs for the DELETE condition, excluding null values
    const deleteEntries = Object.entries(value).filter(([_key, value]) => value !== null);
    const deleteKeys = deleteEntries.map(([key, _value]) => key);
    const values = deleteEntries.map(([_key, value]) => value);

    // Create the WHERE clause using parameterized placeholders
    const conditions = deleteKeys
      .map((key, index) => `"${key}" = $${index + 1}`)
      .join(' AND ');

    const query = `DELETE FROM "${tableName}" WHERE ${conditions}`;

    // Use parameterized query with pg
    await dbDataSource.query(query, values);

    return;
  } catch (err: unknown) {
    console.log('Error occurred in the deleteRow middleware: ', err instanceof Error ? err.message : err);
    return next(err);
  }
};

//-------------------------------------SCHEMA TABLE COLUMNS--------------------------------------------------------------------------------------------
//----------------ADD NEW COLUMN--------------------------------------------------------------------------------------------------

export const addNewDbColumn: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const dbDataSource = await dbConnect(req);
  const { columnData, tableName } = req.body;

  try {
    let keyValueString: string = '';
    let newColumnString: string = '';

    columnData.forEach((el: NewColumn) => {
      keyValueString += `ADD COLUMN ${
        `"${el.name}"`
      } ${el.type === 'AUTO_INCREMENT' ? 'INT' : el.type}${
        el.isPrimary ? ' PRIMARY KEY' : ''
      }${el.isNullable ? '' : ' NOT NULL'}${
        el.defaultValue ? ` DEFAULT ${el.defaultValue}` : ''
      }${el.type === 'AUTO_INCREMENT' ? ' AUTO_INCREMENT' : ''}, `;
    });

    newColumnString = keyValueString.slice(0, -2);

    const addedNewColumn: Promise<unknown> = await dbDataSource.query(`
      ALTER TABLE "${tableName}"
      ${newColumnString}
      `);

    console.log('addedForeignKey in helper: ', addedNewColumn);
    return addedNewColumn;
  } catch (err: unknown) {
    console.log('Database has been disconnected');
    return next(err);
  }
};

//-----------------UPDATE COLUMN---------------------------------------------------------------------------------------------
// Currently does not work
export const updateDbColumn: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const dbDataSource = await dbConnect(req);
  const { columnName, columnData, tableName } = req.body;

  if (!columnData.additional_constraints)
    return;

  try {
    const query = `
      ALTER TABLE "${tableName}"
      ALTER COLUMN "${columnName}" SET
      ${columnData.additional_constraints};`;
    await dbDataSource.query(query);
    console.log('updatedColumn in helper');

    return;
  } catch (err: unknown) {
    console.log('Error occurred in the addedForeignKey middleware: ', err);
    return next(err);
  }
};

//-------------DELETE COLUMN-------------------------------------------------------------------------------------------------

export const deleteColumn: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const dbDataSource = await dbConnect(req);
  const { columnName, tableName, constraintName } = req.body;

  try {
    if (constraintName) {
      let query = `
        ALTER TABLE "${tableName}" 
        DROP CONSTRAINT ${constraintName};
        `;
      await dbDataSource.query(query);
    }

    const deletedColumn: Promise<unknown> = await dbDataSource.query(`
      ALTER TABLE "${tableName}"
      DROP COLUMN ${columnName};
      `);

    console.log('deletedColumn in helper: ', deletedColumn);
    return deletedColumn;
  } catch (err: unknown) {
    console.log('Error occurred in the addNewTable middleware364: ', err);
    return next(err);
  }
};

//---------------------------DATABASE TABLES--------------------------------------------------------------------------------------------------------
//--------------ADD NEW TABLE--------------------------------------------------------------------------------------------------

export const addNewTable: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const dbDataSource = await dbConnect(req);
  const { newColumns, tableName } = req.body;

  try {
    let keyValueString: string = '';
    newColumns.forEach((el: NewColumn) => {
      keyValueString += `"${el.name}" ${el.type}${el.isPrimary ? ' PRIMARY KEY' : ''}${
        el.isNullable ? '' : ' NOT NULL'
      }, `;
    });

    const newTableColumnString: string = keyValueString.slice(0, -2);

    await dbDataSource.query(`
      CREATE TABLE "${tableName}" (
      ${newTableColumnString}
      )`);

    return;
  } catch (err: unknown) {
    console.log('Error occurred in the addNewTable middleware401: ', err);
    return next(err);
  }
};

//--------------GET ALL TABLE NAMES--------------------------------------------------------------------------------------------
export const getTableNames: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const dbDataSource = await dbConnect(req);
  try {
    let query: string = "SELECT tableName FROM pg_catalog.pg_tables WHERE schemaname = 'public'"; // Postgres

    const tableNameList: any = await dbDataSource.query(query);

    const tables: (string | undefined)[] = tableNameList.map((obj: any) => {
      return obj.tablename; // Postgres
    });

    return tables;
  } catch (err: unknown) {
    console.log('Error occurred in the addNewTable middleware463: ', err);
    return next(err);
  }
};

//--------------DELETE TABLE---------------------------------------------------------------------------------------------------

export const deleteTable: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const dbDataSource = await dbConnect(req);
  const { tableName } = req.body;

  try {
    const deletedTable: Promise<unknown> = await dbDataSource.query(
      `DROP TABLE ${tableName} CASCADE`
    );

    console.log('deletedTable in helper: ', deletedTable);
    return deletedTable;
  } catch (err: unknown) {
    console.log('Error occurred in the addNewTable middleware491: ', err);
    return next(err);
  }
};

//------------------------------------------FOREIGN KEYS----------------------------------------------------------------------------------------------
//--------------ADD NEW FOREIGN KEY----------------------------------------------------------------------------------------------

export const addForeignKey: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const dbDataSource = await dbConnect(req);
  const {
    PrimaryKeyTableName,
    PrimaryKeyColumnName,
    ForeignKeyTableName,
    ForeignKeyColumnName,
    constraintName,
  } = req.body;

  try {
    const addedForeignKey: Promise<unknown> = await dbDataSource.query(`
      ALTER TABLE "${ForeignKeyTableName}"
      ADD CONSTRAINT ${constraintName}
      FOREIGN KEY ("${`${ForeignKeyColumnName}`}")
      REFERENCES "${PrimaryKeyTableName}" ("${`${PrimaryKeyColumnName}`}")
      `);

    console.log('addedForeignKey in helper: ', addedForeignKey);
    return addedForeignKey;
  } catch (err: unknown) {
    console.log('Error occurred in the addedForeignKey middleware: ', err);
    return next(err);
  }
};

//----------------REMOVE FOREIGN KEY--------------------------------------------------------------------------------------------
// This does not currently work
export const removeForeignKey: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const dbDataSource = await dbConnect(req);
  const { tableName, constraintName } = req.body;

  try {
    const removedForeignKey: Promise<unknown> = await dbDataSource.query(`
      ALTER TABLE ${tableName}
      DROP 'CONSTRAINT' ${constraintName}
      `);

    console.log('addedForeignKey in helper: ', removedForeignKey);
    return removedForeignKey;
  } catch (err: unknown) {
    console.log('Error occurred in the removedForeignKey middleware: ', err);
    return next(err);
  }
};

//------------------------------------------------------------------------------------------------------------
