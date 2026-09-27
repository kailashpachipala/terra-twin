# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListMyFarms*](#listmyfarms)
  - [*GetFieldMetrics*](#getfieldmetrics)
- [**Mutations**](#mutations)
  - [*CreateFarm*](#createfarm)
  - [*CreateScoutingTask*](#createscoutingtask)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListMyFarms
You can execute the `ListMyFarms` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMyFarms(options?: ExecuteQueryOptions): QueryPromise<ListMyFarmsData, undefined>;

interface ListMyFarmsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMyFarmsData, undefined>;
}
export const listMyFarmsRef: ListMyFarmsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyFarms(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMyFarmsData, undefined>;

interface ListMyFarmsRef {
  ...
  (dc: DataConnect): QueryRef<ListMyFarmsData, undefined>;
}
export const listMyFarmsRef: ListMyFarmsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyFarmsRef:
```typescript
const name = listMyFarmsRef.operationName;
console.log(name);
```

### Variables
The `ListMyFarms` query has no variables.
### Return Type
Recall that executing the `ListMyFarms` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyFarmsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMyFarmsData {
  farms: ({
    id: UUIDString;
    name: string;
    totalAcreage?: number | null;
    fields_on_farm: ({
      name: string;
      cropType: string;
    })[];
  } & Farm_Key)[];
}
```
### Using `ListMyFarms`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyFarms } from '@dataconnect/generated';


// Call the `listMyFarms()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyFarms();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyFarms(dataConnect);

console.log(data.farms);

// Or, you can use the `Promise` API.
listMyFarms().then((response) => {
  const data = response.data;
  console.log(data.farms);
});
```

### Using `ListMyFarms`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyFarmsRef } from '@dataconnect/generated';


// Call the `listMyFarmsRef()` function to get a reference to the query.
const ref = listMyFarmsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyFarmsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.farms);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.farms);
});
```

## GetFieldMetrics
You can execute the `GetFieldMetrics` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getFieldMetrics(vars: GetFieldMetricsVariables, options?: ExecuteQueryOptions): QueryPromise<GetFieldMetricsData, GetFieldMetricsVariables>;

interface GetFieldMetricsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFieldMetricsVariables): QueryRef<GetFieldMetricsData, GetFieldMetricsVariables>;
}
export const getFieldMetricsRef: GetFieldMetricsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getFieldMetrics(dc: DataConnect, vars: GetFieldMetricsVariables, options?: ExecuteQueryOptions): QueryPromise<GetFieldMetricsData, GetFieldMetricsVariables>;

interface GetFieldMetricsRef {
  ...
  (dc: DataConnect, vars: GetFieldMetricsVariables): QueryRef<GetFieldMetricsData, GetFieldMetricsVariables>;
}
export const getFieldMetricsRef: GetFieldMetricsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getFieldMetricsRef:
```typescript
const name = getFieldMetricsRef.operationName;
console.log(name);
```

### Variables
The `GetFieldMetrics` query requires an argument of type `GetFieldMetricsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetFieldMetricsVariables {
  fieldId: UUIDString;
}
```
### Return Type
Recall that executing the `GetFieldMetrics` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetFieldMetricsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetFieldMetricsData {
  satelliteMetrics: ({
    timestamp: TimestampString;
    ndviScore: number;
    soilMoistureIndex: number;
    alertTriggered?: boolean | null;
  })[];
}
```
### Using `GetFieldMetrics`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getFieldMetrics, GetFieldMetricsVariables } from '@dataconnect/generated';

// The `GetFieldMetrics` query requires an argument of type `GetFieldMetricsVariables`:
const getFieldMetricsVars: GetFieldMetricsVariables = {
  fieldId: ..., 
};

// Call the `getFieldMetrics()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getFieldMetrics(getFieldMetricsVars);
// Variables can be defined inline as well.
const { data } = await getFieldMetrics({ fieldId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getFieldMetrics(dataConnect, getFieldMetricsVars);

console.log(data.satelliteMetrics);

// Or, you can use the `Promise` API.
getFieldMetrics(getFieldMetricsVars).then((response) => {
  const data = response.data;
  console.log(data.satelliteMetrics);
});
```

### Using `GetFieldMetrics`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getFieldMetricsRef, GetFieldMetricsVariables } from '@dataconnect/generated';

// The `GetFieldMetrics` query requires an argument of type `GetFieldMetricsVariables`:
const getFieldMetricsVars: GetFieldMetricsVariables = {
  fieldId: ..., 
};

// Call the `getFieldMetricsRef()` function to get a reference to the query.
const ref = getFieldMetricsRef(getFieldMetricsVars);
// Variables can be defined inline as well.
const ref = getFieldMetricsRef({ fieldId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getFieldMetricsRef(dataConnect, getFieldMetricsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.satelliteMetrics);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.satelliteMetrics);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateFarm
You can execute the `CreateFarm` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createFarm(vars: CreateFarmVariables): MutationPromise<CreateFarmData, CreateFarmVariables>;

interface CreateFarmRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFarmVariables): MutationRef<CreateFarmData, CreateFarmVariables>;
}
export const createFarmRef: CreateFarmRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createFarm(dc: DataConnect, vars: CreateFarmVariables): MutationPromise<CreateFarmData, CreateFarmVariables>;

interface CreateFarmRef {
  ...
  (dc: DataConnect, vars: CreateFarmVariables): MutationRef<CreateFarmData, CreateFarmVariables>;
}
export const createFarmRef: CreateFarmRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createFarmRef:
```typescript
const name = createFarmRef.operationName;
console.log(name);
```

### Variables
The `CreateFarm` mutation requires an argument of type `CreateFarmVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateFarmVariables {
  name: string;
  totalAcreage: number;
  locationGeometry: string;
}
```
### Return Type
Recall that executing the `CreateFarm` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateFarmData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateFarmData {
  farm_insert: Farm_Key;
}
```
### Using `CreateFarm`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createFarm, CreateFarmVariables } from '@dataconnect/generated';

// The `CreateFarm` mutation requires an argument of type `CreateFarmVariables`:
const createFarmVars: CreateFarmVariables = {
  name: ..., 
  totalAcreage: ..., 
  locationGeometry: ..., 
};

// Call the `createFarm()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createFarm(createFarmVars);
// Variables can be defined inline as well.
const { data } = await createFarm({ name: ..., totalAcreage: ..., locationGeometry: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createFarm(dataConnect, createFarmVars);

console.log(data.farm_insert);

// Or, you can use the `Promise` API.
createFarm(createFarmVars).then((response) => {
  const data = response.data;
  console.log(data.farm_insert);
});
```

### Using `CreateFarm`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createFarmRef, CreateFarmVariables } from '@dataconnect/generated';

// The `CreateFarm` mutation requires an argument of type `CreateFarmVariables`:
const createFarmVars: CreateFarmVariables = {
  name: ..., 
  totalAcreage: ..., 
  locationGeometry: ..., 
};

// Call the `createFarmRef()` function to get a reference to the mutation.
const ref = createFarmRef(createFarmVars);
// Variables can be defined inline as well.
const ref = createFarmRef({ name: ..., totalAcreage: ..., locationGeometry: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createFarmRef(dataConnect, createFarmVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.farm_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.farm_insert);
});
```

## CreateScoutingTask
You can execute the `CreateScoutingTask` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createScoutingTask(vars: CreateScoutingTaskVariables): MutationPromise<CreateScoutingTaskData, CreateScoutingTaskVariables>;

interface CreateScoutingTaskRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateScoutingTaskVariables): MutationRef<CreateScoutingTaskData, CreateScoutingTaskVariables>;
}
export const createScoutingTaskRef: CreateScoutingTaskRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createScoutingTask(dc: DataConnect, vars: CreateScoutingTaskVariables): MutationPromise<CreateScoutingTaskData, CreateScoutingTaskVariables>;

interface CreateScoutingTaskRef {
  ...
  (dc: DataConnect, vars: CreateScoutingTaskVariables): MutationRef<CreateScoutingTaskData, CreateScoutingTaskVariables>;
}
export const createScoutingTaskRef: CreateScoutingTaskRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createScoutingTaskRef:
```typescript
const name = createScoutingTaskRef.operationName;
console.log(name);
```

### Variables
The `CreateScoutingTask` mutation requires an argument of type `CreateScoutingTaskVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateScoutingTaskVariables {
  fieldId: UUIDString;
  status: string;
  priority: string;
  dueDate: TimestampString;
}
```
### Return Type
Recall that executing the `CreateScoutingTask` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateScoutingTaskData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateScoutingTaskData {
  scoutingTask_insert: ScoutingTask_Key;
}
```
### Using `CreateScoutingTask`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createScoutingTask, CreateScoutingTaskVariables } from '@dataconnect/generated';

// The `CreateScoutingTask` mutation requires an argument of type `CreateScoutingTaskVariables`:
const createScoutingTaskVars: CreateScoutingTaskVariables = {
  fieldId: ..., 
  status: ..., 
  priority: ..., 
  dueDate: ..., 
};

// Call the `createScoutingTask()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createScoutingTask(createScoutingTaskVars);
// Variables can be defined inline as well.
const { data } = await createScoutingTask({ fieldId: ..., status: ..., priority: ..., dueDate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createScoutingTask(dataConnect, createScoutingTaskVars);

console.log(data.scoutingTask_insert);

// Or, you can use the `Promise` API.
createScoutingTask(createScoutingTaskVars).then((response) => {
  const data = response.data;
  console.log(data.scoutingTask_insert);
});
```

### Using `CreateScoutingTask`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createScoutingTaskRef, CreateScoutingTaskVariables } from '@dataconnect/generated';

// The `CreateScoutingTask` mutation requires an argument of type `CreateScoutingTaskVariables`:
const createScoutingTaskVars: CreateScoutingTaskVariables = {
  fieldId: ..., 
  status: ..., 
  priority: ..., 
  dueDate: ..., 
};

// Call the `createScoutingTaskRef()` function to get a reference to the mutation.
const ref = createScoutingTaskRef(createScoutingTaskVars);
// Variables can be defined inline as well.
const ref = createScoutingTaskRef({ fieldId: ..., status: ..., priority: ..., dueDate: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createScoutingTaskRef(dataConnect, createScoutingTaskVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.scoutingTask_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.scoutingTask_insert);
});
```

